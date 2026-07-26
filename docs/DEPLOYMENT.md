# Deployment Guide

## Prerequisites

- Node.js >= 18
- pnpm >= 9
- PostgreSQL 16+
- Redis (optional, for session caching)

## Environment Setup

```bash
cp .env.example .env
```

Required variables:
```
DATABASE_URL=postgresql://user:pass@localhost:5432/vidyguide?schema=public
JWT_SECRET=<min-16-characters>
GROQ_API_KEY=<groq-api-key>
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<email>
SMTP_PASS=<app-password>
```

## Build & Deploy

```bash
# Install
pnpm install

# Database
cd apps/api
npx prisma generate
npx prisma migrate deploy
cd ../..

# Build
pnpm --filter api build
pnpm --filter web build

# Production start
cd apps/api && node dist/main.js &
cd apps/web && npx next start -p 3001 &
```

## Docker

```bash
docker compose up --build
```

## CI/CD

GitHub Actions workflow at `.github/workflows/ci.yml`:
- Runs on push/PR to main
- Installs dependencies
- Runs lint
- Runs build

## Health Check

- API: `http://localhost:8000` → `200 OK`
- Web: `http://localhost:3001` → `200 OK`
