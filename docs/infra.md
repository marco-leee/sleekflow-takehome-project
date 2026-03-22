# Infrastructure

This document summarizes deployment shapes described in [main.md](./main.md): **AWS** for a real-world, multi-region production footprint, and **Cloudflare** for a lightweight demo.

## Infrastructure on AWS (real production deployment)

Production targets **global availability**, **multi-tenant** isolation at large scale, and **regional data placement** (for example GDPR: keep user data in the region where the user is located).

- **Traffic and regions** — **Geo DNS** sends users to the nearest of three continental footprints: **Americas**, **Europe**, and **Asia**. A **CDN** delivers static SPA assets.
- **Per-region entry** — An **application load balancer** terminates **TLS**. Use **round robin** for unary **gRPC** calls; use **least connections** and **sticky sessions** for **WebSocket** / real-time collaboration. An **API gateway** in each region enforces **rate limiting** and **request size limits**.
- **Application platform** — **Kubernetes** runs **Docker** images. **Envoy** handles **service discovery**; service-to-service traffic stays on the cluster network.
- **Data** — Databases follow a global plan for **replication**, **backup**, and **failover**. Candidate stores include **Cassandra**, **CockroachDB**, and **ScyllaDB**.
- **Security and network layout** — Databases and secrets are **encrypted at rest**. Only **NAT gateways** and **load balancers** live in **public subnets**; workloads run in **private subnets** and reach the internet via NAT.
- **Observability** — **AWS CloudWatch** and **Grafana** support monitoring and logging.

```mermaid
flowchart TB
  subgraph Clients["Clients"]
    U[Web and mobile users]
  end

  subgraph EdgeGlobal["Global edge"]
    GeoDNS[Geo DNS<br/>route to nearest region]
    CDN[CDN<br/>static SPA assets]
  end

  subgraph Region["Each region Americas / Europe / Asia"]
    direction TB
    ALB[Application load balancer<br/>TLS offload public subnet]
    GW[API gateway<br/>rate limit and request size limits]
    subgraph VPC["VPC"]
      NAT[NAT gateway public subnet]
      subgraph Private["Private subnets"]
        K8s[Kubernetes Docker]
        Envoy[Envoy service discovery]
        SVC[App services gRPC HTTP]
        RT[Realtime WebSocket tier<br/>sticky least connections]
      end
    end
    ALB --> GW
    GW --> K8s
    K8s --> Envoy
    Envoy --> SVC
    Envoy --> RT
    K8s --> NAT
  end

  subgraph Data["Data plane multi-region"]
    DB[(Distributed DB<br/>replication backup failover)]
  end

  subgraph Obs["Observability"]
    CW[AWS CloudWatch]
    GF[Grafana]
  end

  U --> GeoDNS
  U --> CDN
  GeoDNS --> ALB
  SVC --> DB
  RT --> DB
  K8s -.-> CW
  K8s -.-> GF
```

## Infrastructure on demo app

The **demo app** favors **Cloudflare** over full multi-region **AWS** so you can ship quickly with less operations work.

- **Edge** — **DNS** and **CDN** sit in front of the app.
- **Frontend** — **Cloudflare Pages** hosts the **React** app with **React Router** (SPA routing, no separate SSR tier required for this sketch).
- **Data** — A **single** (or lightly replicated) **hosted database** is enough to try TODO flows. The diagram assumes the SPA talks to the database **directly from the client** (for example via a **BaaS / hosted DB SDK**), so there is **no dedicated Go (or other) API service** in this demo path.
- **Scope** — This intentionally skips **Kubernetes**, **multi-region replication**, and the full production **security / compliance** program; those stay **out of scope** for the take-home boundary in [main.md](./main.md).

```mermaid
flowchart LR
  subgraph Users["Users"]
    B[Browser]
  end

  subgraph CF["Cloudflare"]
    DNS[DNS and proxy]
    Edge[Edge CDN and caching]
    Pages[Cloudflare Pages<br/>React Router SPA]
  end

  DB[(Hosted database<br/>single primary)]

  B --> DNS --> Edge --> Pages
  Pages -->|Client SDK direct access| DB
```
