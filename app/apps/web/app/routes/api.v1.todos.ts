import type { Route } from "./+types/api.v1.todos"
import { z } from "zod"
import {
  ServiceError,
  createTodo,
  ensureTodoSchema,
  listTodos,
} from "../services/todo.server"

function jsonError(message: string, status: number, details?: unknown) {
  return Response.json(
    {
      error: {
        message,
        details,
      },
    },
    { status }
  )
}

function serviceErrorToResponse(error: unknown) {
  if (error instanceof Error && error.message === "DATABASE_URL is required") {
    return jsonError("Server config error: DATABASE_URL is required", 500)
  }
  if (error instanceof z.ZodError) {
    return jsonError("Validation failed", 400, error.flatten())
  }
  if (error instanceof ServiceError) {
    if (error.code === "NOT_FOUND") return jsonError(error.message, 404)
    if (error.code === "CONFLICT") return jsonError(error.message, 409)
    if (error.code === "RULE_VIOLATION") return jsonError(error.message, 422)
    return jsonError(error.message, 400, error.details)
  }
  console.error(error)
  return jsonError("Internal server error", 500)
}

export async function loader({ request }: Route.LoaderArgs) {
  try {
    await ensureTodoSchema()

    const url = new URL(request.url)
    const query = {
      status: url.searchParams.getAll("status"),
      priority: url.searchParams.getAll("priority"),
      due_date_from: url.searchParams.get("due_date_from") ?? undefined,
      due_date_to: url.searchParams.get("due_date_to") ?? undefined,
      dependency_state: url.searchParams.get("dependency_state") ?? undefined,
      sort_by: url.searchParams.get("sort_by") ?? undefined,
      sort_direction: url.searchParams.get("sort_direction") ?? undefined,
      page: url.searchParams.get("page") ?? undefined,
      page_size: url.searchParams.get("page_size") ?? undefined,
      search: url.searchParams.get("search") ?? undefined,
    }

    const result = await listTodos(query)
    return Response.json(result)
  } catch (error) {
    console.log(error)
    return serviceErrorToResponse(error)
  }
}

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return jsonError("Method not allowed", 405)
  }

  try {
    await ensureTodoSchema()
    const body = await request.json()
    const created = await createTodo(body)
    return Response.json(created, { status: 201 })
  } catch (error) {
    return serviceErrorToResponse(error)
  }
}
