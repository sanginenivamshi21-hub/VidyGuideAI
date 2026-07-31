# Deployment Guide

## Prerequisites

- Node.js >= 18
- pnpm >= 9
- PostgreSQL 16+
- Groq API key ([get one free](https://console.groq.com/))
- SMTP credentials for email delivery

## Environment Setup

```bash
cp .env.example .env
```

### Required Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | JWT signing secret (min 16 characters) |
| `GROQ_API_KEY` | Groq AI API key |
| `SMTP_HOST` | SMTP server host (e.g. `smtp.gmail.com`) |
| `SMTP_USER` | SMTP email address |
| `SMTP_PASS` | SMTP app password |

### Optional Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8000` | API server port |
| `API_PROXY_TARGET` | `https://vidyguideai-api.onrender.com` | Backend origin proxied by the Next.js `/api/*` rewrite (web service) |
| `APP_BASE_URL` | `http://localhost:3000` | Base URL for email links |
| `CLOUDINARY_URL` | - | Cloudinary for file uploads |
| `REDIS_URL` | - | Redis connection string |

## Local Development

```bash
# Install dependencies
pnpm install

# Database setup
cd apps/api
npx prisma generate
npx prisma migrate deploy
cd ../..

# Start development servers
pnpm dev
# API: http://localhost:8000
# Web: http://localhost:3000
```

## Production Build

```bash
# Install
pnpm install

# Database migrations
cd apps/api
npx prisma generate
npx prisma migrate deploy
cd ../..

# Build
pnpm build

# Start production servers
cd apps/api && node dist/main.js &
cd apps/web && npx next start -p 3000 &
```

## Docker Deployment

```bash
# Build and run all services
docker compose up --build

# Individual services
docker compose up -d postgres redis
docker compose up api
docker compose up web
```

> **Note:** Set required environment variables before running Docker.

## CI/CD Pipeline

GitHub Actions workflow at `.github/workflows/ci.yml`:
- Triggered on push/PR to `main`
- Installs dependencies
- Runs lint
- Runs build

## Health Check

- **API:** `http://localhost:8000` → `{"status":"UP"}`
- **Web:** `http://localhost:3000` → HTTP 200

## Architecture Overview

```
Web (Next.js :3000) ←→ API (NestJS :8000) ←→ PostgreSQL
                               ↕
                          Groq AI (LLaMA 3)
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed architecture documentation.
