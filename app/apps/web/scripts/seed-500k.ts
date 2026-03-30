/**
 * Seeds 500_000 todo rows: name/description `item_{idx}`, due today, status Not Started,
 * priority Low. item_0 and item_1 have no deps; item_i (i>=2) depends on item_{i-2} and item_{i-1}.
 *
 * Requires DATABASE_URL (or VITE_DATABASE_URL). Run from apps/web: `bun run seed:500k`
 */
import { drizzle } from "drizzle-orm/node-postgres"
import pg from "pg"
import * as schema from "../app/db/schema"
import { todoDependencies, todoItems } from "../app/db/schema"

const ROW_COUNT = 500_000
const TODO_BATCH = 2_000
const DEP_BATCH = 5_000

function todayDueDateIso(): string {
  const d = new Date()
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 12, 0, 0, 0)
  ).toISOString()
}

async function main() {
  const connectionString =
    process.env.DATABASE_URL ?? process.env.VITE_DATABASE_URL
  if (!connectionString) {
    throw new Error("DATABASE_URL or VITE_DATABASE_URL is required")
  }

  const pool = new pg.Pool({ connectionString })
  const db = drizzle(pool, { schema })

  try {
    const dueDate = todayDueDateIso()
    console.log(`Allocating ${ROW_COUNT} UUIDs...`)
    const ids = new Array<string>(ROW_COUNT)
    for (let i = 0; i < ROW_COUNT; i++) {
      ids[i] = crypto.randomUUID()
    }

    console.log("Inserting todo_items...")
    for (let start = 0; start < ROW_COUNT; start += TODO_BATCH) {
      const end = Math.min(start + TODO_BATCH, ROW_COUNT)
      const rows = []
      for (let i = start; i < end; i++) {
        rows.push({
          id: ids[i],
          name: `item_${i}`,
          description: `item_${i}`,
          dueDate,
          status: "Not Started",
          priority: "Low",
          recurrenceType: null as string | null,
          recurrenceConfig: null as null,
        })
      }
      await db.insert(todoItems).values(rows)
      if (end % 50_000 === 0 || end === ROW_COUNT) {
        console.log(`  todo_items: ${end} / ${ROW_COUNT}`)
      }
    }

    console.log("Inserting todo_dependencies...")
    const depRows: { todoId: string; dependsOnTodoId: string }[] = []
    let depFlushCount = 0
    for (let i = 2; i < ROW_COUNT; i++) {
      depRows.push(
        { todoId: ids[i], dependsOnTodoId: ids[i - 2] },
        { todoId: ids[i], dependsOnTodoId: ids[i - 1] }
      )
      if (depRows.length >= DEP_BATCH) {
        await db.insert(todoDependencies).values(depRows)
        depRows.length = 0
        depFlushCount += DEP_BATCH
        if (depFlushCount % 100_000 === 0) {
          console.log(`  todo_dependencies: ~${depFlushCount} rows written`)
        }
      }
    }
    if (depRows.length > 0) {
      await db.insert(todoDependencies).values(depRows)
    }

    console.log("Done.")
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
