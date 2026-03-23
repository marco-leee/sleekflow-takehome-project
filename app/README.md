# shadcn/ui monorepo template

This is a React Router monorepo template with shadcn/ui.

## Tech Stack

1. React router with SSR
2. Tailwind CSS
3. shadcn/ui
4. TanStack Query
5. TanStack Form
6. TanStack Table
7. Zod

## Commands

```bash
# Run the development server
bun run dev 
# Build the production bundle
bun run build
# Start the production server
bun run start
```

## Adding components

To add components to your app, run the following command at the root of your `web` app:

```bash
bunx shadcn@latest add button -c apps/web
```

This will place the ui components in the `packages/ui/src/components` directory.

## Using components

To use the components in your app, import them from the `ui` package.

```tsx
import { Button } from "@workspace/ui/components/button";
```
