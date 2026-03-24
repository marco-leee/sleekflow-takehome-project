import { type Table } from "@tanstack/react-table"
import { TodoPagination } from "./todo-pagination"
import { TodoTable } from "./todo-table"
import { type Todo } from "./types"

type TodoListSectionProps = {
  table: Table<Todo>
  isLoading: boolean
  isError: boolean
  page: number
  pageSize: number
  totalItems: number
  onPreviousPage: () => void
  onNextPage: () => void
}

export function TodoListSection({
  table,
  isLoading,
  isError,
  page,
  pageSize,
  totalItems,
  onPreviousPage,
  onNextPage,
}: TodoListSectionProps) {
  return (
    <section className="rounded-lg border p-4">
      <h2 className="mb-4 text-base font-medium">TODO Table</h2>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading todos...</p>
      ) : isError ? (
        <p className="text-sm text-destructive">Failed to load TODOs.</p>
      ) : (
        <>
          <TodoTable table={table} />
          <TodoPagination
            page={page}
            pageSize={pageSize}
            totalItems={totalItems}
            onPrevious={onPreviousPage}
            onNext={onNextPage}
          />
        </>
      )}
    </section>
  )
}
