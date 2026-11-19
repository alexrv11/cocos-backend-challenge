# Clarification Questions

Questions for the product owner / stakeholders before development begins.
No assumptions will be made — each question blocks one or more tickets.

---

## Portfolio Endpoint

### PQ-001: What does "rendimiento total (%)" mean exactly?
The README says the portfolio should include "el rendimiento total (%)". Later it says "Para calcular el retorno diario utilizar las columnas close y previousClose."

- **(A)** Total return since position opened: `((currentValue - costBasis) / costBasis) * 100`
- **(B)** Daily return: `((close - previousClose) / previousClose) * 100`
- **(C)** Both? One per position and one per instrument?

The term "rendimiento total" suggests (A), but "retorno diario" suggests (B). Which one should the portfolio show per position?

**Blocks**: T-043 (position return calculation)

### PQ-002: Should cash (ARS) appear as a position in the portfolio?
The portfolio returns `availableCash` and a `positions` list. Cash is modeled as instrument type MONEDA.

- Should MONEDA appear in the positions list as well?
- Or only as the top-level `availableCash` field?

**Blocks**: T-042 (positions list composition)

### PQ-003: What should the portfolio return for a user with no orders?
- Empty positions list with `totalAccountValue: 0` and `availableCash: 0`?
- Or a 404 / specific error?

**Blocks**: T-040 (portfolio endpoint)

### PQ-004: Does "valor total de la cuenta" include pending LIMIT orders?
A user has $100,000 ARS and a pending BUY LIMIT order for $30,000.

- Is `totalAccountValue` = $100,000 (ignoring NEW orders)?
- Or $70,000 (reserving funds for pending orders)?
- Similarly, does `availableCash` deduct pending BUY orders?

**Blocks**: T-041, T-044 (cash and total value calculation)

---

## Orders Endpoint

### OQ-001: How is the user identified when sending an order?
No authentication is required. How do we know which user is placing the order?

- userId in the request body?
- userId as a path parameter?
- A custom header like `X-User-Id`?

**Blocks**: T-030 (order endpoint design), T-040 (portfolio endpoint)

### OQ-002: Does "monto total de inversion en pesos" apply to SELL orders too?
The README says users can send either `quantity` (exact shares) or a total investment amount in pesos, and we calculate max whole shares.

- For BUY: `shares = floor(totalAmount / closePrice)` — clear.
- For SELL: Does the same apply? E.g., "sell $50,000 worth of AAPL" -> `shares = floor(50000 / closePrice)`?
- Or is `totalAmount` only valid for BUY orders?

**Blocks**: T-035 (quantity from totalAmount)

### OQ-003: Can LIMIT orders use `totalAmount` instead of `quantity`?
For LIMIT orders, the user provides a price. If they also send `totalAmount`:

- Calculate `shares = floor(totalAmount / userPrice)` using the LIMIT price?
- Or is `totalAmount` only applicable to MARKET orders?

**Blocks**: T-035 (quantity from totalAmount)

### OQ-004: What should the order response return?
When a user submits an order:

- Return the full created order object (id, status, price, size, etc.)?
- Just a confirmation with the order id and status?
- Different response shape for FILLED vs REJECTED vs NEW?

**Blocks**: T-030 (order endpoint response contract)

### OQ-005: What happens when there is no marketdata for an instrument?
If a user tries to place a MARKET order on an instrument with no marketdata entries:

- Reject the order?
- Return a specific error?
- Is this a scenario we need to handle?

**Blocks**: T-031 (MARKET order flow)

### OQ-006: Can a user place a MARKET SELL order if they own 0 shares?
Or more generally — is short selling allowed?

- If not, the order should be REJECTED with "insufficient shares."
- Confirming: a SELL is only valid if the user has enough FILLED BUY orders to cover it?

**Blocks**: T-034 (SELL validation)

### OQ-007: Should REJECTED orders store the calculated price and size?
When an order is rejected (insufficient funds), should we still save:

- The price that would have been used (close price for MARKET)?
- The size that was requested?
- Or leave those fields null/zero?

**Blocks**: T-033, T-034 (order rejection handling)

---

## CASH_IN / CASH_OUT

### CQ-001: How are CASH_IN and CASH_OUT modeled in the orders table?
The README says transfers can be modeled as orders with side CASH_IN or CASH_OUT.

- What `instrumentId` do they use? The ARS/MONEDA instrument?
- What does `size` represent? The amount in ARS? Number of "units"?
- What is `price` for cash operations? Always 1?
- What `type` are they? MARKET? Or a different type?
- What `status` are they? Always FILLED?

**Blocks**: T-005 (seed data), T-041 (cash calculation)

