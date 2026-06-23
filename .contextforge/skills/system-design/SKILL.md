# System Design

## Overview

System design is the process of defining the architecture, components, interfaces, and data flow for a system to satisfy specified requirements at a given scale. Good system design makes explicit the trade-offs between consistency, availability, performance, cost, and operational complexity.

This skill covers the full process: from requirements to production-ready architecture decisions, with component selection guides, scalability patterns, and trade-off documentation formats.

---

## The Eight-Phase Design Process

Work through each phase in order. Returning to an earlier phase when you discover new information is normal. Skipping phases is not.

### Phase 1: Requirements Clarification

Before designing anything, understand what you are building and for whom.

**Functional requirements** — what the system must do:
- Core features (be specific: "users can upload images up to 10 MB" not "file uploads")
- API consumers: web app, mobile, third-party, internal services?
- Consistency requirements per feature: does "like count" need to be exact in real time?

**Non-functional requirements** — quality attributes:
- Scale: daily active users, peak concurrent users, growth rate
- Read/write ratio (read-heavy systems are designed differently from write-heavy ones)
- Latency targets: P50, P95, P99 for critical paths
- Availability target: 99.9%, 99.99%, 99.999%
- Durability: can data be lost? Under what conditions?
- Geographic distribution: single-region or multi-region?

**Scope boundaries** — equally important:
- What is explicitly out of scope for this design?
- What can be deferred to V2?
- What existing systems does this integrate with?

---

### Phase 2: Scale Estimation

Estimate before selecting components. Rough order-of-magnitude estimates prevent catastrophically wrong choices.

**Traffic estimation:**
```
QPS = Daily Active Users × Average Requests Per User Per Day / 86,400
Peak QPS ≈ QPS × 2–3 (for typical diurnal patterns)
```

**Storage estimation:**
```
Daily storage = Writes per day × Average object size
5-year storage = Daily storage × 365 × 5 × replication factor
```

**Bandwidth estimation:**
```
Inbound bandwidth = Peak write QPS × Average write payload size
Outbound bandwidth = Peak read QPS × Average response size
```

**Cache estimation:**
```
Cache target = Hot data (typically 20% of data serves 80% of reads)
Cache size = Hot data percentage × total dataset size
```

Use these estimates to set constraints on your component choices: a system with 50k QPS has different database requirements than one with 500 QPS.

---

### Phase 3: System Boundaries and APIs

Define the contract before the internals.

**External API design:**
- List every API endpoint or event the system exposes
- For each: method, path/topic, request shape, response shape, error states
- Idempotency keys on all mutating operations
- Versioning strategy (URI versioning, header versioning)

**API style selection:**

| Style | Use when |
|---|---|
| REST | Public APIs, resource-centric, broad client compatibility |
| GraphQL | Multiple client types with different data needs, flexible queries |
| gRPC | Internal service-to-service, high throughput, strong typing needed |
| WebSocket | Real-time bidirectional communication |
| Async/Events | Decoupled consumers, workflows, notifications |

**System boundaries:**
- What data does this system own? (Single source of truth principle)
- What data does it read from other systems?
- What events does it produce? What events does it consume?

---

### Phase 4: Data Model Design

Access patterns determine schema. Schema does not determine access patterns.

**Step 1 — List every read access pattern:**
```
- Get user by ID
- Get user's last 50 posts, sorted by time descending
- Search posts by keyword
- Get all users who liked a post
```

**Step 2 — List every write access pattern:**
```
- Create user
- Create post
- Add like (must be idempotent)
- Update user profile
```

**Step 3 — Choose storage engine(s):**

