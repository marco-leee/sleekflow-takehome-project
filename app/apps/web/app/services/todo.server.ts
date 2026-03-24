import {
  and,
  asc,
  count,
  desc,
  eq,
  exists,
  inArray,
  isNull,
  ne,
  not,
  sql,
  type SQL,
} from "drizzle-orm"
import { alias } from "drizzle-orm/pg-core"
import { z } from "zod"
import {
  recurrenceSchema,
  recurrenceTypeSchema,
  todoPrioritySchema,
  todoSortFieldSchema,
  todoStatusSchema,
} from "../../lib/models"
import { getDb } from "../db/client.server"
import { todoDependencies, todoItems } from "../db/schema"

type DbClient = ReturnType<typeof getDb>

const listQuerySchema = z.object({
  status: z.array(todoStatusSchema).optional(),
  priority: z.array(todoPrioritySchema).optional(),
  due_date_from: z.string().datetime().optional(),
  due_date_to: z.string().datetime().optional(),
  dependency_state: z.enum(["blocked", "unblocked"]).optional(),
  sort_by: todoSortFieldSchema.optional().default("due_date"),
  sort_direction: z.enum(["asc", "desc"]).optional().default("asc"),
  page: z.coerce.number().int().positive().optional().default(1),
  page_size: z.coerce.number().int().positive().max(100).optional().default(20),
  search: z.string().trim().optional(),
})

const recurrenceConfigValueSchema = z.object({
  interval: z.number().int().positive(),
  unit: z.enum(["day", "week", "month"]),
})

const recurrenceConfigSchema = recurrenceConfigValueSchema.optional()

const createTodoSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().min(1),
  due_date: z.string().datetime(),
  status: todoStatusSchema,
  priority: todoPrioritySchema,
  recurrence_type: recurrenceTypeSchema.nullable().optional(),
  recurrence_config: recurrenceConfigSchema,
  dependencies: z.array(z.string().min(1)).optional().default([]),
})

const updateTodoSchema = createTodoSchema.extend({
  updated_at: z.string().datetime(),
})

type TodoRow = {
  id: string
  name: string
  description: string
  due_date: string
  status: z.infer<typeof todoStatusSchema>
  priority: z.infer<typeof todoPrioritySchema>
  dependency_ids: string[]
  recurrence?: z.infer<typeof recurrenceSchema>
  created_at: string
  updated_at: string
  deleted_at: string | null
}

type ServiceErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RULE_VIOLATION"

export class ServiceError extends Error {
  code: ServiceErrorCode
  details?: unknown

  constructor(code: ServiceErrorCode, message: string, details?: unknown) {
    super(message)
    this.code = code
    this.details = details
  }
}

let schemaReady = false

function parseRecurrenceType(value: unknown) {
  if (value === null || value === undefined || value === "none") {
    return null
  }

  return recurrenceTypeSchema.parse(value)
}

function addRecurrence(date: Date, type: string | null, config: unknown) {
  if (!type) return null

  const next = new Date(date)
  if (type === "daily") {
    next.setDate(next.getDate() + 1)
    return next
  }
  if (type === "weekly") {
    next.setDate(next.getDate() + 7)
    return next
  }
  if (type === "monthly") {
    next.setMonth(next.getMonth() + 1)
    return next
  }

  const parsedConfig = recurrenceConfigValueSchema.safeParse(config)
  if (!parsedConfig.success) {
    throw new ServiceError(
      "VALIDATION_ERROR",
      "Invalid recurrence_config for custom recurrence",
      parsedConfig.error.flatten()
    )
  }

  const { interval, unit } = parsedConfig.data
  if (unit === "day") next.setDate(next.getDate() + interval)
  if (unit === "week") next.setDate(next.getDate() + interval * 7)
  if (unit === "month") next.setMonth(next.getMonth() + interval)
  return next
}

function buildRecurrence(
  recurrenceType: string | null,
  recurrenceConfig: unknown
): z.infer<typeof recurrenceSchema> | undefined {
  if (!recurrenceType) return undefined
  if (recurrenceType === "custom") {
    const parsed = recurrenceConfigValueSchema.safeParse(recurrenceConfig)
    if (!parsed.success) return undefined
    return { type: "custom", custom: parsed.data }
  }
  return { type: recurrenceType as "daily" | "weekly" | "monthly" }
}

