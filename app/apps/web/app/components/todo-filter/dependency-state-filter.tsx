import { dependencyStateSchema } from "../../../lib/models"
import { type DependencyState } from "./types"

type DependencyStateFilterProps = {
  value: "All" | DependencyState
  onChange: (value: "All" | DependencyState) => void
}

export function DependencyStateFilter({
  value,
  onChange,
}: DependencyStateFilterProps) {
  return (
    <select
      id="dependency-state-filter"
      className="h-8 rounded-lg border px-2.5 text-sm"
      value={value}
      onChange={(event) => onChange(event.target.value as "All" | DependencyState)}
    >
      <option value="All">All</option>
      {dependencyStateSchema.options.map((state: DependencyState) => (
        <option key={state} value={state}>
          {state}
        </option>
      ))}
    </select>
  )
}
