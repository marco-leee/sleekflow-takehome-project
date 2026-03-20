# Sleekflow Todo list app

## Project / System Analysis

## Thought process

1. User based Analysis
   1. 100M daily active users <- project assumption
   2. No single would contribute toward all the DAUs. Assume multiple countries from multiple continents.
   3. With such a large number of users signed up to the app, it's reasonable to assume that subscribed clients are from cooperations and organizations.
   4. Expect the app to be used by a large number of users in different timezones.
   5. These cooperations across the world. Except Antarctica for lowest poplution, all other continents are expected to have a significant number of users.
   6. Cooperations are likely required to have significant measures to ensure the security and privacy of the app.
      1. Security standards are very likely required
      2. Name a few such as SOC 2, ISO 27001, GDPR, HIPAA, PCI DSS, etc.
   7. Also they may require to integrate with their existing systems and processes such as ERP, CRM etc.
      1. API access to the app is likely required.
   8. Since these cooperations are structured organisations, they will require to have permission management, task partitioning for the app.
   9. Auditability is also very important when it comes to compliance and security. Logging, tracing changes are very likely required.
   10. Mobile is essential to daily life, users are likely to interact with the app on mobile devices. Must be designed to be responsive and work on mobile devices.
2. System Analysis
   1. Required to be available globally, 24/7/365. 
   2. Must be scalable to handle large number of users and data.
   3. No need to optimised for SEO since tasks are not publically accessible.
   4. Concurrency is expected (multiple users editing the same TODO list at the same time); system must avoid lost updates and keep data consistent.
   5. Multitenancy
      1. Must ensure that each tenant's data is isolated from other tenants.
      2. API usage monitor should be in-place. Provide insight into the usage of the API by the tenants
      3. To avoid abuse, rate limiting and request size limits should be in-place.
      4. Tenant isolation should be enforced at the database level and data model + query level.
      5. Whether 
   6. Performance target: TODO list operations must remain responsive with **10,000+** items.
      1. Server-side pagination + filtering/sorting (avoid loading all items at once).
      2. Proper database indexes for common query patterns (status, priority, due date, name).
      3. UI techniques like virtualization for long lists.
   7. Data lifecycle: deleted TODOs must not be permanently lost.
      1. Use soft-delete (e.g., `deleted_at`) to support recovery/audit.
      2. Ensure deleted items are excluded from default list queries.
   8. Recurring TODOs require deterministic scheduling rules.
      1. When a recurring TODO is marked **Completed**, create the next occurrence in a transaction to prevent duplicate “next tasks” under concurrent updates.
      2. Consider timezone handling for due dates and recurrence calculations (store timestamps in UTC; store user/org timezone preference if needed).
   9.  Dependency constraints must be enforced centrally.
      1. Backend should prevent status transitions to **In Progress** when blocked (cannot rely on UI-only validation).
      2. Provide an API representation for “blocked/unblocked” to enable filtering.
   10. Security baseline assumptions (even if auth is out of scope initially).
      1. All endpoints should validate input and return safe error messages.
      2. Rate limiting and request size limits to reduce abuse risk.
      3. If authentication is added later, enforce tenant isolation (org/user scoping) at the data model + query level.
   11. Observability/operability: logs and metrics are important for debugging and compliance.
       1. Audit-relevant events: create/update/delete, status transitions, dependency changes, recurrence generation.
       2. Health endpoint for uptime monitoring.
3. Operation team analysis
   1. Assume a team of 10 people to operate the system.
   2. 
4. Scope Notes (for MVP)
   1. Prioritize correctness of CRUD, dependencies, recurrence generation, filtering/sorting, and performance for large lists.
   2. Defer “nice-to-haves” like real-time sync, bulk actions, and full auth if time is limited.

## Final Project Scope

### In Scope

1. TODO list management
   1. CRUD operations
   2. Filtering and sorting
   3. Recurring tasks
   4. Concurrent update 
2. Authentication
3. Permission management
4. Logging and auditing


### Out of Scope

1. Infrastructure and deployment
2. Implementation of industry security standards
3. Integration with existing systems and processes


## User Behaviour Journey




## Functional requirement

- **TODO management**
  - **TODO fields**: unique ID, name, description, due date, status (Not Started / In Progress / Completed / Archived), priority (Low / Medium / High)
  - **CRUD**: create, read, update, delete TODOs

- **Recurring tasks**
  - **Recurrence types**: daily, weekly, monthly, or custom schedule
  - **Auto-next occurrence**: when a recurring TODO is marked **Completed**, create the next occurrence automatically based on its schedule

- **Task dependencies**
  - **Dependency model**: a TODO can depend on one or more other TODOs
  - **Blocking rule**: a dependent TODO cannot move to **In Progress** until **all** dependencies are **Completed**

- **Filtering and sorting**
  - **Filter by**: status, priority, due date, dependency status (blocked / unblocked)
  - **Sort by**: due date, priority, status, name

- **Web UI**
  - **Capabilities**: create, edit, delete, filter, sort TODOs via a simple functional interface

- **Backend API**
  - **Requirement**: provide an API to support the above features (used by the web UI)

## Non-functional requirement

- **Concurrency**
  - **Multi-user access**: API supports multiple users accessing the same TODO list concurrently

- **Data retention**
  - **No permanent loss on delete**: deleting a TODO must not permanently remove data (e.g., soft delete / recovery / audit trail)

- **Performance / scalability**
  - **Large lists**: handle **10,000+** TODO items without degrading user experience

- **Quality / operability**
  - **Error handling & validation**: implement request validation and error handling for API requests
  - **Testing**: write tests for core functionality (unit and/or integration)
  - **Local runability**: system should be easy to run and test locally
  - **Documentation**: provide API documentation (e.g., OpenAPI/Swagger/Postman) and setup instructions in a README

[System](#System-Design)

## System Design

1. Web / Mobile Application
   1. Pages
      1. TODO list page
      2. Authentication page
      3. Permission management page
      4. Logging and auditing page
   2. Components
2. Backend
   1. Domains
      1. todo
      2. auth
      3. permission
      4. logging
   2. Components
      1. Authentication
      2. Permission
      3. Logging
      4. Database
3. Infrastructure / DevOps
   1. AWS
   2. Cloudflare




## Tech Stack

## Frontend

1. React
2. Svelte


## Backend



## Database

1. Postgres


## DevOps / Infrastructure

### AWS

### Cloudflare

1. Cloudflare Page
2. 