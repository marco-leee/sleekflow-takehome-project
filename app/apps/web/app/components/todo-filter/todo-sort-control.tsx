import { sortOrderSchema, todoSortFieldSchema } from "../../../lib/models"
import { type SortOrder, type TodoSortField } from "./types"

type TodoSortControlProps = {
  field: TodoSortField
  order: SortOrder
  onFieldChange: (value: TodoSortField) => void
  onOrderChange: (value: SortOrder) => void
}

export function TodoSortControl({
  field,
  order,
  onFieldChange,
  onOrderChange,
}: TodoSortControlProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <select
        id="sort-field"
        className="h-8 rounded-lg border px-2.5 text-sm"
        value={field}
        onChange={(event) => onFieldChange(event.target.value as TodoSortField)}
      >
        {todoSortFieldSchema.options.map((sortField: TodoSortField) => (
          <option key={sortField} value={sortField}>
            {sortField}
          </option>
        ))}
      </select>
      <select
        id="sort-order"
        className="h-8 rounded-lg border px-2.5 text-sm"
        value={order}
        onChange={(event) => onOrderChange(event.target.value as SortOrder)}
      >
        {sortOrderSchema.options.map((sortOrder: SortOrder) => (
          <option key={sortOrder} value={sortOrder}>
            {sortOrder}
          </option>
        ))}
      </select>
    </div>
  )
}
