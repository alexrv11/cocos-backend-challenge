# Development Roadmap

## Overview

2-day plan with a prerequisite: all product questions must be answered before development starts. No assumptions on requirements.

```
[Clarifications]  --->  Day 1                    --->  Day 2
 Before coding          [Setup + Core API]              [Portfolio + Tests + Docs]
```

**Total effort: 2 working days (once questions are resolved)**

---

## Pre-requisite: Clarifications (Before Day 1)

> **No code is written until these are answered.** See `QUESTIONS.md` for full details.

### Critical blockers (blocks all development)
| Question | Why it blocks |
|----------|---------------|
| DQ-001: Missing database.sql | Cannot create migrations or seeds without schema confirmation |
| DQ-004: Size column semantics | Core to every calculation in the system |
| CQ-001: CASH_IN/CASH_OUT model | Needed for seed data and cash calculation |
| OQ-001: User identification | Shapes every endpoint signature |

### Blocks Day 1 afternoon (Orders + Search)
| Question | Why it blocks |
|----------|---------------|
| OQ-002: totalAmount for SELL? | Defines order validation logic |
| OQ-003: totalAmount for LIMIT? | Defines order validation logic |
| OQ-004: Order response shape | Defines API contract |
| OQ-005: No marketdata handling | Defines MARKET order edge case |
| OQ-006: Short selling allowed? | Defines SELL validation |
| OQ-007: Rejected order fields | Defines what gets persisted |
| CQ-002: CASH_IN/OUT endpoint? | Defines order endpoint scope |
| SQ-001: Search response fields | Defines search API contract |
| SQ-003: Search by type filter? | Defines search API contract |
| GQ-001: Error response format | Defines all error handling |
| DQ-003: Latest marketdata logic | Defines price lookup |

### Blocks Day 2 (Portfolio + Tests)
| Question | Why it blocks |
|----------|---------------|
| PQ-001: Return % definition | Core portfolio calculation |
| PQ-002: Cash in positions list? | Portfolio response shape |
| PQ-003: Empty portfolio behavior | Edge case handling |
| PQ-004: Pending orders in value? | Account value calculation |
| GQ-002: Concurrency requirements | Transaction design |

### Non-blocking (can decide during development)
| Question | Why it can wait |
|----------|----------------|
| SQ-002: Pagination | Can add later without breaking API |
| DQ-002: Instrument types | Can support any string, refine later |

---

## Day 1: Foundation + Core API

> Goal: App running, DB seeded, orders and search fully working.

### Morning — Setup & Data Layer (~3h)

| Ticket | Task | Est |
|--------|------|-----|
| T-001 | Init NestJS project | 20min |
| T-002 | Docker Compose (PostgreSQL + App) | 30min |
| T-003 | Configure TypeORM + database module | 20min |
| T-006 | ESLint, Prettier, Jest config | 15min |
| T-004 | Database migrations (all tables + indexes) | 30min |
| T-010..T-013 | All entities (User, Instrument, Order, MarketData) | 45min |
| T-005 | Seed data (users, instruments, marketdata, sample orders) | 30min |

**Checkpoint**: `docker compose up` -> app connects to DB, seeds loaded.

### Afternoon — Search + Orders (~3.5h)

| Ticket | Task | Est |
|--------|------|-----|
| T-020 | Search instruments endpoint | 30min |
| T-030 | Order submission endpoint + DTO validation | 30min |
| T-031 | MARKET order flow (fetch price, set FILLED) | 30min |
| T-032 | LIMIT order flow (require price, set NEW) | 15min |
| T-033 | Validate BUY: sufficient cash check | 30min |
| T-034 | Validate SELL: sufficient shares check | 20min |
| T-035 | Quantity from totalAmount | 15min |
| T-036 | Cancel order endpoint (only NEW) | 15min |
| T-037 | DB transaction wrapping for concurrency | 20min |

**Checkpoint**: All order flows work — MARKET/LIMIT, BUY/SELL, REJECTED, CANCEL.

### Day 1 Deliverables
- NestJS app running in Docker with PostgreSQL
- Database with all tables, indexes, seed data
- `GET /instruments/search?q=...` working
- `POST /orders` with full validation
- `PATCH /orders/:id/cancel` working

---

## Day 2: Portfolio + Tests + Polish

> Goal: Portfolio complete, tests passing, docs ready for review.

### Morning — Portfolio (~2.5h)

| Ticket | Task | Est |
|--------|------|-----|
| T-040 | Portfolio endpoint (`GET /portfolio/:userId`) | 20min |
| T-041 | Calculate available cash from FILLED orders | 30min |
| T-042 | Calculate instrument positions (net shares) | 30min |
| T-043 | Market value + return % per position | 30min |
| T-044 | Total account value (cash + positions) | 15min |
| T-021 | Search pagination (optional limit/offset) | 15min |

**Checkpoint**: Portfolio returns correct values for seeded data.

### Afternoon — Tests + Documentation (~3h)

| Ticket | Task | Est |
|--------|------|-----|
| T-050 | Functional tests: order submission (e2e) | 60min |
| T-051 | Unit tests: portfolio calculation | 30min |
| T-052 | Unit tests: order validation | 30min |
| T-053 | REST Client / Postman collection | 30min |
| T-054 | Document design decisions | 20min |

**Checkpoint**: All tests pass, API collection ready.

### Day 2 Deliverables
- `GET /portfolio/:userId` fully working
- Functional test for order submission (required by spec)
- Unit tests for core business logic
- API collection (nice-to-have)
- Design decisions documented

---

## Development Priorities

If running behind, cut from bottom up:

| Priority | Items | Cut? |
|----------|-------|------|
| **Must ship** | Setup, Orders, Search, Portfolio, Order functional test | Never |
| **Should ship** | Cancel order, concurrency, qty from amount, unit tests | Cut last |
| **Nice to have** | Postman collection, search pagination, extra tests | Cut first |

---

## Dependency Graph

```
[QUESTIONS answered]
        |
T-001 (NestJS) + T-002 (Docker) + T-003 (TypeORM) + T-006 (Lint)
        |
  T-004 (Migrations)
        |
  T-010..013 (Entities)
        |
  T-005 (Seeds)
        |
  +-----+-----+
  |           |
T-020       T-030..037
(Search)    (Orders)
  |           |
  +-----+-----+
        |
  T-040..044
  (Portfolio)
        |
  T-050..054
  (Tests & Docs)
```

---

## Schedule Summary

| Block | Time | Tickets | Focus |
|-------|------|---------|-------|
| Pre-req | Before Day 1 | 22 questions | Clarifications with product |
| Day 1 AM | ~3h | T-001..T-006, T-010..T-013 | Setup + entities + seeds |
| Day 1 PM | ~3.5h | T-020, T-030..T-037 | Search + all order flows |
| Day 2 AM | ~2.5h | T-040..T-044, T-021 | Portfolio + pagination |
| Day 2 PM | ~3h | T-050..T-054 | Tests + docs + polish |
| **Total** | **~12h** | **36 tickets** | |
