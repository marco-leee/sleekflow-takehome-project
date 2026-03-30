declare module "pg" {
  export type QueryResult<T = unknown> = {
    rows: T[]
    rowCount: number | null
  }

  export class PoolClient {
    query<T = unknown>(text: string, values?: unknown[]): Promise<QueryResult<T>>
    release(): void
  }

  export class Pool {
    constructor(options?: { connectionString?: string })
    query<T = unknown>(text: string, values?: unknown[]): Promise<QueryResult<T>>
    connect(): Promise<PoolClient>
    end(): Promise<void>
  }
}
