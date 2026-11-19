# Tickets Plan

All tickets organized by epic. These will be created as GitHub Issues once the plan is approved.

Status legend: `[ ]` = To Do, `[~]` = In Progress, `[x]` = Done

---

## EPIC 0: Environment & Project Setup

> Priority: **Critical** | Must complete first before any feature work.

- [ ] **T-001**: Initialize NestJS project with TypeScript
  - Generate NestJS app with CLI (`nest new`)
  - Configure TypeScript strict mode
  - Set up path aliases if needed
  - Labels: `setup`, `priority:critical`

- [ ] **T-002**: Set up Docker Compose (PostgreSQL + App)
  - Dockerfile for the NestJS app
  - docker-compose.yml with PostgreSQL 15 and app services
  - Environment variables configuration (.env.example)
  - Health check for database readiness
  - Labels: `setup`, `priority:critical`

- [ ] **T-003**: Configure TypeORM with PostgreSQL
  - Install @nestjs/typeorm and pg driver
  - Database module with connection config
  - Support for migrations
  - Labels: `setup`, `priority:critical`

- [ ] **T-004**: Create database migrations
  - Migration for users table
  - Migration for instruments table
  - Migration for orders table
  - Migration for marketdata table
  - Indexes for performance (see ARCHITECTURE.md)
  - Labels: `setup`, `database`

- [ ] **T-005**: Create seed data
  - Seed users (at least 2 test users)
  - Seed instruments (stocks, bonds, MONEDA/ARS)
  - Seed marketdata (last 2 days of prices)
  - Seed sample orders (CASH_IN, some BUY/SELL filled)
  - Labels: `setup`, `database`

- [ ] **T-006**: Set up linting, formatting, and test config
  - ESLint + Prettier configuration
  - Jest configuration for unit and e2e tests
  - npm scripts: `lint`, `test`, `test:e2e`, `test:cov`
  - Labels: `setup`, `dx`

---

## EPIC 1: Core Entities & Data Layer

> Priority: **High** | Foundation for all features.

- [ ] **T-010**: Create User entity
  - Entity: id, email, accountNumber
  - UsersModule with service
  - Labels: `feature`, `data-layer`

- [ ] **T-011**: Create Instrument entity
  - Entity: id, ticker, name, type
  - InstrumentsModule base setup
  - Labels: `feature`, `data-layer`

- [ ] **T-012**: Create Order entity with enums
  - Entity: id, instrumentId, userId, side, size, price, type, status, datetime
  - Enums: OrderSide (BUY, SELL, CASH_IN, CASH_OUT), OrderType (MARKET, LIMIT), OrderStatus (NEW, FILLED, REJECTED, CANCELLED)
  - OrdersModule base setup
  - Labels: `feature`, `data-layer`

- [ ] **T-013**: Create MarketData entity
  - Entity: id, instrumentId, high, low, open, close, previousClose, datetime
  - MarketDataModule with service to get latest prices
  - Labels: `feature`, `data-layer`

---

## EPIC 2: Instruments Search

> Priority: **Medium** | Independent feature, no dependencies on orders.

- [ ] **T-020**: Implement search instruments endpoint
  - `GET /instruments/search?q=<query>`
  - Search by ticker AND/OR name (case-insensitive)
  - Return instrument details with latest price and daily return
  - Labels: `feature`, `api`

- [ ] **T-021**: Add pagination support to search
  - Optional `limit` and `offset` query params
  - Default: return all matches (instrument list is small)
  - Labels: `enhancement`, `api`

---

## EPIC 3: Orders

> Priority: **High** | Core business logic.

- [ ] **T-030**: Create order submission endpoint
  - `POST /orders`
  - Accept: userId, instrumentId, side, type, quantity OR totalAmount, price (for LIMIT)
  - DTO validation with class-validator
  - Labels: `feature`, `api`, `priority:high`

- [ ] **T-031**: Implement MARKET order flow
  - Fetch latest close price from marketdata
  - Set status to FILLED immediately
  - Use close price as order price
  - Labels: `feature`, `business-logic`

- [ ] **T-032**: Implement LIMIT order flow
  - Require price in request
  - Set status to NEW
  - Labels: `feature`, `business-logic`

- [ ] **T-033**: Validate BUY orders - sufficient cash
  - Calculate available cash from all FILLED orders
  - If order total (size * price) > available cash, set status REJECTED
  - Save rejected order to database
  - Labels: `feature`, `validation`

- [ ] **T-034**: Validate SELL orders - sufficient shares
  - Calculate shares held from FILLED BUY/SELL orders for the instrument
  - If order size > available shares, set status REJECTED
  - Save rejected order to database
  - Labels: `feature`, `validation`

