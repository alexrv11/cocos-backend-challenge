# Architecture Design

## Tech Stack

| Layer          | Technology                        | Rationale                                      |
|----------------|-----------------------------------|-------------------------------------------------|
| Framework      | NestJS (TypeScript)               | Modular, opinionated, great for REST APIs       |
| Database       | PostgreSQL                        | Robust, ACID-compliant, strong numeric support  |
| ORM            | TypeORM                           | Native NestJS integration, decorator-based      |
| Validation     | class-validator + class-transformer | Standard for NestJS request validation         |
| Testing        | Jest + Supertest                  | Built-in with NestJS, functional test support   |
| Containerization | Docker + Docker Compose         | Reproducible dev environment                    |

## Module Structure

```
src/
  app.module.ts
  main.ts
  common/
    filters/              # Global exception filters
    interceptors/         # Response transformation
    dto/                  # Shared DTOs
  users/
    users.module.ts
    users.entity.ts
    users.service.ts
  instruments/
    instruments.module.ts
    instruments.controller.ts
    instruments.service.ts
    instruments.entity.ts
    dto/
      search-instruments.dto.ts
  orders/
    orders.module.ts
    orders.controller.ts
    orders.service.ts
    orders.entity.ts
    dto/
      create-order.dto.ts
    enums/
      order-side.enum.ts
      order-type.enum.ts
      order-status.enum.ts
  portfolio/
    portfolio.module.ts
    portfolio.controller.ts
    portfolio.service.ts
    dto/
      portfolio-response.dto.ts
  marketdata/
    marketdata.entity.ts
    marketdata.service.ts
    marketdata.module.ts
  database/
    migrations/
    seeds/
    database.module.ts
```

## Database Schema

Based on the README specification, using PostgreSQL with TypeORM:

```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  account_number VARCHAR(50) UNIQUE NOT NULL
);

-- Instruments table
CREATE TABLE instruments (
  id SERIAL PRIMARY KEY,
  ticker VARCHAR(10) NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL  -- ACCION, BONO, MONEDA, CEDEAR, etc.
);

CREATE INDEX idx_instruments_ticker ON instruments(ticker);
CREATE INDEX idx_instruments_name ON instruments USING gin(name gin_trgm_ops);

-- Orders table
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  instrument_id INTEGER NOT NULL REFERENCES instruments(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  side VARCHAR(10) NOT NULL,       -- BUY, SELL, CASH_IN, CASH_OUT
  size INTEGER NOT NULL,            -- Number of shares
  price NUMERIC(18,2) NOT NULL,
  type VARCHAR(10) NOT NULL,        -- MARKET, LIMIT
  status VARCHAR(10) NOT NULL,      -- NEW, FILLED, REJECTED, CANCELLED
  datetime TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
CREATE INDEX idx_orders_instrument ON orders(instrument_id);

-- Market Data table
CREATE TABLE marketdata (
  id SERIAL PRIMARY KEY,
  instrument_id INTEGER NOT NULL REFERENCES instruments(id),
  high NUMERIC(18,2),
  low NUMERIC(18,2),
  open NUMERIC(18,2),
  close NUMERIC(18,2) NOT NULL,
  previous_close NUMERIC(18,2),
  datetime TIMESTAMP NOT NULL
);

CREATE INDEX idx_marketdata_instrument ON marketdata(instrument_id);
```

## API Endpoints

### Portfolio
```
GET /portfolio/:userId
```
Response:
```json
{
  "totalAccountValue": 1500000.00,
  "availableCash": 500000.00,
  "positions": [
    {
      "instrumentId": 1,
      "ticker": "AAPL",
      "name": "Apple Inc.",
      "quantity": 10,
      "lastPrice": 100000.00,
      "totalValue": 1000000.00,
      "returnPercentage": 5.26
    }
  ]
}
```

### Search Instruments
```
GET /instruments/search?q=APP
```
Response:
```json
[
  {
    "id": 1,
    "ticker": "AAPL",
    "name": "Apple Inc.",
    "type": "ACCION",
    "lastPrice": 100000.00,
    "returnPercentage": 2.5
  }
]
```

### Send Order
```
POST /orders
```
Request body:
```json
{
  "userId": 1,
  "instrumentId": 5,
  "side": "BUY",
  "type": "MARKET",
  "quantity": 10,
  "totalAmount": null,
  "price": null
}
```
- `quantity` OR `totalAmount` must be provided (mutually exclusive)
- `price` required only for LIMIT orders
- For `totalAmount`: calculate max whole shares = floor(totalAmount / closePrice)

### Cancel Order
```
PATCH /orders/:orderId/cancel
```
- Only orders with status `NEW` can be cancelled

## Order Flow

```
                   +---> MARKET ---> validate ---> FILLED
                   |                    |
User sends order --+                    +--------> REJECTED
                   |
                   +---> LIMIT  ---> validate ---> NEW ---> CANCELLED (by user)
                                        |
                                        +--------> REJECTED
```

### Validation Rules
1. **BUY order**: User must have enough available cash (ARS)
   - Available cash = SUM(CASH_IN filled) - SUM(CASH_OUT filled) - SUM(BUY filled * price) + SUM(SELL filled * price)
2. **SELL order**: User must have enough shares of the instrument
   - Available shares = SUM(BUY filled size) - SUM(SELL filled size) for that instrument
3. **MARKET order**: Uses `close` price from latest marketdata
4. **LIMIT order**: Uses user-provided price
5. **No fractional shares**: Only whole numbers allowed

## Cash Calculation Logic

```
Available Cash = SUM of all FILLED orders impact:
  + CASH_IN.size * CASH_IN.price   (money in)
  - CASH_OUT.size * CASH_OUT.price  (money out)
  - BUY.size * BUY.price            (spent on purchases)
  + SELL.size * SELL.price           (received from sales)
```

Note: ARS (peso) is modeled as an instrument of type 'MONEDA'.

## Position Calculation Logic

For each instrument (excluding MONEDA):
```
Shares held = SUM(FILLED BUY orders size) - SUM(FILLED SELL orders size)
Market value = shares_held * latest close price
Cost basis = SUM(BUY size * price) - SUM(SELL size * price) [for filled orders]
Return % = ((market_value - cost_basis) / cost_basis) * 100
```

## Key Design Decisions

1. **No auth**: User identification via `userId` parameter in requests
2. **Positions calculated on-the-fly**: No separate positions table; computed from FILLED orders each time (see TRADE-OFFS.md)
3. **Transactions**: Order creation wrapped in database transactions to prevent race conditions
4. **Money precision**: PostgreSQL NUMERIC(18,2) for all monetary values
5. **Search**: ILIKE-based search with pg_trgm extension for fuzzy matching on ticker and name