| Engine type | Choose when |
|---|---|
| Relational (PostgreSQL, MySQL) | Transactions required; complex joins; normalized data; strong consistency |
| Document (MongoDB, Firestore) | Flexible schema; hierarchical/nested data; per-document consistency sufficient |
| Wide-column (Cassandra, DynamoDB) | Massive write throughput; known access patterns; time-series; partition by key |
| Key-value (Redis, DynamoDB) | Caching; sessions; rate limiting; simple lookups |
| Graph (Neo4j, Neptune) | Relationship traversal; social graphs; recommendations |
| Search (Elasticsearch, Typesense) | Full-text search; faceted filtering; analytics over logs |
| Time-series (InfluxDB, TimescaleDB) | Metrics; IoT; financial ticks; append-only time data |
| Object storage (S3, GCS) | Blobs; media files; backups; large artifacts |

**Step 4 — CAP implications:**

For every data store, state explicitly:
- Which two CAP properties it prioritizes (CP or AP)
- What degrades under a network partition
- Whether that trade-off is acceptable for this system's consistency requirements

**Step 5 — Indexing strategy:**
- Primary key: what query is it optimized for?
- Secondary indexes: each one costs write amplification
- Composite indexes: column order matters (most selective column first for range queries)
- Never over-index: each index slows writes

---

### Phase 5: High-Level Architecture

Sketch the system at the component level. No implementation detail yet.

**Core components to identify:**
- Clients (web, mobile, CLI, third-party)
- Load balancers / API gateway
- Application servers / services
- Data stores (databases, caches, object storage)
- Message brokers / queues
- CDN (for static assets and geographic distribution)
- Background workers

**Communication patterns — choose deliberately:**

| Pattern | Use when |
|---|---|
| Synchronous (REST, gRPC) | Caller needs the result immediately; operation must complete before response |
| Asynchronous (queue, event) | Caller does not need immediate result; decoupling is more important than latency |
| Event streaming (Kafka) | Multiple consumers; replay needed; order matters; high throughput |
| Pub/sub (SNS, Redis Pub/Sub) | Fan-out; notifications; ephemeral events |

**Topology anti-patterns:**
- Synchronous chains of 3+ services in a hot path — compounding latency and failure probability
- Services calling each other in a cycle — creates deadlock risk
- Shared databases between services — violates service ownership of data

---

### Phase 6: Component Deep Dives

Pick the 2–3 components with the highest scale challenge, highest failure risk, or most novel design. Go deep on each.

**Template for each deep dive:**

1. What does this component do?
2. What are its scale requirements? (from Phase 2 estimates)
3. What is its internal design?
4. How does it handle failure?
5. How does it scale? (horizontal? sharding? replication?)
6. What are its consistency guarantees?

**Common deep dives:**

**Database scaling path:**
- Single primary → add read replicas (reduces read load, adds replication lag)
- Vertical scale the primary → limited ceiling, expensive
- Functional partitioning → separate writes across domain-specific databases
- Horizontal sharding → data partitioned across nodes; adds routing complexity

**Cache architecture:**
- Cache-aside (lazy loading): app checks cache first, loads from DB on miss, writes to cache
- Write-through: app writes to cache and DB together; cache always current, write amplification
- Write-back: app writes to cache only, async flush to DB; fast writes, risk of data loss
- TTL strategy: too short = high miss rate; too long = stale data; event-based invalidation when possible

**Queue / async worker design:**
- At-least-once delivery: workers must be idempotent (deduplication key or natural idempotency)
- Visibility timeout: longer than max processing time to avoid double-processing
- Dead-letter queue: failed messages must be routed somewhere for investigation
- Backpressure: workers must have a max concurrency ceiling to avoid overwhelming downstream systems

---

### Phase 7: Trade-off Analysis and Documentation

Every significant architectural decision must be documented before the design is final.

**Architecture Decision Record (ADR) format:**

```markdown
## Decision: [Short title]

**Date:** YYYY-MM-DD
**Status:** Proposed / Accepted / Superseded

### Context
What problem needs to be solved? What constraints exist?

### Options Considered

**Option A — [Name]**
- Description: ...
- Pros: ...
- Cons: ...

**Option B — [Name]**
- Description: ...
- Pros: ...
- Cons: ...

**Option C — [Name]**
- Description: ...
- Pros: ...
- Cons: ...

### Decision
Chosen: Option [X]

### Rationale
Why this option wins given the specific context, constraints, and priorities.

### Consequences
- What is now easier?
- What is now harder?
- What follow-up decisions does this create?
```

