---
description: System Design — structured architecture process with requirements, scale estimation, component selection, and trade-off documentation
globs: ["docs/**/*", "architecture/**/*", "*.md"]
alwaysApply: false
---

# System Design

## Eight-Phase Process (in order, no skipping)

1. **Requirements** — functional requirements, non-functional requirements (availability, latency, throughput, consistency), scope in/out
2. **Scale estimation** — QPS, storage volume, bandwidth before touching component selection
3. **System boundaries** — external APIs and system ownership before internal design
4. **Data model** — list access patterns first, then choose storage engine
5. **High-level architecture** — components and communication style only
6. **Component deep dives** — the 2–3 highest-risk or highest-scale components
7. **Trade-off documentation** — ADR for every significant architectural decision
8. **Production readiness** — HA, failure modes, security, observability, deployment

## Hard Rules

- No technology selection before requirements are clear and scale is estimated
- Every critical path must have failure mode analysis
- Every mutating operation that can be retried must be idempotent
- For every data store: state CAP properties and partition behavior explicitly
- Observability (logs, metrics, traces) must be in the design — not added later

## Storage Engine Selection

Match to access pattern and consistency requirement:

| Access pattern / need | Engine type |
|---|---|
| Transactions, relational queries, strong consistency | Relational (PostgreSQL) |
| Flexible schema, hierarchical data | Document (MongoDB) |
| High write throughput, time-series, known partition key | Wide-column (Cassandra, DynamoDB) |
| Caching, sessions, rate limiting | Key-value (Redis) |
| Relationship traversal | Graph (Neo4j) |
| Full-text search | Search (Elasticsearch) |

## ADR Format

Every significant decision: Context → Options (pros/cons each) → Chosen → Rationale → Consequences.

## Anti-Patterns to Reject

- Microservices without a verified scaling bottleneck
- NoSQL without an identified access pattern SQL cannot serve
- Eventual consistency on financial balances or inventory
- Synchronous call chains of 3+ hops without circuit breakers
- No rate limiting on public endpoints
