import { type Table } from "@tanstack/react-table"
import { TodoRow } from "./todo-row"
import { TodoTableHeader } from "./todo-table-header"
import { type Todo } from "./types"

type TodoTableProps = {
  table: Table<Todo>
}

export function TodoTable({ table }: TodoTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <TodoTableHeader table={table} />
        <tbody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => <TodoRow key={row.id} row={row} />)
          ) : (
            <tr>
              <td colSpan={table.getAllColumns().length} className="px-2 py-6 text-center text-muted-foreground">
                No TODOs match current filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
