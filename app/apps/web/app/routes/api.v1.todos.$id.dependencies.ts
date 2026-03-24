import type { Route } from "./+types/api.v1.todos.$id.dependencies"
import { z } from "zod"
import {
  ServiceError,
  ensureTodoSchema,
  replaceTodoDependencies,
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
  return jsonError("Internal server error", 500)
}

export async function action({ request, params }: Route.ActionArgs) {
  if (request.method !== "PUT") {
    return jsonError("Method not allowed", 405)
  }

  try {
    await ensureTodoSchema()
    const body = await request.json()
    const result = await replaceTodoDependencies(params.id, body)
    return Response.json(result)
  } catch (error) {
    return serviceErrorToResponse(error)
  }
}
