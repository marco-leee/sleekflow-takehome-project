import { z } from "zod";

export const todoStatusSchema = z.enum([
  "Not Started",
  "In Progress",
  "Completed",
  "Archived",
]);

export const todoPrioritySchema = z.enum(["Low", "Medium", "High"]);

export const recurrenceTypeSchema = z.enum([
  "none",
  "daily",
  "weekly",
  "monthly",
  "custom",
]);

export const dependencyStateSchema = z.enum(["blocked", "unblocked"]);

export const todoSortFieldSchema = z.enum([
  "due_date",
  "priority",
  "status",
  "name",
]);

export const sortOrderSchema = z.enum(["asc", "desc"]);

export const customRecurrenceSchema = z.object({
  interval: z.number().int().positive(),
  unit: z.enum(["day", "week", "month"]),
});

export const recurrenceSchema = z
  .object({
    type: recurrenceTypeSchema,
    custom: customRecurrenceSchema.optional(),
  })
  .superRefine((value, context) => {
    if (value.type === "custom" && !value.custom) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "custom recurrence requires custom config",
        path: ["custom"],
      });
    }

    if (value.type !== "custom" && value.custom) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "custom config allowed only when type is custom",
        path: ["custom"],
      });
    }

    if (value.type === "none" && value.custom) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "none recurrence cannot have custom config",
        path: ["custom"],
      });
    }
  });

export const todoSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  due_date: z.string().datetime(),
  status: todoStatusSchema,
  priority: todoPrioritySchema,
  dependency_ids: z.array(z.string().min(1)).default([]),
  recurrence: recurrenceSchema.optional(),
});

export const createTodoInputSchema = todoSchema.omit({ id: true });

export const updateTodoInputSchema = todoSchema.partial().extend({
  id: z.string().min(1),
});

export const deleteTodoInputSchema = z.object({
  id: z.string().min(1),
});

export const todoStatusTransitionSchema = z
  .object({
    todo_id: z.string().min(1),
    next_status: todoStatusSchema,
    has_unmet_dependencies: z.boolean(),
  })
  .superRefine((value, context) => {
    if (value.next_status === "In Progress" && value.has_unmet_dependencies) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "blocked todo cannot transition to In Progress",
        path: ["next_status"],
      });
    }
  });

export const todoListFilterSchema = z.object({
  status: todoStatusSchema.optional(),
  priority: todoPrioritySchema.optional(),
  due_date: z
    .object({
      from: z.string().datetime().optional(),
      to: z.string().datetime().optional(),
    })
    .optional(),
  dependency_state: dependencyStateSchema.optional(),
});

export const todoListSortSchema = z.object({
  field: todoSortFieldSchema,
  order: sortOrderSchema.default("asc"),
});

export const todoListQuerySchema = z.object({
  filter: todoListFilterSchema.optional(),
  sort: todoListSortSchema.optional(),
});

export const completeTodoInputSchema = z.object({
  id: z.string().min(1),
  completed_at: z.string().datetime().optional(),
});