- [ ] **T-035**: Support quantity by total amount (pesos)
  - When `totalAmount` is provided instead of `quantity`
  - Calculate: `quantity = floor(totalAmount / closePrice)`
  - No fractional shares allowed
  - Labels: `feature`, `business-logic`

- [ ] **T-036**: Implement cancel order endpoint
  - `PATCH /orders/:orderId/cancel`
  - Only orders with status NEW can be cancelled
  - Set status to CANCELLED
  - Labels: `feature`, `api`

- [ ] **T-037**: Handle concurrency on order validation
  - Wrap balance/shares check + order insert in a DB transaction
  - Use row-level locking to prevent race conditions
  - Labels: `enhancement`, `reliability`

---

## EPIC 4: Portfolio

> Priority: **High** | Key feature for the challenge.

- [ ] **T-040**: Create portfolio endpoint
  - `GET /portfolio/:userId`
  - Return: totalAccountValue, availableCash, positions[]
  - Labels: `feature`, `api`, `priority:high`

- [ ] **T-041**: Calculate available cash
  - Sum all FILLED orders impact on cash balance
  - CASH_IN adds, CASH_OUT subtracts, BUY subtracts, SELL adds
  - Labels: `feature`, `business-logic`

- [ ] **T-042**: Calculate instrument positions
  - For each instrument: net shares = SUM(BUY size) - SUM(SELL size) from FILLED orders
  - Only include instruments where net shares > 0
  - Exclude MONEDA type from positions list
  - Labels: `feature`, `business-logic`

- [ ] **T-043**: Calculate market value and return per position
  - Market value = shares * latest close price
  - Return % = ((market_value - cost_basis) / cost_basis) * 100
  - Cost basis = SUM of (size * price) for filled BUY minus SELL
  - Labels: `feature`, `business-logic`

- [ ] **T-044**: Calculate total account value
  - Total = availableCash + SUM(all positions market value)
  - Labels: `feature`, `business-logic`

---

## EPIC 5: Testing & Documentation

> Priority: **Medium** | Required by spec + nice-to-have.

- [ ] **T-050**: Functional test for order submission
  - Required by README specification
  - Test MARKET order (BUY + SELL)
  - Test LIMIT order creation
  - Test REJECTED order (insufficient funds)
  - Test cancel order
  - Use Supertest for e2e testing
  - Labels: `test`, `priority:high`

- [ ] **T-051**: Unit tests for portfolio calculation
  - Test cash calculation logic
  - Test position aggregation
  - Test return percentage calculation
  - Labels: `test`

- [ ] **T-052**: Unit tests for order validation
  - Test sufficient cash validation
  - Test sufficient shares validation
  - Test quantity from totalAmount calculation
  - Labels: `test`

- [ ] **T-053**: Create API collection (Postman or REST Client)
  - Nice-to-have from README
  - Include all endpoints with example requests
  - Include happy path and error scenarios
  - Labels: `docs`, `nice-to-have`

- [ ] **T-054**: Document design decisions
  - Update README or separate DECISIONS.md
  - Justify tech choices, schema changes, assumptions
  - Labels: `docs`

---

## EPIC 6: Open Questions (Clarification Tickets)

> Priority: **High** | Should be resolved before or during development.

- [ ] **Q-001**: Define user identification strategy (no auth)
  - Decide: userId in path params vs headers vs body
  - See TRADE-OFFS.md for options
  - Labels: `question`, `design`

- [ ] **Q-002**: Define LIMIT order lifecycle
  - Do LIMIT orders ever auto-fill? Or stay NEW until cancelled?
  - Labels: `question`, `business-logic`

- [ ] **Q-003**: Confirm return calculation method
  - Total return (cost basis vs current value) vs daily return (close vs previousClose)
  - Labels: `question`, `business-logic`

- [ ] **Q-004**: Define CASH_IN/CASH_OUT order structure
  - What instrument? (ARS/MONEDA instrument)
  - What do size and price represent for cash operations?
  - Labels: `question`, `data-model`

- [ ] **Q-005**: Confirm missing database.sql approach
  - Create our own migrations and seeds based on README spec
  - Labels: `question`, `setup`

- [ ] **Q-006**: Define error response contract
  - Standard error format for all endpoints
  - Specific error codes for business rule violations
  - Labels: `question`, `api`

---

## Ticket Summary

| Epic                        | Tickets | Priority |
|-----------------------------|---------|----------|
| EPIC 0: Environment Setup   | 6       | Critical |
| EPIC 1: Core Entities       | 4       | High     |
| EPIC 2: Instruments Search  | 2       | Medium   |
| EPIC 3: Orders              | 8       | High     |
| EPIC 4: Portfolio            | 5       | High     |
| EPIC 5: Testing & Docs      | 5       | Medium   |
| EPIC 6: Open Questions       | 6       | High     |
| **Total**                    | **36**  |          |
