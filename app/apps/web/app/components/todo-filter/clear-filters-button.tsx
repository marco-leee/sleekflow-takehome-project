import { Button } from "@workspace/ui/components/button"

type ClearFiltersButtonProps = {
  onClear: () => void
}

export function ClearFiltersButton({ onClear }: ClearFiltersButtonProps) {
  return (
    <Button type="button" variant="outline" onClick={onClear}>
      Clear Filters
    </Button>
  )
}
