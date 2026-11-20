# Cocos Trading API

REST API for a simplified stock trading platform. Users can search instruments, submit buy/sell orders, and view their portfolio.

## Tech Stack

| Layer            | Technology                          |
|------------------|-------------------------------------|
| Framework        | NestJS (TypeScript)                 |
| ORM              | TypeORM                             |
| Database         | PostgreSQL 15                       |
| Validation       | class-validator + class-transformer |
| Testing          | Vitest + Supertest                  |
| Containerization | Docker + Docker Compose             |

## Prerequisites

- **Node.js** >= 20
- **Docker** and **Docker Compose**

## Setup

1. **Start PostgreSQL**

   ```bash
   docker-compose up -d db
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the project root (or export the variables directly):

   | Variable      | Default     | Description              |
   |---------------|-------------|--------------------------|
   | `DB_HOST`     | `localhost` | PostgreSQL host          |
   | `DB_PORT`     | `5432`      | PostgreSQL port          |
   | `DB_USER`     | `cocos`     | PostgreSQL user          |
   | `DB_PASSWORD` | `cocos123`  | PostgreSQL password      |
   | `DB_NAME`     | `cocosdb`   | PostgreSQL database name |

4. **Start the API in development mode**

   ```bash
   npm run start:dev
   ```

   The API will be available at `http://localhost:3000`.

   Alternatively, run everything via Docker Compose:

   ```bash
   docker-compose up -d
   ```

## API Endpoints

All endpoints are prefixed with `/api`.

### Search Instruments

```
GET /api/instruments/search?q=<query>&limit=<n>&offset=<n>
```

Search instruments by ticker or name (case-insensitive). `limit` and `offset` are optional pagination parameters.

### Submit Order

```
POST /api/orders
```

Request body:

```json
{
  "userId": 1,
  "instrumentId": 5,
  "side": "BUY",
  "type": "MARKET",
  "quantity": 10
}
```

- `side`: `BUY`, `SELL`, `CASH_IN`, or `CASH_OUT`
- `type`: `MARKET` or `LIMIT`
- Provide either `quantity` (number of shares) or `totalAmount` (pesos to invest). They are mutually exclusive.
- `price` is required only for `LIMIT` orders.

### Cancel Order

```
PATCH /api/orders/:id/cancel
```

Only orders with status `NEW` (i.e., pending LIMIT orders) can be cancelled.

### Get Portfolio

```
GET /api/portfolio/:userId
```

Returns total account value, available cash, and all instrument positions with market value and return percentage.

## Running Tests

**Unit tests:**

```bash
npm test
```

**End-to-end tests:**

```bash
npm run test:e2e
```

**Coverage report:**

```bash
npm run test:cov
```

## Design Decisions

Key architectural and engineering decisions are documented in detail:

- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** -- Module structure, database schema, API contracts, order flow, and calculation logic.
- **[docs/TRADE-OFFS.md](docs/TRADE-OFFS.md)** -- Technical trade-offs for ORM choice, position calculation strategy, search implementation, validation layers, monetary precision, and testing approach.

A brief summary of the most important decisions:

- **Positions calculated on-the-fly** from FILLED orders rather than stored in a separate table. Simpler, always consistent, and sufficient for the expected data volume.
- **TypeORM** chosen for native NestJS integration and mature ecosystem.
- **ILIKE-based search** for simplicity given the small instrument list. Can be upgraded to pg_trgm trigram matching if fuzzy search is needed.
- **Database transactions with row-level locking** to prevent race conditions during order validation (e.g., double-spending cash).
- **PostgreSQL NUMERIC(18,2)** for all monetary values to avoid floating-point precision issues.

## Assumptions

The following assumptions were made where the specification was ambiguous:

1. **User identification**: `userId` is passed in the request body for `POST /api/orders` and as a path parameter for `GET /api/portfolio/:userId`. No authentication or authorization layer is implemented.

2. **MARKET order pricing**: MARKET orders use the latest `close` price from the `marketdata` table as the execution price.

3. **REJECTED orders persist calculated values**: When an order is rejected (insufficient cash or shares), it is still saved to the database with the calculated `price` and `size` values for auditability.

4. **No short selling**: SELL orders are rejected if the user does not hold enough shares of the instrument. Negative positions are not allowed.

5. **CASH_IN / CASH_OUT modeling**: Cash operations use `instrumentId=66` (the ARS/MONEDA instrument), `price=1`, and `size=amount`. This allows cash movements to be treated uniformly as orders within the same calculation logic.

6. **LIMIT orders stay NEW**: LIMIT orders are created with status `NEW` and remain there until explicitly cancelled by the user. There is no automatic matching engine.

7. **No fractional shares**: Only whole numbers of shares are allowed. When `totalAmount` is provided, the quantity is calculated as `floor(totalAmount / closePrice)`.
