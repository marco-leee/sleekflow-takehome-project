import { flexRender, type Row } from "@tanstack/react-table"
import { type Todo } from "./types"

type TodoRowProps = {
  row: Row<Todo>
}

export function TodoRow({ row }: TodoRowProps) {
  return (
    <tr className="border-b">
      {row.getVisibleCells().map((cell) => (
        <td key={cell.id} className="px-2 py-2">
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </td>
      ))}
    </tr>
  )
}
