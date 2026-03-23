import { Label } from "@workspace/ui/components/label"
import { Input } from "@workspace/ui/components/input"
import { ClearFiltersButton } from "./clear-filters-button"
import { DependencyStateFilter } from "./dependency-state-filter"
import { DueDateFilter } from "./due-date-filter"
import { PriorityFilter } from "./priority-filter"
import { StatusFilter } from "./status-filter"
import { TodoSortControl } from "./todo-sort-control"
import {
  type DependencyState,
  type SortOrder,
  type TodoPriority,
  type TodoSortField,
  type TodoStatus,
} from "./types"

type TodoFilterBarProps = {
  search: string
  status: "All" | TodoStatus
  priority: "All" | TodoPriority
  dueDate: string
  dependencyState: "All" | DependencyState
  sortField: TodoSortField
  sortOrder: SortOrder
  onSearchChange: (value: string) => void
  onStatusChange: (value: "All" | TodoStatus) => void
  onPriorityChange: (value: "All" | TodoPriority) => void
  onDueDateChange: (value: string) => void
  onDependencyStateChange: (value: "All" | DependencyState) => void
  onSortFieldChange: (value: TodoSortField) => void
  onSortOrderChange: (value: SortOrder) => void
  onClear: () => void
}

export function TodoFilterBar({
  search,
  status,
  priority,
  dueDate,
  dependencyState,
  sortField,
  sortOrder,
  onSearchChange,
  onStatusChange,
  onPriorityChange,
  onDueDateChange,
  onDependencyStateChange,
  onSortFieldChange,
  onSortOrderChange,
  onClear,
}: TodoFilterBarProps) {
  return (
    <section className="rounded-lg border p-4">
      <h2 className="mb-4 text-base font-medium">Filter and Sort</h2>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <div className="space-y-1">
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            placeholder="Search name or description"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="status-filter">Status</Label>
          <StatusFilter value={status} onChange={onStatusChange} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="priority-filter">Priority</Label>
          <PriorityFilter value={priority} onChange={onPriorityChange} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="due-date-filter">Due Date</Label>
          <DueDateFilter value={dueDate} onChange={onDueDateChange} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="dependency-state-filter">Dependency State</Label>
          <DependencyStateFilter
            value={dependencyState}
            onChange={onDependencyStateChange}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="sort-field">Sort</Label>
          <TodoSortControl
            field={sortField}
            order={sortOrder}
            onFieldChange={onSortFieldChange}
            onOrderChange={onSortOrderChange}
          />
        </div>
        <div className="flex items-end">
          <ClearFiltersButton onClear={onClear} />
        </div>
      </div>
    </section>
  )
}
