# Cocos Capital - Trading Platform

Full-stack trading platform built as a coding challenge for Cocos Capital. Allows users to register, browse market instruments, manage a portfolio, and place buy/sell orders.

## Architecture

```
web/          React 19 + TypeScript + Tailwind CSS v4 (Vite)
api/          NestJS + TypeORM + PostgreSQL
infra/
  helm/       Helm charts (cocos-api, cocos-web)
  terraform/  Terraform config for Kubernetes deployment
```

## Prerequisites

- **Node.js** >= 22
- **Docker** & **Docker Compose**
- **kind** (for local Kubernetes) or **Docker Desktop** with Kubernetes enabled
- **Terraform** >= 1.0
- **Helm** >= 3
- **kubectl**

## Quick Start with Docker Compose

```bash
# Start the full stack (PostgreSQL + API + Web)
cd api
docker compose up -d --build

# Services:
#   Web UI:     http://localhost:5173
#   API:        http://localhost:3000
#   Swagger:    http://localhost:3000/api/docs
#   Grafana:    http://localhost:3002
#   Prometheus: http://localhost:9091
```

### Seed Users

| Email              | Password      |
|--------------------|---------------|
| user1@cocos.com    | password123   |
| user2@cocos.com    | password123   |

## Kubernetes Deployment

You can use either **kind** or **Docker Desktop** (with Kubernetes enabled) as your local cluster.

### Option A: kind

#### 1. Create the cluster

```bash
kind create cluster --name finance-local --config infra/kind-config.yaml
```

#### 2. Build and load images

```bash
# API
cd api && docker build -t cocos-api:latest . && cd ..
kind load docker-image cocos-api:latest --name finance-local

# Web
cd web && docker build -t cocos-web:latest . && cd ..
kind load docker-image cocos-web:latest --name finance-local
```

### Option B: Docker Desktop

Enable Kubernetes in Docker Desktop settings (Settings → Kubernetes → Enable Kubernetes). Images built locally are already available to the cluster — no need to load them.

```bash
# Build images
cd api && docker build -t cocos-api:latest . && cd ..
cd web && docker build -t cocos-web:latest . && cd ..
```

### Deploy with Terraform

```bash
cd infra/terraform
terraform init
terraform apply
```

This deploys:
- **cocos** namespace with API, Web, and PostgreSQL
- **monitoring** namespace with Prometheus + Grafana (kube-prometheus-stack)

### Access services

With **kind**, ports depend on your `extraPortMappings` in `infra/kind-config.yaml`. With **Docker Desktop**, NodePorts are accessible directly on `localhost`. Default NodePorts:

| Service    | NodePort | Description              |
|------------|----------|--------------------------|
| API        | 30000    | NestJS REST API          |
| Web        | 30080    | React SPA (nginx)        |
| Grafana    | 30300    | Monitoring dashboards    |

## API Documentation (Swagger)

The API exposes a Swagger UI with all endpoints documented:

- **Local (Docker Compose):** http://localhost:3000/api/docs
- **Local (Kubernetes):** accessible via the API NodePort
- **Production:** https://cocos.arcadc.com/api/docs

## Live Environment (Cloudflare Tunnel)

The local Kubernetes cluster is exposed via Cloudflare Tunnel:

| Service    | URL                                        |
|------------|--------------------------------------------|
| API        | https://cocos.arcadc.com/api               |
| Swagger    | https://cocos.arcadc.com/api/docs          |
| Grafana    | https://grafana-cocos.arcadc.com/login     |
| Prometheus | https://prometheus-cocos.arcadc.com        |
| Web        | https://web-cocos.arcadc.com               |

### Grafana Credentials

| Field    | Value           |
|----------|-----------------|
| User     | admin           |
| Password | cocos-grafana   |

## Development

### API

```bash
cd api
npm install
npm run start:dev        # Start with hot reload
npm run test             # Run tests
npm run lint             # Lint
```

### Web

```bash
cd web
npm install
npm run dev              # Vite dev server on :5173
npm run test             # Vitest unit tests (50 tests)
npm run test:e2e         # Playwright E2E tests (12 tests)
npm run build            # Production build
```

By default, the dev server uses MSW mocks. To connect to the real API (Kubernetes), create `web/.env`:

```env
VITE_MOCK_API=false
VITE_API_PROXY_TARGET=http://localhost:8080
```

## Order System

The platform operates in **spot mode only** — no margin or leverage. Users trade with their available cash and can only sell instruments they hold.

### Creating an Order

`POST /api/orders` (requires JWT)

| Field            | Type     | Required | Notes                                      |
|------------------|----------|----------|--------------------------------------------|
| `instrumentId`   | number   | Yes      | Instrument to trade                        |
| `side`           | string   | Yes      | `BUY` or `SELL`                            |
| `type`           | string   | Yes      | `MARKET` or `LIMIT`                        |
| `quantity`        | number   | *        | Number of shares (positive integer)        |
| `totalAmount`     | number   | *        | Total ARS to invest (positive number)      |
| `price`          | number   | **       | Required for LIMIT orders only             |
| `idempotencyKey` | string   | No       | Prevents duplicate order processing        |

> \* `quantity` and `totalAmount` are mutually exclusive — provide exactly one.

### Business Rules

- **BUY**: requires sufficient cash balance. Rejected if the user cannot afford the order.
- **SELL**: requires sufficient shares in portfolio. The user can only sell instruments they currently hold (spot).
- **MARKET orders** execute at the latest closing price from market data.
- **LIMIT orders** are created with status `NEW` and wait for the market to match.
- Cash balance is calculated from all `FILLED` orders: `CASH_IN - CASH_OUT - BUY + SELL`.
- Positions are calculated from `FILLED` orders: `BUY shares - SELL shares` per instrument.
- Concurrent orders per user are serialized via PostgreSQL advisory locks to prevent race conditions.

### Order Statuses

| Status      | Meaning                                                |
|-------------|--------------------------------------------------------|
| `FILLED`    | Executed successfully                                  |
| `NEW`       | Limit order waiting for market match                   |
| `REJECTED`  | Insufficient funds (buy) or insufficient shares (sell) |
| `CANCELLED` | Cancelled by user (only `NEW` orders can be cancelled) |

## Tech Stack

**API:** NestJS, TypeORM, PostgreSQL, Passport JWT, Swagger, Prometheus metrics

**Web:** React 19, TypeScript 7, Tailwind CSS v4, TanStack Query, Zustand, React Hook Form + Zod, lightweight-charts (TradingView), MSW

**Infra:** Docker, Helm, Terraform, kind, Cloudflare Tunnel, Prometheus, Grafana