function toTodoRow(
  row: typeof todoItems.$inferSelect,
  dependencyIds: string[]
): TodoRow {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    due_date: row.dueDate,
    status: row.status as z.infer<typeof todoStatusSchema>,
    priority: row.priority as z.infer<typeof todoPrioritySchema>,
    dependency_ids: dependencyIds,
    recurrence: buildRecurrence(row.recurrenceType, row.recurrenceConfig),
    created_at: row.createdAt,
    updated_at: row.updatedAt,
    deleted_at: row.deletedAt ?? null,
  }
}

async function mapTodoRows(db: DbClient, ids: string[]): Promise<TodoRow[]> {
  if (ids.length === 0) return []

  const baseRows = await db.select().from(todoItems).where(inArray(todoItems.id, ids))

  const depRows = await db
    .select({
      todoId: todoDependencies.todoId,
      dependsOnTodoId: todoDependencies.dependsOnTodoId,
    })
    .from(todoDependencies)
    .where(inArray(todoDependencies.todoId, ids))

  const depMap = new Map<string, string[]>()
  for (const r of depRows) {
    const list = depMap.get(r.todoId) ?? []
    list.push(r.dependsOnTodoId)
    depMap.set(r.todoId, list)
  }

  return baseRows.map((row) => toTodoRow(row, depMap.get(row.id) ?? []))
}

async function validateDependencies(
  db: DbClient,
  todoId: string | null,
  dependencies: string[]
) {
  if (dependencies.length === 0) return

  if (todoId && dependencies.includes(todoId)) {
    throw new ServiceError("RULE_VIOLATION", "A todo cannot depend on itself")
  }

  const rows = await db
    .select({ id: todoItems.id })
    .from(todoItems)
    .where(and(inArray(todoItems.id, dependencies), isNull(todoItems.deletedAt)))

  if (rows.length !== dependencies.length) {
    throw new ServiceError("VALIDATION_ERROR", "Some dependencies are invalid or deleted")
  }
}

async function ensureNoUnmetDependencies(db: DbClient, todoId: string) {
  const dep = alias(todoItems, "dep_unmet")
  const rows = await db
    .select({ n: count() })
    .from(todoDependencies)
    .innerJoin(dep, eq(todoDependencies.dependsOnTodoId, dep.id))
    .where(
      and(
        eq(todoDependencies.todoId, todoId),
        isNull(dep.deletedAt),
        ne(dep.status, "Completed")
      )
    )

  const n = Number(rows[0]?.n ?? 0)
  if (n > 0) {
    throw new ServiceError(
      "RULE_VIOLATION",
      "Todo with unmet dependencies cannot transition to In Progress"
    )
  }
}

export async function ensureTodoSchema() {
  if (schemaReady) return
  const db = getDb()
  await db.execute(sql.raw(`
    CREATE TABLE IF NOT EXISTS todo_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      due_date TIMESTAMPTZ NOT NULL,
      status TEXT NOT NULL,
      priority TEXT NOT NULL,
      recurrence_type TEXT NULL,
      recurrence_config JSONB NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      deleted_at TIMESTAMPTZ NULL
    );

    CREATE TABLE IF NOT EXISTS todo_dependencies (
      todo_id UUID NOT NULL REFERENCES todo_items(id) ON DELETE CASCADE,
      depends_on_todo_id UUID NOT NULL REFERENCES todo_items(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT unique_todo_dependency UNIQUE (todo_id, depends_on_todo_id)
    );

    CREATE INDEX IF NOT EXISTS idx_todo_items_deleted_at ON todo_items(deleted_at);
    CREATE INDEX IF NOT EXISTS idx_todo_items_due_date ON todo_items(due_date);
    CREATE INDEX IF NOT EXISTS idx_todo_items_status ON todo_items(status);
    CREATE INDEX IF NOT EXISTS idx_todo_items_priority ON todo_items(priority);
    CREATE INDEX IF NOT EXISTS idx_todo_dependencies_todo_id ON todo_dependencies(todo_id);
    CREATE INDEX IF NOT EXISTS idx_todo_dependencies_depends_on ON todo_dependencies(depends_on_todo_id);
  `))

  schemaReady = true
}

