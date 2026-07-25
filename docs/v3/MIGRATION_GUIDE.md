# Feature Migration Manual

This guide describes how to migrate the validated Streamlit/FastAPI prototype (v2) to the NestJS/Next.js stack (v3).

---

## 1. Migration Complexity Matrix

| Feature | Complexity | Dependencies | Risk level | Estimated Effort |
| --- | --- | --- | --- | --- |
| **Authentication & User data** | Medium | Prisma, Bcrypt | Low | 3 Days |
| **Career Suggestions** | Low | Groq SDK, Zod Schema | Low | 2 Days |
| **Timeline Roadmaps** | High | Framer Motion React | Medium | 4 Days |
| **PDF Resume Exporter** | Medium | PDF Generation lib | Low | 3 Days |
| **OCR PDF Scanner** | High | Worker Queues, OCR API | High | 5 Days |

---

## 2. Step-by-Step Data Migration

### Phase 1: Database Schema Export
Extract active user records from SQLite:
```sql
.headers on
.mode csv
.output users_export.csv
SELECT username, email, password_hash, full_name, is_verified, created_at FROM users;
```

### Phase 2: Password Re-Hashing Strategy
SQLite passwords were saved using basic SHA-256 hashes. In NestJS (V3), we use Bcrypt hashes.
* **Migration Strategy**:
  1. Import users from the CSV file into PostgreSQL.
  2. Flag users with `password_type = 'sha256'`.
  3. When a user first logs in on the V3 frontend, verify their password using the legacy SHA-256 validator. If matched, immediately re-hash using Bcrypt (`rounds = 10`) and update their profile database record flag to `bcrypt`.
  4. After 60 days, decommission SHA-256 validation support.
