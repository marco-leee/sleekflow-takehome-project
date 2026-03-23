import { useEffect, useMemo, useState } from "react"
import { useForm } from "@tanstack/react-form"
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query"
import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table"
import { z } from "zod"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Combobox,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  useComboboxAnchor,
} from "@workspace/ui/components/combobox"
import {
  recurrenceTypeSchema,
  sortOrderSchema,
  todoPrioritySchema,
  todoSchema,
  todoSortFieldSchema,
  todoStatusSchema,
} from "../../lib/models"
import { TodoFilterBar } from "../components/todo-filter/todo-filter-bar"
import { TodoListSection } from "../components/todo-list/todo-list-section"
import { TodoRowActions } from "../components/todo-list/todo-row-actions"
import { type Todo } from "../components/todo-list/types"

type TodoPriority = z.infer<typeof todoPrioritySchema>
type TodoStatus = z.infer<typeof todoStatusSchema>
type TodoSortField = z.infer<typeof todoSortFieldSchema>
type SortOrder = z.infer<typeof sortOrderSchema>
type RecurrenceType = z.infer<typeof recurrenceTypeSchema>
type DependencyState = "blocked" | "unblocked"

const queryClient = new QueryClient()

const createTodoFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  due_date: z.string().min(1, "Due date is required"),
  priority: todoPrioritySchema,
  status: todoStatusSchema,
  recurrence_type: recurrenceTypeSchema,
  custom_interval: z.number().int().positive().optional(),
  custom_unit: z.enum(["day", "week", "month"]).optional(),
  dependency_ids: z.array(z.string()),
})

function formatDueDate(dateTime: string) {
  return new Date(dateTime).toLocaleDateString()
}

