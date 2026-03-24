import { Button } from "@workspace/ui/components/button"

type TodoPaginationProps = {
  page: number
  pageSize: number
  totalItems: number
  onPrevious: () => void
  onNext: () => void
}

export function TodoPagination({
  page,
  pageSize,
  totalItems,
  onPrevious,
  onNext,
}: TodoPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const isFirstPage = page <= 1
  const isLastPage = page >= totalPages

  return (
    <div className="mt-4 flex items-center justify-between text-sm">
      <p className="text-muted-foreground">
        Page {page} of {totalPages}
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onPrevious}
          disabled={isFirstPage}
        >
          Previous
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onNext} disabled={isLastPage}>
          Next
        </Button>
      </div>
    </div>
  )
}