export async function listTodos(rawQuery: unknown) {
  const query = listQuerySchema.parse(rawQuery)
  const db = getDb()
  const parts: SQL[] = [isNull(todoItems.deletedAt)]

  if (query.status && query.status.length > 0) {
    parts.push(inArray(todoItems.status, query.status))
  }
  if (query.priority && query.priority.length > 0) {
    parts.push(inArray(todoItems.priority, query.priority))
  }
  if (query.due_date_from) {
    parts.push(sql`${todoItems.dueDate} >= ${query.due_date_from}::timestamptz`)
  }
  if (query.due_date_to) {
    parts.push(sql`${todoItems.dueDate} <= ${query.due_date_to}::timestamptz`)
  }
  if (query.search) {
    parts.push(
      sql`to_tsvector('simple', ${todoItems.name} || ' ' || ${todoItems.description}) @@ plainto_tsquery('simple', ${query.search})`
    )
  }

  if (query.dependency_state === "blocked") {
    const depState = alias(todoItems, "dep_state")
    parts.push(
      exists(
        db
          .select({ one: sql`1` })
          .from(todoDependencies)
          .innerJoin(depState, eq(todoDependencies.dependsOnTodoId, depState.id))
          .where(
            and(
              eq(todoDependencies.todoId, todoItems.id),
              isNull(depState.deletedAt),
              ne(depState.status, "Completed")
            )
          )
      )
    )
  } else if (query.dependency_state === "unblocked") {
    const depState = alias(todoItems, "dep_state_u")
    parts.push(
      not(
        exists(
          db
            .select({ one: sql`1` })
            .from(todoDependencies)
            .innerJoin(depState, eq(todoDependencies.dependsOnTodoId, depState.id))
            .where(
              and(
                eq(todoDependencies.todoId, todoItems.id),
                isNull(depState.deletedAt),
                ne(depState.status, "Completed")
              )
            )
        )
      )
    )
  }

  const whereClause = and(...parts)!

  const orderCol =
    query.sort_by === "name"
      ? todoItems.name
      : query.sort_by === "priority"
        ? todoItems.priority
        : query.sort_by === "status"
          ? todoItems.status
          : todoItems.dueDate
  const orderFn = query.sort_direction === "desc" ? desc : asc

  const offset = (query.page - 1) * query.page_size

  const listRows = await db
    .select({ id: todoItems.id })
    .from(todoItems)
    .where(whereClause)
    .orderBy(orderFn(orderCol), desc(todoItems.createdAt))
    .limit(query.page_size)
    .offset(offset)

  const totalRows = await db
    .select({ total: count() })
    .from(todoItems)
    .where(whereClause)

  const items = await mapTodoRows(
    db,
    listRows.map((r) => r.id)
  )

  return {
    items,
    page: query.page,
    page_size: query.page_size,
    total: Number(totalRows[0]?.total ?? 0),
  }
}

export async function getTodoById(id: string) {
  const db = getDb()
  const items = await mapTodoRows(db, [id])
  const todo = items.find((item) => item.id === id && item.deleted_at === null)
  if (!todo) {
    throw new ServiceError("NOT_FOUND", "Todo not found")
  }
  return todo
}

export async function createTodo(rawBody: unknown) {
  const body = createTodoSchema.parse(rawBody)
  const db = getDb()
  const todoId = await db.transaction(async (tx) => {
    const recurrenceType = parseRecurrenceType(body.recurrence_type ?? null)
    await validateDependencies(tx, null, body.dependencies)

    const [inserted] = await tx
      .insert(todoItems)
      .values({
        name: body.name,
        description: body.description,
        dueDate: body.due_date,
        status: body.status,
        priority: body.priority,
        recurrenceType,
        recurrenceConfig: body.recurrence_config ?? null,
      })
      .returning({ id: todoItems.id })

    const nextTodoId = inserted.id
    if (body.status === "In Progress") {
      await ensureNoUnmetDependencies(tx, nextTodoId)
    }

    if (body.dependencies.length > 0) {
      await tx.insert(todoDependencies).values(
        body.dependencies.map((depId) => ({
          todoId: nextTodoId,
          dependsOnTodoId: depId,
        }))
      )
    }
    return nextTodoId
  })
  return await getTodoById(todoId)
}

