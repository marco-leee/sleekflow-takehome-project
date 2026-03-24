import { type RouteConfig, index, route } from "@react-router/dev/routes"

export default [
  index("routes/home.tsx"),
  route("api/v1/todos", "routes/api.v1.todos.ts"),
  route("api/v1/todos/:id", "routes/api.v1.todos.$id.ts"),
  route("api/v1/todos/:id/dependencies", "routes/api.v1.todos.$id.dependencies.ts"),
  route("api/v1/todos/:id/complete", "routes/api.v1.todos.$id.complete.ts"),
] satisfies RouteConfig
