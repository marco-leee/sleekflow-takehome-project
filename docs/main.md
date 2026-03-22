# Sleekflow Todo list app

## Table of Contents

- [Sleekflow Todo list app](#sleekflow-todo-list-app)
  - [Table of Contents](#table-of-contents)
  - [Project / Operation Team Analysis](#project--operation-team-analysis)
    - [Thought process](#thought-process)
  - [User Behaviour Journey](#user-behaviour-journey)
  - [Application Analysis / Features](#application-analysis--features)
    - [Analysis](#analysis)
    - [Features](#features)
      - [Functional requirement](#functional-requirement)
      - [Non-functional requirement](#non-functional-requirement)
  - [System Analysis and Design](#system-analysis-and-design)
  - [Tech Stack](#tech-stack)
  - [Frontend](#frontend)
  - [Backend](#backend)
  - [Database](#database)
  - [DevOps / Infrastructure](#devops--infrastructure)
    - [AWS](#aws)
    - [Cloudflare](#cloudflare)
  - [Final Project Scope](#final-project-scope)
    - [In Scope](#in-scope)
    - [Out of Scope](#out-of-scope)

## Project / Operation Team Analysis

### Thought process

1. User based Analysis
   1. 100M daily active users <- project assumption
   2. No single country would contribute toward all the DAUs unless its state controlled. Realistically, it's safe to assume multiple countries from multiple continents.
   3. With such a large number of users signed up to the app and concurrently using the productivity app, it's reasonable to assume that the majority of the subscribed clients are businesses, regardless of sizes, with a small percentage of individuals.
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
2. Operation / Development team analysis
   1. Technical Development / Operation team
   3. Finance and Accounting team
      1. Manage subscription, billing, invoices, payments, etc.
   4. Marketing and Sales team
      1. CRM, SEO and content marketing are very likely required.
   5. Customer Support team
      1. Supporting business operations and user queries.
   6. Legal and Compliance team
      1. GDPR, HIPAA, PCI DSS, etc.
      2. Need to comply with the laws and regulations of the countries where the users are located.
   7. Data and Analytics team
      1. Data and analytics are very likely required.
      2. Error tracking, metrics, logging etc.
   8. NOTE
      1. All not limited to human only, AI agents are very likely to be used to assist the human operations.
      2. Teams required are not limited to the ones listed above, but are likely to be more.


## User Behaviour Journey

Journeys share a common entry, then differ by audience (individual, SMB, corporate/organization).

### Common entry (all users)

| Step | What happens |
|------|----------------|
| 1 | Users arrive on the landing page from various sources. |
| 2 | They review the app’s features and benefits. |

### Individual users

| Step | What happens |
|------|----------------|
| 1 | Navigate to the login page when interested. |
| 2 | Sign in with OAuth (Google, Apple, Facebook, etc.) or email and password. |
| 3 | Create a new account or sign in to an existing one. |
| 4 | Open the TODO list page. |
| 5 | Manage TODOs. |

### Small and medium businesses (SMB)

- Same core flow as **individual users**, plus **self-service subscription**.
- **Console:** permissions, workspace, and team management.
- **Operations:** auditability, logging, and metrics are often required.

### Corporate and organization users

**Product**

- Same capabilities as SMB, plus **API access** to the app.

**Sales-led evaluation**

- Prospects often **contact the vendor** for evaluation before onboarding.

**What the sales team needs**

| # | Responsibility |
|---|----------------|
| 1 | Thorough understanding of the app |
| 2 | Clear picture of product features |
| 3 | Understanding of the client’s pain points and challenges |
| 4 | Alignment of features with the client’s business needs and goals |
| 5 | Product demos |
| 6 | Upsell where appropriate |

**Client internal evaluation** (fit for the business)

- Depends on the client’s **internal** operations and processes.
- Depends on the sales team’s **follow-up**.

**After the decision to onboard**

| Step | What happens |
|------|----------------|
| 1 | Call to agree onboarding details. |
| 2 | Configure the app for the client’s business. |
| 3 | Train the client’s users. |
| 4 | Ongoing support and maintenance. |

## Application Analysis / Features

### Analysis

1. Write heavy application
   1. Read only once on app start up
   2. Then just all editing the todo list and its items
2. Multi-tenant application
   1. Each tenant has its own data and configuration.
   2. Each tenant is isolated from other tenants.
3. Real time collaboration
   1. Multiple writes to the same row are expected.
   2. Many users are expected to be editing the same TODO list at the same time.
4. Permission
   1. 3 types of users: Admin, Manager, Normal users
   2. Admin: have full permission over the entire tenant workspace.
      1. Subscription, billing, invoices, payments, etc.
      2. And all of manager permissions
   3. Manager
      1. have permission to manage the workspace and the users in the workspace.
      2. Permission, audit, loggin etc.
      3. And all of normal users
   4. Normal users:
      1. have permission to view, edit the TODO list
5. Logging and auditing
   1. All actions are logged, viewable by the admin and manager users


### Features

#### Functional requirement

The rest of this document (journeys, analysis, system design, scope) is summarized below under **five features**, in this order: **logging**, **permission**, **authentication**, **TODO list**, and **real-time collaboration**. Infra-only content stays in [System Analysis and Design](#system-analysis-and-design).

##### Logging

| Where it appears | What the document says |
|------------------|-------------------------|
| Final scope | **In scope** — logging and auditing. |
| User / ops analysis | **Auditability** for compliance/security; **logging** and tracing changes; SMB journey often needs auditability, logging, **metrics**; ops needs error tracking, **metrics**, logging. |
| Application analysis | **All actions** logged; **Admin** and **Manager** can view logs. |
| Client | **Logging and auditing** page (access per roles above). |
| Backend | **logging** domain and logging component. |
| System design | **Observability**: logs and metrics for debugging/compliance. **Audit events**: TODO create/update/delete, status transitions, dependency changes, recurrence generation. **Health endpoint** for uptime. **Per-tenant API usage** insight. **Rate limiting** and **request size limits** (e.g. API gateway). |
| DevOps (infra) | Monitoring stacks named (e.g. CloudWatch, Grafana) — detail in system/infra sections. |

##### Permission

| Where it appears | What the document says |
|------------------|-------------------------|
| Final scope | **In scope** — permission management. |
| User / ops analysis | Orgs need **permission management** and task partitioning. |
| User journey (SMB) | **Console** for **permissions**, workspace, and team management. |
| Client | **Permission management** page. |
| Backend | **permission** domain and permission component. |
| Roles (analysis) | **Admin** — full tenant workspace control, including subscription, billing, invoices, payments, **and** all Manager abilities. **Manager** — manage workspace and users; **permission**, audit, logging areas **and** all Normal abilities. **Normal** — view and edit TODO lists. |
| Multitenancy (analysis + system) | Each tenant has **own data and configuration**; tenants **isolated**. Enforce at **database**, **data model**, and **query** level. |

##### Authentication

| Where it appears | What the document says |
|------------------|-------------------------|
| Final scope | **In scope** — authentication. |
| MVP scope notes | If time is limited, **full auth** may be deferred; still keep identity assumptions aligned with permission and tenancy. |
| User journey | Login page; **OAuth** (Google, Apple, Facebook, etc.) or **email and password**; new account or existing account. |
| Client | **Authentication** page. |
| Backend | **auth** domain and authentication component. |
| System design | All endpoints validate input and return safe errors; when authentication exists, enforce **tenant (org/user) scoping** at data model and query level (see Permission). |

##### TODO list

| Where it appears | What the document says |
|------------------|-------------------------|
| Final scope | **In scope** — TODO list management: **CRUD**, **filtering/sorting**, **recurring tasks**, **concurrent updates** (see Real-time collaboration). |
| MVP scope notes | Prioritize **CRUD**, **dependencies**, **recurrence**, **filtering/sorting**, **large-list performance**; may defer **bulk actions**. |
| User journey | **TODO list** page; manage TODOs after sign-in. **Landing** page for discovery (before login). Client should be **responsive** / work on **mobile** (ops analysis). |
| Analysis | **Write-heavy**: read once at startup, then ongoing list/item edits. **Multi-tenant** TODO data per tenant (isolation under Permission). |
| Backend | **todo** domain; **database** component. Web UI uses API for TODO flows alongside auth, permission, logging. |
| Data fields | **ID**, **name**, **description**, **due date**, **status** (Not Started / In Progress / Completed / Archived), **priority** (Low / Medium / High). |
| CRUD & lifecycle | Full create/read/update/**delete**; **no permanent loss** on delete (**soft delete**, recovery/audit); exclude soft-deleted rows from default queries. |
| Recurring | **Daily**, **weekly**, **monthly**, **custom**; on **Completed**, create **next occurrence**; **transaction** when generating next under concurrency; **UTC** + optional user/org **timezone** for due dates/recurrence. |
| Dependencies | Depends on **one or more** TODOs; cannot **In Progress** until dependencies **Completed**; **backend** enforcement; API for **blocked/unblocked** filtering. |
| Filtering | **Status**, **priority**, **due date**, **dependency state** (blocked / unblocked). |
| Sorting | **Due date**, **priority**, **status**, **name**. |
| Scale & quality | **10,000+** TODOs without bad UX; **~500ms** typical API response target; **server-side** pagination/filter/sort; **indexes** (status, priority, due date, name); list **virtualization** in UI; tests, local runability, **API docs** + README (non-functional section). |
| Out of scope (reminder) | No **SEO** for tasks; **DB replication/backup** out of scope per final scope. |

##### Real-time collaboration

| Where it appears | What the document says |
|------------------|-------------------------|
| Application analysis | **Multiple writes** to the same row; **many users** on the **same TODO list** at once. |
| System analysis | **Concurrency**; avoid **lost updates**; keep data **consistent**. |
| Non-functional | API supports **multiple users** on the **same TODO list** concurrently. |
| MVP scope notes | **Real-time sync** may be **deferred**; still prioritize correctness under concurrency. |
| System / infra | **WebSockets** for realtime collaboration; **least connections** and **sticky sessions** for WebSocket traffic (gRPC load-balancing noted separately for unary calls). |
| Related TODO behavior | **Dependencies** and **recurrence** must stay correct under **concurrent** updates (backend rules, transactional recurrence). |

#### Non-functional requirement

Below are **non-functional requirements and quality targets** as stated across this document (user/ops analysis, application features, system analysis, infra notes, and final scope). Items that are **out of scope for implementation** in this project are still listed where the doc describes a **target** for a fuller product, with a note.

##### Availability & operability

| Requirement | Where it is stated |
|-------------|-------------------|
| Service should be **available globally**, **24/7/365** | System analysis |
| Expose a **health endpoint** for uptime monitoring | System analysis (observability) |

##### Scalability & capacity (design assumptions)

| Requirement | Where it is stated |
|-------------|-------------------|
| Assumption of up to **100M daily active users** and corresponding data volume | Thought process; system analysis (**100M+** DAU and data) |
| System must **scale** to that level (long-term / full-product framing) | System analysis |
| **Per-tenant / per-list** workloads: TODO operations stay usable with **10,000+** items | Non-functional bullets; system analysis; functional (TODO list) summary |

##### Performance

| Requirement | Where it is stated |
|-------------|-------------------|
| Typical **API response time under 500ms** for this app | System analysis |
| **Server-side** pagination, filtering, and sorting — do **not** load all items at once | System analysis |
| **Database indexes** for common access patterns (**status**, **priority**, **due date**, **name**) | System analysis |
| **UI virtualization** (or equivalent) for very long lists | System analysis |

##### Concurrency, consistency & correctness

| Requirement | Where it is stated |
|-------------|-------------------|
| **Multiple users** may use the **same TODO list** **concurrently** | Non-functional; analysis; system analysis |
| Avoid **lost updates**; keep data **consistent** under concurrent edits | System analysis |
| **Next occurrence** for recurring TODOs created in a **transaction** so concurrent completes do not create duplicate “next” tasks | System analysis |
| **Dependency** and **recurrence** rules remain correct under **concurrent** updates | Functional (real-time collaboration); system analysis |

##### Data lifecycle, retention & time

| Requirement | Where it is stated |
|-------------|-------------------|
| Deleting a TODO must **not** permanently remove data (**soft delete**, recovery, audit trail); e.g. **`deleted_at`** | Non-functional; system analysis |
| Soft-deleted rows **excluded from default list** queries | System analysis |
| **Deterministic** recurrence rules | System analysis |
| Store timestamps in **UTC**; support **user/org timezone** preference for due dates and recurrence where needed | System analysis; functional (TODO list) |

##### Multitenancy & isolation

| Requirement | Where it is stated |
|-------------|-------------------|
| Each tenant’s data **isolated** from others | Analysis; system analysis |
| Enforce isolation at **database**, **data model**, and **query** levels | System analysis |
| When authentication exists, enforce **org/user (tenant) scoping** at data model and query level | System analysis (security baseline) |
| **Per-tenant API usage** monitoring / insight | System analysis |

##### Security baseline & abuse prevention

| Requirement | Where it is stated |
|-------------|-------------------|
| **Validate** all API inputs; return **safe** error messages (no sensitive leakage) | System analysis; functional (authentication) |
| **Rate limiting** and **request size limits** to limit abuse (e.g. at API gateway) | System analysis; multitenancy |
| **Encrypt databases at rest**; **encrypt secrets at rest** | System / infra (security) |
| **Implementation of full industry security standards** (SOC 2, ISO 27001, etc.) is **out of scope** per final scope — org expectations are noted in thought process only | Final scope (out of scope); thought process |

##### Observability, logging & audit

| Requirement | Where it is stated |
|-------------|-------------------|
| **Logs and metrics** for debugging and compliance | System analysis; thought process (error tracking, metrics) |
| **Audit-relevant** events: TODO create/update/delete, **status** changes, **dependency** changes, **recurrence** generation | System analysis |
| Operational monitoring stacks mentioned (**CloudWatch**, **Grafana**) in infra discussion | System / DevOps sections |

##### Client experience (cross-cutting)

| Requirement | Where it is stated |
|-------------|-------------------|
| **Responsive** UI; usable on **mobile** devices | Thought process; functional (TODO list / journey) |
| **No SEO** requirement for task content (not public) | System analysis |

##### Privacy & data location (stated target)

| Requirement | Where it is stated |
|-------------|-------------------|
| For **GDPR**, store data in the **region where the user is located** | System analysis (load balancer / data) |
| Comply with **laws and regulations** of countries where users reside (high-level ops expectation) | Thought process (legal/compliance) |

##### Engineering quality & deliverables

| Requirement | Where it is stated |
|-------------|-------------------|
| **Request validation** and **error handling** on the API | Non-functional; system analysis |
| **Automated tests** for core behavior (**unit** and/or **integration**) | Non-functional |
| **Easy to run and test locally** | Non-functional |
| **API documentation** (e.g. OpenAPI / Swagger / Postman) and **README** setup instructions | Non-functional |

##### MVP trade-offs (from scope notes)

| Note | Where it is stated |
|------|-------------------|
| Prioritize **correctness** (CRUD, dependencies, recurrence, filter/sort) and **large-list performance** first | Final scope (scope notes) |
| May defer **real-time sync**, **bulk actions**, and **full auth** if time-constrained | Final scope (scope notes) |
| **Infrastructure and deployment**, **DB replication and backup** are **out of scope** for this write-up’s delivery boundary | Final scope (out of scope) — broader doc still describes multi-region replication as a **future / full-system** direction |

## System Analysis and Design

2. System Analysis
   1. Required to be available globally, 24/7/365. 
   2. Must be scalable to handle 100M+ daily active users and data.
   3. No need to optimised for SEO since tasks are not publically accessible.
   4. Concurrency is expected (multiple users editing the same TODO list at the same time); system must avoid lost updates and keep data consistent.
   5. Multitenancy
      1. Must ensure that each tenant's data is isolated from other tenants.
      2. API usage monitor should be in-place. Provide insight into the usage of the API by the tenants
      3. To avoid abuse, rate limiting and request size limits should be in-place.
      4. Tenant isolation should be enforced at the database level and data model + query level.
      5. Whether 
   6. Performance target: TODO list operations must remain responsive with **10,000+** items.
      1. Standard API response time should be less than 500ms for the purpose of this app.
      2. Server-side pagination + filtering/sorting (avoid loading all items at once).
      3. Proper database indexes for common query patterns (status, priority, due date, name).
      4. UI techniques like virtualization for long lists.
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



1. Databases across 3 main continents: Asia, Europe, America
   1. Replication
   2. Backup
   3. Fallback
2. DNS
   1. Regional DNS: direct traffic to the closest region
3. CDN
   1. Mainly only used for static assets / SPA
4. Networking
   1. All traffic goes through public subnets into private subnets.
   2. No services are hosted in public subnets. Only NAT gateways and load balancers are in public subnets.
   3. All services are hosted in private subnets, connected to internet via NAT gateways.
5. Load balancer
   1. Mainly for API traffic
   2. Each region has a separate load balancer.
   3. DNS directs traffic to the closest region where each continent has a separate load balancer.
   4. Load balancer distributes traffic to the closest server in the region.
   5. Offload TLS certificate verification to the load balancer, enhance system latency.
   6. Round robin load balancing for unary gPRC calls
   7. Least connections and sticky sessions for real time collaboration through websocket.
   8. To comply with GDPR, all data is stored in the region where the user is located.
6. API gateway
   1. Mainly for API traffic
   2. Each region has a separate API gateway.
   3. Offload rate limiting and request size limiting to the API gateway.
7. Container orchestration
   1. Use docker as hosting platform for the services.
   2. Use K8s as container orchestration platform.
   3. Each region has a separate K8s cluster.
   4. Internal service-to-service communication is through K8s services
   5. Use enovy for service discovery.
8. Cloud provider
   1. AWS
      1. For real world use cases, AWS is the preferred cloud provider.
      2. AWS is the most mature cloud provider in the market.
      3. A lot of experience and knowledge in using AWS among the market.
      4. Best for cooperation and organization use cases.
   2. Cloudflare
      1. For this demo app, going with Cloudflare is the preferred choice.
      2. Easy to use and setup, no need to manage the infrastructure.
      3. Best for personal use cases.
9. Databases
   1. Databases across 3 main continents: Asia, Europe, America. Keeping latency low and data close to the users.
   2. Candidates
      1. Cassandra
      2. CockroachDB
      3. ScyllaDB
   3. Replication
      1. Data needs to be replicated to all the regions.
   4. Backup
      1. Data needs to be backed up to all the regions.
   5. Fallback
      1. If a region is down, the data should be available in the other regions.
10. Monitoring and logging
   1. AWS Cloudwatch
   2. Open source grafana for monitoring and logging.
      1. Best for cooperation and organization use cases.
      2. Large community and ecosystem.
      3. With enough resources
11. Security
   1. All databases are encrypted at rest.
   2. All secrets are encrypted at rest.


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
4. Security
5. DB replication and backup

3. Scope Notes (for MVP)
   1. Prioritize correctness of CRUD, dependencies, recurrence generation, filtering/sorting, and performance for large lists.
   2. Defer “nice-to-haves” like real-time sync, bulk actions, and full auth if time is limited.