import { Button } from "@workspace/ui/components/button"

type TodoRowActionsProps = {
  todoId: string
  onEdit: (todoId: string) => void
  onDelete: (todoId: string) => void
}

export function TodoRowActions({
  todoId,
  onEdit,
  onDelete,
}: TodoRowActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button size="sm" variant="outline" type="button" onClick={() => onEdit(todoId)}>
        Edit
      </Button>
      <Button
        size="sm"
        variant="destructive"
        type="button"
        onClick={() => onDelete(todoId)}
      >
        Delete
      </Button>
    </div>
  )
}
