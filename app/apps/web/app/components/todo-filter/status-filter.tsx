import { todoStatusSchema } from "../../../lib/models"
import { type TodoStatus } from "./types"

type StatusFilterProps = {
  value: "All" | TodoStatus
  onChange: (value: "All" | TodoStatus) => void
}

export function StatusFilter({ value, onChange }: StatusFilterProps) {
  return (
    <select
      id="status-filter"
      className="h-8 rounded-lg border px-2.5 text-sm"
      value={value}
      onChange={(event) => onChange(event.target.value as "All" | TodoStatus)}
    >
      <option value="All">All</option>
      {todoStatusSchema.options.map((status: TodoStatus) => (
        <option key={status} value={status}>
          {status}
        </option>
      ))}
    </select>
  )
}
