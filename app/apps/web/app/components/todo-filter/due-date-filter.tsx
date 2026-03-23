type DueDateFilterProps = {
  value: string
  onChange: (value: string) => void
}

export function DueDateFilter({ value, onChange }: DueDateFilterProps) {
  return (
    <input
      id="due-date-filter"
      type="date"
      className="h-8 w-full rounded-lg border px-2.5 text-sm"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  )
}