function formatForDateTimeLocal(dateTimeIso: string) {
  const d = new Date(dateTimeIso)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  const hh = String(d.getHours()).padStart(2, "0")
  const min = String(d.getMinutes()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`
}

function HomePage() {
  const [todos, setTodos] = useState<Todo[]>([
    {
      id: "todo-1",
      name: "Design TODO UI",
      description: "Build base list page and form",
      due_date: new Date(Date.now() + 86400000).toISOString(),
      status: "In Progress",
      priority: "High",
      dependency_ids: [],
    },
    {
      id: "todo-2",
      name: "Define API contract",
      description: "Document CRUD + recurrence endpoints",
      due_date: new Date(Date.now() + 86400000 * 2).toISOString(),
      status: "Not Started",
      priority: "Medium",
      dependency_ids: ["todo-1"],
    },
  ])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"All" | TodoStatus>("All")
  const [priorityFilter, setPriorityFilter] = useState<"All" | TodoPriority>("All")
  const [dueDateFilter, setDueDateFilter] = useState("")
  const [dependencyStateFilter, setDependencyStateFilter] = useState<
    "All" | DependencyState
  >("All")
  const [sortField, setSortField] = useState<TodoSortField>("due_date")
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")
  const [sorting, setSorting] = useState<SortingState>([
    { id: "due_date", desc: false },
  ])
  const [page, setPage] = useState(1)
  const pageSize = 5
  const [formError, setFormError] = useState<string | null>(null)
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null)

  const todoListQuery = useQuery({
    queryKey: [
      "todos",
      todos,
      search,
      statusFilter,
      priorityFilter,
      dueDateFilter,
      dependencyStateFilter,
      sortField,
      sortOrder,
    ],
    queryFn: async () => {
      const dependencyStatusMap = new Map(todos.map((todo) => [todo.id, todo.status]))

      return todos
        .filter((todo) => {
          if (statusFilter !== "All" && todo.status !== statusFilter) {
            return false
          }
          if (priorityFilter !== "All" && todo.priority !== priorityFilter) {
            return false
          }
          if (search) {
            const keyword = search.toLowerCase()
            return (
              todo.name.toLowerCase().includes(keyword) ||
              todo.description.toLowerCase().includes(keyword)
            )
          }

          if (dueDateFilter) {
            const todoDate = new Date(todo.due_date).toISOString().slice(0, 10)
            if (todoDate !== dueDateFilter) {
              return false
            }
          }

          if (dependencyStateFilter !== "All") {
            const isBlocked = todo.dependency_ids.some(
              (dependencyId) => dependencyStatusMap.get(dependencyId) !== "Completed"
            )
            if (dependencyStateFilter === "blocked" && !isBlocked) {
              return false
            }
            if (dependencyStateFilter === "unblocked" && isBlocked) {
              return false
            }
          }

          return true
        })
        .sort((a, b) => {
          const direction = sortOrder === "asc" ? 1 : -1
          if (sortField === "due_date") {
            return a.due_date.localeCompare(b.due_date) * direction
          }
          if (sortField === "name") {
            return a.name.localeCompare(b.name) * direction
          }
          if (sortField === "priority") {
            return a.priority.localeCompare(b.priority) * direction
          }
          return a.status.localeCompare(b.status) * direction
        })
    },
  })

  useEffect(() => {
    setPage(1)
  }, [
    search,
    statusFilter,
    priorityFilter,
    dueDateFilter,
    dependencyStateFilter,
    sortField,
    sortOrder,
  ])

  const paginatedTodos = useMemo(() => {
    const filteredTodos = todoListQuery.data ?? []
    const startIndex = (page - 1) * pageSize
    return filteredTodos.slice(startIndex, startIndex + pageSize)
  }, [page, pageSize, todoListQuery.data])

  const handleEditTodo = (todoId: string) => {
    const todo = todos.find((t) => t.id === todoId)
    if (!todo) return

    setEditingTodoId(todoId)
    void form.setFieldValue("name", todo.name, { dontValidate: true })
    void form.setFieldValue("description", todo.description, { dontValidate: true })
    void form.setFieldValue("due_date", formatForDateTimeLocal(todo.due_date), {
      dontValidate: true,
    })
    void form.setFieldValue("status", todo.status, { dontValidate: true })
    void form.setFieldValue("priority", todo.priority, { dontValidate: true })
    void form.setFieldValue("dependency_ids", todo.dependency_ids, {
      dontValidate: true,
    })
    void form.setFieldValue("recurrence_type", todo.recurrence?.type ?? "none", {
      dontValidate: true,
    })
    if (todo.recurrence?.type === "custom" && todo.recurrence.custom) {
      void form.setFieldValue("custom_interval", todo.recurrence.custom.interval, {
        dontValidate: true,
      })
      void form.setFieldValue("custom_unit", todo.recurrence.custom.unit, {
        dontValidate: true,
      })
    } else {
      void form.setFieldValue("custom_interval", 1, { dontValidate: true })
      void form.setFieldValue("custom_unit", "day", { dontValidate: true })
    }
  }

  const handleDeleteTodo = (todoId: string) => {
    setTodos((previous) => previous.filter((todo) => todo.id !== todoId))
    if (editingTodoId === todoId) {
      setEditingTodoId(null)
      setFormError(null)
      form.reset()
    }
  }

  const handleCompleteTodo = (todoId: string) => {
    setTodos((previous) =>
      previous.map((todo) =>
        todo.id === todoId ? { ...todo, status: "Completed" } : todo
      )
    )
  }

  const columns = useMemo(() => {
    const helper = createColumnHelper<Todo>()
    return [
      helper.accessor("name", {
        header: "Name",
        cell: (info) => info.getValue(),
      }),
      helper.accessor("description", {
        header: "Description",
        cell: (info) => info.getValue(),
      }),
      helper.accessor("due_date", {
        id: "due_date",
        header: "Due Date",
        cell: (info) => formatDueDate(info.getValue()),
      }),
      helper.accessor("status", {
        header: "Status",
        cell: (info) => info.getValue(),
      }),
      helper.accessor("priority", {
        header: "Priority",
        cell: (info) => info.getValue(),
      }),
      helper.display({
        id: "actions",
        header: "Actions",
        cell: (info) => (
          <TodoRowActions
            todoId={info.row.original.id}
            onEdit={handleEditTodo}
            onDelete={handleDeleteTodo}
          />
        ),
      }),
    ]
  }, [])

  const table = useReactTable({
    data: paginatedTodos,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      due_date: "",
      priority: "Medium" as TodoPriority,
      status: "Not Started" as TodoStatus,
      recurrence_type: "none" as RecurrenceType,
      custom_interval: 1,
      custom_unit: "day" as "day" | "week" | "month",
      dependency_ids: [] as string[],
    },
    onSubmit: async ({ value }) => {
      const parsed = createTodoFormSchema.safeParse(value)
      if (!parsed.success) {
        setFormError(parsed.error.issues[0]?.message ?? "Invalid form input")
        return
      }
      setFormError(null)

      if (editingTodoId) {
        setTodos((previous) =>
          previous.map((todo) =>
            todo.id === editingTodoId
              ? {
                  ...todo,
                  name: parsed.data.name,
                  description: parsed.data.description,
                  due_date: new Date(parsed.data.due_date).toISOString(),
                  status: parsed.data.status,
                  priority: parsed.data.priority,
                  dependency_ids: parsed.data.dependency_ids,
                  recurrence:
                    parsed.data.recurrence_type === "none"
                      ? undefined
                      : parsed.data.recurrence_type === "custom"
                        ? {
                            type: "custom",
                            custom: {
                              interval: parsed.data.custom_interval ?? 1,
                              unit: parsed.data.custom_unit ?? "day",
                            },
                          }
                        : {
                            type: parsed.data.recurrence_type,
                          },
                }
              : todo
          )
        )
        setEditingTodoId(null)
        form.reset()
        return
      }

      setTodos((previous) => [
        ...previous,
        {
          id: crypto.randomUUID(),
          name: parsed.data.name,
          description: parsed.data.description,
          due_date: new Date(parsed.data.due_date).toISOString(),
          status: parsed.data.status,
          priority: parsed.data.priority,
          dependency_ids: parsed.data.dependency_ids,
          recurrence:
            parsed.data.recurrence_type === "none"
              ? undefined
              : parsed.data.recurrence_type === "custom"
                ? {
                    type: "custom",
                    custom: {
                      interval: parsed.data.custom_interval ?? 1,
                      unit: parsed.data.custom_unit ?? "day",
                    },
                  }
                : {
                    type: parsed.data.recurrence_type,
                  },
        },
      ])

      form.reset()
    },
  })

  const isEditing = editingTodoId !== null

  function TodoNameField() {
    return (
      <form.Field name="name">
        {(field) => (
          <div className="space-y-1">
            <Label htmlFor="todo-name">Name</Label>
            <Input
              id="todo-name"
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
            />
          </div>
        )}
      </form.Field>
    )
  }

  function TodoDescriptionField() {
    return (
      <form.Field name="description">
        {(field) => (
          <div className="space-y-1">
            <Label htmlFor="todo-description">Description</Label>
            <Input
              id="todo-description"
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
            />
          </div>
        )}
      </form.Field>
    )
  }

  function TodoDueDateField() {
    return (
      <form.Field name="due_date">
        {(field) => (
          <div className="space-y-1">
            <Label htmlFor="todo-due-date">Due Date</Label>
            <Input
              id="todo-due-date"
              type="datetime-local"
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
            />
          </div>
        )}
      </form.Field>
    )
  }

  function TodoStatusField() {
    return (
      <form.Field name="status">
        {(field) => (
          <div className="space-y-1">
            <Label htmlFor="todo-status">Status</Label>
            <select
              id="todo-status"
              className="h-8 rounded-lg border px-2.5 text-sm"
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value as TodoStatus)}
            >
              {todoStatusSchema.options.map((status: TodoStatus) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        )}
      </form.Field>
    )
  }

  function TodoPriorityField() {
    return (
      <form.Field name="priority">
        {(field) => (
          <div className="space-y-1">
            <Label htmlFor="todo-priority">Priority</Label>
            <select
              id="todo-priority"
              className="h-8 rounded-lg border px-2.5 text-sm"
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value as TodoPriority)}
            >
              {todoPrioritySchema.options.map((priority: TodoPriority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </div>
        )}
      </form.Field>
    )
  }

  function TodoRecurrenceField() {
    return (
      <form.Field name="recurrence_type">
        {(field) => (
          <div className="space-y-1">
            <Label htmlFor="todo-recurrence">Recurrence</Label>
            <div className="flex gap-2">
              <select
                id="todo-recurrence"
                className="h-8 rounded-lg border px-2.5 text-sm"
                value={field.state.value}
                onChange={(event) => {
                  const value = event.target.value as RecurrenceType
                  field.handleChange(value)
                  if (value !== "custom") {
                    void form.setFieldValue("custom_interval", 1, {
                      dontValidate: true,
                    })
                    void form.setFieldValue("custom_unit", "day", {
                      dontValidate: true,
                    })
                  }
                }}
              >
                {recurrenceTypeSchema.options.map((recurrence) => (
                  <option key={recurrence} value={recurrence}>
                    {recurrence === "none" ? "None" : recurrence}
                  </option>
                ))}
              </select>
              {field.state.value === "custom" && (
                <>
                  <Input
                    type="number"
                    min={1}
                    className="h-8 w-20"
                    value={form.getFieldValue("custom_interval") ?? 1}
                    onChange={(event) =>
                      void form.setFieldValue("custom_interval", Number(event.target.value))
                    }
                  />
                  <select
                    className="h-8 rounded-lg border px-2.5 text-sm"
                    value={form.getFieldValue("custom_unit") ?? "day"}
                    onChange={(event) =>
                      void form.setFieldValue(
                        "custom_unit",
                        event.target.value as "day" | "week" | "month"
                      )
                    }
                  >
                    <option value="day">day(s)</option>
                    <option value="week">week(s)</option>
                    <option value="month">month(s)</option>
                  </select>
                </>
              )}
            </div>
          </div>
        )}
      </form.Field>
    )
  }

  function TodoDependenciesField() {
    const anchorRef = useComboboxAnchor()
    const availableTodos = todos.filter((todo) => todo.id !== editingTodoId)

    return (
      <form.Field name="dependency_ids">
        {(field) => (
          <div className="space-y-1 md:col-span-2">
            <Label htmlFor="todo-dependencies">Dependencies</Label>
            <Combobox
              value={field.state.value}
              onValueChange={(value) => field.handleChange(value)}
              multiple
            >
              <div ref={anchorRef}>
                <ComboboxChips>
                  {field.state.value.map((id) => {
                    const todo = todos.find((t) => t.id === id)
                    return (
                      <ComboboxChip key={id}>
                        {todo?.name ?? id}
                      </ComboboxChip>
                    )
                  })}
                  <ComboboxChipsInput placeholder="Select dependencies..." />
                </ComboboxChips>
              </div>
              <ComboboxContent anchor={anchorRef}>
                <ComboboxList>
                  <ComboboxEmpty>No results available.</ComboboxEmpty>
                  {availableTodos.map((todo) => (
                    <ComboboxItem key={todo.id} value={todo.id}>
                      {todo.name}
                    </ComboboxItem>
                  ))}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>
        )}
      </form.Field>
    )
  }

  function TodoFormActions() {
    return (
      <div className="flex items-end gap-2">
        <Button type="submit">{isEditing ? "Update TODO" : "Create TODO"}</Button>
        {isEditing ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setEditingTodoId(null)
              setFormError(null)
              form.reset()
            }}
          >
            Cancel
          </Button>
        ) : null}
      </div>
    )
  }

  function TodoForm() {
    return (
      <section className="rounded-lg border p-4">
        <h2 className="mb-4 text-base font-medium">{isEditing ? "Edit TODO" : "Create TODO"}</h2>
        <form
          className="grid grid-cols-1 gap-3 md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            void form.handleSubmit()
          }}
        >
          <TodoNameField />
          <TodoDescriptionField />
          <TodoDueDateField />
          <TodoStatusField />
          <TodoPriorityField />
          <TodoRecurrenceField />
          <TodoDependenciesField />

          <TodoFormActions />
        </form>

        {formError ? (
          <p className="mt-3 text-sm text-destructive">{formError}</p>
        ) : null}
      </section>
    )
  }

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-6xl flex-col gap-6 p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">TODO List</h1>
        <p className="text-sm text-muted-foreground">
          Built with React Router SSR, shadcn/ui, TanStack Query/Form/Table, and
          Zod.
        </p>
      </header>

      <TodoForm />

      <TodoFilterBar
        search={search}
        status={statusFilter}
        priority={priorityFilter}
        dueDate={dueDateFilter}
        dependencyState={dependencyStateFilter}
        sortField={sortField}
        sortOrder={sortOrder}
        onSearchChange={setSearch}
        onStatusChange={setStatusFilter}
        onPriorityChange={setPriorityFilter}
        onDueDateChange={setDueDateFilter}
        onDependencyStateChange={setDependencyStateFilter}
        onSortFieldChange={setSortField}
        onSortOrderChange={setSortOrder}
        onClear={() => {
          setSearch("")
          setStatusFilter("All")
          setPriorityFilter("All")
          setDueDateFilter("")
          setDependencyStateFilter("All")
          setSortField("due_date")
          setSortOrder("asc")
        }}
      />

      <TodoListSection
        table={table}
        isLoading={todoListQuery.isLoading}
        isError={todoListQuery.isError}
        page={page}
        pageSize={pageSize}
        totalItems={todoListQuery.data?.length ?? 0}
        onPreviousPage={() => setPage((previous) => Math.max(1, previous - 1))}
        onNextPage={() => {
          const totalPages = Math.max(
            1,
            Math.ceil((todoListQuery.data?.length ?? 0) / pageSize)
          )
          setPage((previous) => Math.min(totalPages, previous + 1))
        }}
      />
    </div>
  )
}

export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <HomePage />
    </QueryClientProvider>
  )
}
