import { flexRender, type Table } from "@tanstack/react-table"
import { type Todo } from "./types"

type TodoTableHeaderProps = {
  table: Table<Todo>
}

export function TodoTableHeader({ table }: TodoTableHeaderProps) {
  return (
    <thead>
      {table.getHeaderGroups().map((headerGroup) => (
        <tr key={headerGroup.id} className="border-b">
          {headerGroup.headers.map((header) => (
            <th key={header.id} className="px-2 py-2 text-left font-medium">
              {header.isPlaceholder ? null : (
                <button
                  type="button"
                  className="cursor-pointer"
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </button>
              )}
            </th>
          ))}
        </tr>
      ))}
    </thead>
  )
}
