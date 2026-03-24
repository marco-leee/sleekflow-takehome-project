# Sleekflow Todo list app

## Task 1 (System design) [System Design project](docs/Take-home%20system%20Design%20Question.pdf)

### Design documentation

Extended product and system design notes live under [docs/](docs/main.md):

- [Documentation index (TOC)](docs/main.md)
- [Project / operation team analysis](docs/project-team-analysis.md)
- [User behaviour journey](docs/user-behaviour-journey.md)
- [Application analysis / features](docs/application-features.md)
- [System analysis and design](docs/system-analysis-design.md)
- [Tech stack](docs/tech-stack.md)
- [DevOps / infrastructure](docs/devops-infrastructure.md)
- [Final project scope](docs/project-scope.md)


## Task 2 (Application design) [Software Engineer Interview Project](docs/SleekFlow%20Software%20Engineer%20Interview%20Project.pdf)

## Commands

```bash
docker compose up -d # Start app dependencies
cd app && bun dev # Start the development server
```

## Requirement

1. TODO list management
   1. CRUD operations
   2. Concurrent update
2. Recurring tasks
    1. Next occurrence automatically created when a task is completed
3. Task dependencies
   1. Item can depend on one or more other items
   2. Task is blocked if any of its dependencies are not completed
4. Filtering and sorting
   1. Filter by status, priority, due date, dependency state
   2. Sort by due date, priority, status, name

## Log

1. TODO list management
   1. Nothing major about CRUD operations
   2. Concurrency is the main challenge, need to be designed carefully so that the data is consistent and in sync across all users writing to the same TODO item.
      1. At any user's actions on the list and its items, changes should be broadcast to all other users so that they can see the changes in real time.
2. Recurring tasks
    1. For weekly, monthly recurrence, based on which day of the week or month is not mentioned. Can be a default day or configurable by the user.
    2. Recurring tasks are tasks that repeat at a regular interval. The same task to be done today and tomorrow are not dependent.
    3. If tasks is not completed today, it should not be marked as completed tomorrow.
    4. A item should also be created anyway once the time interval is reached.
3. Task dependencies
   1. If all other dependent tasks are completed, the task should be unblocked and can be marked as other statuses.
   2. Loop through all dependencies and check if all are completed. Status includes Completed and Archived can be considered as completed.
4. Filtering and sorting
   1. Filter and sort by status, priority, dependency state are easier to implement
   2. Filter by single due date provides limited result back to users. It should be filtered by date range instead to provide more flexibility.
   3. Name is the main challenge here, it should be flexible enough since users may not know the exact name of the task, so we need to use a more flexible search.
      1. Full text search will be an overkill for this, the name field is only a single text field. Although it can be long, its purpose of this field is for a concise, quick-to-reason about the task.
      2. Search by pattern match first and then fall back to fizzy search if no item is found.

## Skills plugins

Main IDE = Cursor

### Superpowers

[Superpowers](https://github.com/obra/superpowers)

`/write-plan` - Write a plan for a feature


[x] Complete the entire system design
[ ] Complete the entire application design
[x] Decide what features to implement and what not to
[x] Tidy up the design documents so the structure is clear, easy to understand and presentable
[ ] Sign off to cloud agents to build the application
[ ] Setup cloudflare as a hosting environment
