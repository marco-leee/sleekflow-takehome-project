import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const todoItems = pgTable(
  "todo_items",
  {
    id: uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    dueDate: timestamp("due_date", { withTimezone: true, mode: "string" }).notNull(),
    status: text("status").notNull(),
    priority: text("priority").notNull(),
    recurrenceType: text("recurrence_type"),
    recurrenceConfig: jsonb("recurrence_config"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "string" }),
  },
  (table) => ({
    deletedAtIdx: index("idx_todo_items_deleted_at").on(table.deletedAt),
    dueDateIdx: index("idx_todo_items_due_date").on(table.dueDate),
    statusIdx: index("idx_todo_items_status").on(table.status),
    priorityIdx: index("idx_todo_items_priority").on(table.priority),
  })
)

export const todoDependencies = pgTable(
  "todo_dependencies",
  {
    todoId: uuid("todo_id")
      .notNull()
      .references(() => todoItems.id, { onDelete: "cascade" }),
    dependsOnTodoId: uuid("depends_on_todo_id")
      .notNull()
      .references(() => todoItems.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    uniqueTodoDependency: unique("unique_todo_dependency").on(
      table.todoId,
      table.dependsOnTodoId
    ),
    todoIdIdx: index("idx_todo_dependencies_todo_id").on(table.todoId),
    dependsOnTodoIdIdx: index("idx_todo_dependencies_depends_on").on(table.dependsOnTodoId),
  })
)
