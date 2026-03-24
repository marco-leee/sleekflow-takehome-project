import { Pool } from "pg"
import type { NodePgDatabase } from "drizzle-orm/node-postgres"
import { drizzle } from "drizzle-orm/node-postgres"
import * as schema from "./schema"

let pool: Pool | null = null
let db: NodePgDatabase<typeof schema> | null = null

export function getDbPool() {
  if (pool) {
    return pool
  }

  const connectionString =
    process.env.DATABASE_URL ?? process.env.VITE_DATABASE_URL

  if (!connectionString) {
    throw new Error("DATABASE_URL is required")
  }

  pool = new Pool({
    connectionString,
  })

  return pool
}

export function getDb() {
  if (db) {
    return db
  }

  db = drizzle(getDbPool(), { schema })
  return db
}