export async function updateTodo(id: string, rawBody: unknown) {
  const body = updateTodoSchema.parse(rawBody)
  const db = getDb()
  await db.transaction(async (tx) => {
    const [row] = await tx
      .select({
        updatedAt: todoItems.updatedAt,
        deletedAt: todoItems.deletedAt,
      })
      .from(todoItems)
      .where(eq(todoItems.id, id))
      .for("update")

    if (!row || row.deletedAt != null) {
      throw new ServiceError("NOT_FOUND", "Todo not found")
    }

    if (new Date(row.updatedAt).getTime() !== new Date(body.updated_at).getTime()) {
      throw new ServiceError("CONFLICT", "Todo was updated by another request")
    }

    const recurrenceType = parseRecurrenceType(body.recurrence_type ?? null)
    await validateDependencies(tx, id, body.dependencies)

    await tx
      .update(todoItems)
      .set({
        name: body.name,
        description: body.description,
        dueDate: body.due_date,
        status: body.status,
        priority: body.priority,
        recurrenceType,
        recurrenceConfig: body.recurrence_config ?? null,
        updatedAt: sql`now()`,
      })
      .where(eq(todoItems.id, id))

    await tx.delete(todoDependencies).where(eq(todoDependencies.todoId, id))
    if (body.dependencies.length > 0) {
      await tx.insert(todoDependencies).values(
        body.dependencies.map((depId) => ({
          todoId: id,
          dependsOnTodoId: depId,
        }))
      )
    }

    if (body.status === "In Progress") {
      await ensureNoUnmetDependencies(tx, id)
    }
  })
  return await getTodoById(id)
}

export async function softDeleteTodo(id: string) {
  const db = getDb()
  const deleted = await db
    .update(todoItems)
    .set({
      deletedAt: sql`now()`,
      updatedAt: sql`now()`,
    })
    .where(and(eq(todoItems.id, id), isNull(todoItems.deletedAt)))
    .returning({ id: todoItems.id })

  if (deleted.length === 0) {
    throw new ServiceError("NOT_FOUND", "Todo not found")
  }
}

export async function replaceTodoDependencies(
  id: string,
  rawBody: unknown
) {
  const body = z.object({ dependencies: z.array(z.string().min(1)) }).parse(rawBody)
  const db = getDb()
  await db.transaction(async (tx) => {
    const found = await tx
      .select({ id: todoItems.id })
      .from(todoItems)
      .where(and(eq(todoItems.id, id), isNull(todoItems.deletedAt)))
      .limit(1)

    if (found.length === 0) {
      throw new ServiceError("NOT_FOUND", "Todo not found")
    }

    await validateDependencies(tx, id, body.dependencies)
    await tx.delete(todoDependencies).where(eq(todoDependencies.todoId, id))

    if (body.dependencies.length > 0) {
      await tx.insert(todoDependencies).values(
        body.dependencies.map((depId) => ({
          todoId: id,
          dependsOnTodoId: depId,
        }))
      )
    }
  })
  return await getTodoById(id)
}

export async function completeTodo(id: string) {
  const db = getDb()
  await db.transaction(async (tx) => {
    const [current] = await tx
      .select({
        name: todoItems.name,
        description: todoItems.description,
        dueDate: todoItems.dueDate,
        priority: todoItems.priority,
        recurrenceType: todoItems.recurrenceType,
        recurrenceConfig: todoItems.recurrenceConfig,
        deletedAt: todoItems.deletedAt,
      })
      .from(todoItems)
      .where(eq(todoItems.id, id))
      .for("update")

    if (!current || current.deletedAt != null) {
      throw new ServiceError("NOT_FOUND", "Todo not found")
    }

    const nextDueDate = addRecurrence(
      new Date(current.dueDate),
      current.recurrenceType,
      current.recurrenceConfig
    )

    await tx
      .update(todoItems)
      .set({ status: "Completed", updatedAt: sql`now()` })
      .where(eq(todoItems.id, id))

    if (nextDueDate) {
      await tx.insert(todoItems).values({
        name: current.name,
        description: current.description,
        dueDate: nextDueDate.toISOString(),
        status: "Not Started",
        priority: current.priority,
        recurrenceType: current.recurrenceType,
        recurrenceConfig: current.recurrenceConfig,
      })
    }
  })
  return await getTodoById(id)
}
