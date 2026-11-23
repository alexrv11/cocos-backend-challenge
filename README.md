# Cocos Capital - Trading Platform

Full-stack trading platform built as a coding challenge for Cocos Capital. Allows users to register, browse Argentine market instruments, manage a portfolio, and place buy/sell orders.

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
- **kind** (for local Kubernetes)
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

## Kubernetes Deployment (kind)

### 1. Create the cluster

```bash
kind create cluster --name finance-local --config infra/kind-config.yaml
```

### 2. Build and load images

```bash
# API
cd api && docker build -t cocos-api:latest . && cd ..
kind load docker-image cocos-api:latest --name finance-local

# Web
cd web && docker build -t cocos-web:latest . && cd ..
kind load docker-image cocos-web:latest --name finance-local
```

### 3. Deploy with Terraform

```bash
cd infra/terraform
terraform init
terraform apply
```

This deploys:
- **cocos** namespace with API, Web, and PostgreSQL
- **monitoring** namespace with Prometheus + Grafana (kube-prometheus-stack)

### 4. Access services

Ports depend on your kind cluster `extraPortMappings`. Default NodePorts:

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
| Web + API  | https://cocos.arcadc.com                   |
| Swagger    | https://cocos.arcadc.com/api/docs          |
| Grafana    | https://grafana-cocos.arcadc.com/login     |
| Prometheus | https://prometheus-cocos.arcadc.com        |

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

## Tech Stack

**API:** NestJS, TypeORM, PostgreSQL, Passport JWT, Swagger, Prometheus metrics

**Web:** React 19, TypeScript 7, Tailwind CSS v4, TanStack Query, Zustand, React Hook Form + Zod, lightweight-charts (TradingView), MSW

**Infra:** Docker, Helm, Terraform, kind, Cloudflare Tunnel, Prometheus, Grafana