### CQ-002: Do we need to build a CASH_IN / CASH_OUT endpoint?
Or are these only pre-existing records in the database used for balance calculation?

- If we need an endpoint: what validation applies? (e.g., can a user CASH_OUT more than their balance?)
- If not: they're just seeded data and existing records.

**Blocks**: T-030 (order endpoint scope)

---

## Search Endpoint

### SQ-001: What fields should the search response include?
The README says "listado de activos similares a la busqueda." Should each result include:

- Just instrument data (id, ticker, name, type)?
- Also latest price (close) and daily return?
- Also volume or other marketdata fields?

**Blocks**: T-020 (search response contract)

### SQ-002: Should search results be paginated?
The instrument list may be small, but:

- Do we need `limit` and `offset` parameters?
- Or return all matches?
- Is there a maximum number of results expected?

**Blocks**: T-021 (pagination)

### SQ-003: Should search filter by instrument type?
Can the user filter results to only show ACCION, BONO, CEDEAR, etc.?

- Or does the search always return all types that match the query?
- Should MONEDA (ARS) instruments appear in search results?

**Blocks**: T-020 (search endpoint)

---

## Database & Data

### DQ-001: The database.sql file is missing from the repo
The README references `database.sql` with schema and seed data, but it's not in the repository.

- Should we wait for this file to be provided?
- Or create our own schema and seed data based on the README specification?
- If we create our own: what specific instruments, users, and sample orders should be included?

**Blocks**: T-004 (migrations), T-005 (seeds) — blocks all development

### DQ-002: What instrument types exist in the system?
The README mentions MONEDA for cash. What other types are expected?

- ACCION (stocks)?
- BONO (bonds)?
- CEDEAR?
- Others?
- Does the system need to behave differently based on instrument type (beyond excluding MONEDA from portfolio positions)?

**Blocks**: T-005 (seed data), T-011 (instrument entity)

### DQ-003: How do we determine the "latest" marketdata for an instrument?
The README says marketdata has the last 2 days. The `close` is the last price.

- Is "latest" determined by the most recent `datetime`?
- Can there be multiple marketdata rows per instrument per day?
- Or exactly one row per instrument per day?

**Blocks**: T-013 (marketdata queries), T-031 (MARKET order price)

### DQ-004: What does `size` represent in the orders table?
The README says "utilizar la columna size" for calculations.

- For BUY/SELL: `size` = number of shares?
- For CASH_IN/CASH_OUT: `size` = amount in ARS?
- Is `size` always an integer? Or can it be decimal?
- For the total monetary impact of a BUY: is it `size * price`? Or just `size`?

**Blocks**: T-041 (cash calculation), T-042 (position calculation)

---

## General / API Design

### GQ-001: What error format should the API return?
When validation fails or a business rule is violated:

- Standard HTTP status codes (400, 404, 422)?
- Specific error codes or messages?
- Should rejected orders return 200 (order was saved) or 400 (validation failed)?

**Blocks**: T-030 (order endpoint), all endpoints

### GQ-002: Should the API support multiple concurrent users safely?
If two requests arrive simultaneously for the same user:

- Do we need transaction-level isolation to prevent double-spending?
- Or is single-threaded processing acceptable for this challenge?

**Blocks**: T-037 (concurrency handling)

---

## Questions Summary

| ID | Topic | Blocks |
|----|-------|--------|
| PQ-001 | Return % definition | T-043 |
| PQ-002 | Cash in positions list | T-042 |
| PQ-003 | Empty portfolio behavior | T-040 |
| PQ-004 | Pending orders in account value | T-041, T-044 |
| OQ-001 | User identification method | T-030, T-040 |
| OQ-002 | totalAmount for SELL orders | T-035 |
| OQ-003 | totalAmount for LIMIT orders | T-035 |
| OQ-004 | Order response shape | T-030 |
| OQ-005 | Missing marketdata handling | T-031 |
| OQ-006 | Short selling allowed? | T-034 |
| OQ-007 | Rejected order stored values | T-033, T-034 |
| CQ-001 | CASH_IN/OUT data model | T-005, T-041 |
| CQ-002 | CASH_IN/OUT endpoint needed? | T-030 |
| SQ-001 | Search response fields | T-020 |
| SQ-002 | Search pagination needed? | T-021 |
| SQ-003 | Search filter by type? | T-020 |
| DQ-001 | Missing database.sql | T-004, T-005 |
| DQ-002 | Instrument types list | T-005, T-011 |
| DQ-003 | Latest marketdata logic | T-013, T-031 |
| DQ-004 | Size column semantics | T-041, T-042 |
| GQ-001 | Error response format | All endpoints |
| GQ-002 | Concurrency requirements | T-037 |
