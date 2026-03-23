import { todoPrioritySchema } from "../../../lib/models"
import { type TodoPriority } from "./types"

type PriorityFilterProps = {
  value: "All" | TodoPriority
  onChange: (value: "All" | TodoPriority) => void
}

export function PriorityFilter({ value, onChange }: PriorityFilterProps) {
  return (
    <select
      id="priority-filter"
      className="h-8 rounded-lg border px-2.5 text-sm"
      value={value}
      onChange={(event) => onChange(event.target.value as "All" | TodoPriority)}
    >
      <option value="All">All</option>
      {todoPrioritySchema.options.map((priority: TodoPriority) => (
        <option key={priority} value={priority}>
          {priority}
        </option>
      ))}
    </select>
  )
}
