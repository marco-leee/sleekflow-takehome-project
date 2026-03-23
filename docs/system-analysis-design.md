# System Analysis and Design

[← Back to documentation index](main.md)

1. Required to be available globally, 24/7/365. 
2. Must be scalable to handle 100M+ daily active users and data.
   1. 100M+ DAU = 100000000/24 = ~4,200,000 users per hour.
   2. Assume people takes 15 minutes to complete a task and update the TODO list. So 4,200,000 users per hour * 4 items (1 items / 15 minutes) = 16,800,000 requests per hour.
   3. Giving a buffer of 20% to the assumption, system should be able to handle 20,160,000 requests per hour.
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
8.  Recurring TODOs require deterministic scheduling rules.
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