**Common trade-offs to document explicitly:**

| Decision | Key trade-off axis |
|---|---|
| SQL vs NoSQL | Consistency & relational queries vs write throughput & schema flexibility |
| Monolith vs microservices | Simplicity & deployment atomicity vs independent scaling & team autonomy |
| Sync vs async | Latency & simplicity vs decoupling & throughput |
| Strong vs eventual consistency | Correctness guarantees vs availability under partition |
| Normalization vs denormalization | Storage efficiency & update anomalies vs read performance |
| Cache write-through vs write-back | Read freshness vs write latency & durability risk |

---

### Phase 8: Production Readiness Review

Verify the design addresses every item. A design missing these is not complete.

**Availability and resilience:**
- [ ] HA strategy defined (active-active or active-passive)
- [ ] Single points of failure identified and mitigated
- [ ] Circuit breakers on all external service calls
- [ ] Retry strategy with exponential backoff and jitter on transient failures
- [ ] Timeout defined on every network call
- [ ] Graceful degradation when non-critical dependencies fail

**Data safety:**
- [ ] RPO defined (maximum acceptable data loss)
- [ ] RTO defined (maximum acceptable downtime)
- [ ] Backup strategy: frequency, location, tested restore
- [ ] Geographic redundancy level matches availability target

**Security:**
- [ ] Authentication at every external API boundary
- [ ] Authorization: principle of least privilege enforced
- [ ] Secrets management: no credentials in code or environment variables as plaintext
- [ ] Encryption in transit (TLS) and at rest for sensitive data
- [ ] Rate limiting on all public-facing endpoints
- [ ] Input validation and output encoding

**Observability:**
- [ ] Structured logs with request IDs at every service boundary
- [ ] Metrics: request rate, error rate, latency (P50/P95/P99), saturation
- [ ] Distributed tracing: trace IDs propagated across service calls
- [ ] Dashboards and alerts defined for critical SLIs
- [ ] Runbook linked from every alert

**Deployment:**
- [ ] Deployment strategy defined (blue-green, canary, rolling)
- [ ] Database migration strategy (zero-downtime migrations)
- [ ] Rollback plan defined
- [ ] Feature flags for risky changes

---

## Architectural Patterns Reference

### Monolith

**Choose when:** early stage; team < 10 engineers; tight coupling is acceptable; deployment simplicity matters.

**Avoid when:** teams need independent deployment cadences; components have radically different scaling needs.

**Modular monolith:** structure code into isolated modules with explicit interfaces. The best default for most products — preserves simplicity while enforcing boundaries that make a future migration to services feasible.

---

### Microservices

**Choose when:** teams are large enough to own independent services (2-pizza rule per service); scaling requirements differ significantly across capabilities; independent deployment is a real need, not a hypothesis.

**Avoid when:** the product is not yet stable (constant cross-service changes are very expensive); the team does not have the operational maturity to run distributed systems.

**Operational requirements for microservices to succeed:**
- Service discovery
- Distributed tracing
- Centralized logging
- API gateway
- Circuit breakers
- Automated deployment pipeline per service

---

### Event-Driven Architecture

**Choose when:** producers and consumers need to be decoupled; multiple consumers need the same event; audit trail or event replay is needed; fan-out notifications.

**Design requirements:**
- Events are immutable facts: "OrderPlaced" not "PlaceOrder"
- Events carry enough data for consumers to act without callbacks
- Consumers are idempotent: duplicate events must be handled
- Schema evolution: event schemas must be backward-compatible

---

### CQRS (Command Query Responsibility Segregation)

**Choose when:** read and write models have fundamentally different scaling needs; complex domain logic on writes, simple projections on reads; event sourcing is in use.

