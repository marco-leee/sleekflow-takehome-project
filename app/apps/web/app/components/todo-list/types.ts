import { z } from "zod"
import { todoSchema } from "../../../lib/models"

export type Todo = z.infer<typeof todoSchema>
