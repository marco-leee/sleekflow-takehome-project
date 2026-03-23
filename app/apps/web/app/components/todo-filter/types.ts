import { z } from "zod"
import {
  dependencyStateSchema,
  sortOrderSchema,
  todoPrioritySchema,
  todoSortFieldSchema,
  todoStatusSchema,
} from "../../../lib/models"

export type TodoStatus = z.infer<typeof todoStatusSchema>
export type TodoPriority = z.infer<typeof todoPrioritySchema>
export type DependencyState = z.infer<typeof dependencyStateSchema>
export type TodoSortField = z.infer<typeof todoSortFieldSchema>
export type SortOrder = z.infer<typeof sortOrderSchema>