**Complexity introduced:** separate read/write models; eventual consistency for reads; more code; operational complexity.

---

### Strangler Fig

**Migration pattern:** when replacing a legacy system. Route new traffic to the new system while the legacy system handles the rest. Incrementally migrate capabilities. Decommission legacy when coverage is complete.

---

## Scalability Patterns Reference

| Pattern | When to use | Trade-off |
|---|---|---|
| Horizontal scaling | Stateless services with variable load | Requires shared session storage or sticky sessions |
| Read replicas | Read-heavy workloads with tolerable replication lag | Reads may be slightly stale; write must go to primary |
| Range sharding | Sequential access patterns; range queries common | Hot shards if data isn't uniformly distributed |
| Hash sharding | Uniform key distribution; point lookups dominant | Range queries require scatter-gather across shards |
| Cache-aside | Read-heavy; cache miss is acceptable | Thundering herd on cold start; data can be stale |
| Write-through cache | Cache must always be current | Write latency doubles; wasted cache for write-only data |
| CDN | Static or near-static content; global users | Stale content if cache invalidation is not managed |
| Rate limiting (token bucket) | Public APIs; abuse prevention | Legitimate burst traffic may be throttled |
| Circuit breaker | Calls to unreliable external services | Requests fail fast during open state |
| Bulkhead | Isolate resource pools per consumer | More configuration; some resources may be underutilized |

---

## Non-Functional Requirements Reference

### Availability Targets

| SLA | Annual downtime | Use for |
|---|---|---|
| 99.9% ("three nines") | 8 hours 46 minutes | Internal tools, non-critical services |
| 99.95% | 4 hours 23 minutes | Business-critical services with some tolerance |
| 99.99% ("four nines") | 52 minutes | Customer-facing critical paths |
| 99.999% ("five nines") | 5 minutes | Payment processing, life-safety systems |

### Consistency Models

| Model | Guarantee | Best for |
|---|---|---|
| Strong consistency | All reads see the latest write | Financial balances, inventory counts, auth state |
| Read-your-writes | A user always sees their own updates | Social feeds, user profiles |
| Causal consistency | Causally related writes seen in order | Comment threads, collaborative editing |
| Eventual consistency | All nodes converge; no time guarantee | Like counts, view counters, analytics |

### Latency Budgets

Allocate your P99 latency budget across the call chain:

```
User perceived P99 target: 300ms
  └── CDN / load balancer: < 5ms
  └── API gateway: < 10ms
  └── Application logic: < 50ms
  └── Primary DB query: < 50ms
  └── Cache hit: < 2ms
  └── External API call: < 100ms
  └── Network round trips: < 20ms
Remaining buffer: 63ms
```

Any component consuming > 20% of the total budget is a candidate for optimization.

---

## Common Design Mistakes

| Mistake | Consequence | Fix |
|---|---|---|
| Microservices as the default | Operational overhead with none of the benefits until you actually need independent scaling | Start with a modular monolith |
| NoSQL "because it scales" | Painful schema migrations, no transactions, query limitations discovered too late | Identify the access pattern first; SQL handles more use cases than most people think |
| Eventual consistency everywhere | Data loss or corruption in domains requiring strong consistency | Apply consistency models per use case; don't make a blanket choice |
| Long synchronous call chains | Compounding latency; one failure cascades to the user | Timeout and circuit-break every hop; consider async for non-critical paths |
| No idempotency on mutations | Duplicate operations on retry cause data corruption or double-charges | Design idempotency keys into every mutating API from the start |
| Missing failure mode analysis | Surprises in production that degrade the entire system | For every dependency: "what happens when this is down?" |
| Designing for 100x before proving 1x | Complexity that slows you down before you have users | Design for 3–5x headroom; plan the next scale-up step, don't build it |
| No observability in the design | Systems you cannot debug in production | Include logging, metrics, and tracing in the design phase, not as an afterthought |
