# Database Schema & Structure

VidyGuideAI stores user state and tracking history inside a local SQLite database (`vidyguide.db`).

---

## 1. Schema Definitions

### 👤 Users Table
Holds user credentials, registration states, and email verification parameters.

```
┌────────────────────────────────────────────────────────┐
│                        users                           │
├─────────────────┬──────────────┬───────────────────────┤
│ Column          │ Type         │ Constraint            │
├─────────────────┼──────────────┼───────────────────────┤
│ id              │ INTEGER      │ PRIMARY KEY AUTOINC   │
│ username        │ TEXT         │ UNIQUE NOT NULL       │
│ email           │ TEXT         │ UNIQUE NOT NULL       │
│ password_hash   │ TEXT         │ NOT NULL              │
│ full_name       │ TEXT         │ DEFAULT ''            │
│ is_verified     │ INTEGER      │ DEFAULT 0 (boolean)   │
│ otp_code        │ TEXT         │ DEFAULT NULL          │
│ otp_expires_at  │ REAL         │ DEFAULT NULL          │
│ otp_purpose     │ TEXT         │ DEFAULT NULL          │
│ created_at      │ REAL         │ UNIX TIMESTAMP        │
│ last_login      │ REAL         │ DEFAULT NULL          │
└─────────────────┴──────────────┴───────────────────────┘
```

### 📋 History Table
Stores user activity history logs (career search details, resume outputs, and AI advice text).

```
┌────────────────────────────────────────────────────────┐
│                       history                          │
├─────────────────┬──────────────┬───────────────────────┤
│ Column          │ Type         │ Constraint            │
├─────────────────┼──────────────┼───────────────────────┤
│ id              │ INTEGER      │ PRIMARY KEY AUTOINC   │
│ user_id         │ INTEGER      │ FOREIGN KEY references │
│                 │              │ users(id) ON DELETE   │
│                 │              │ CASCADE               │
│ action_type     │ TEXT         │ NOT NULL              │
│ title           │ TEXT         │ NOT NULL              │
│ payload         │ TEXT         │ DEFAULT ''            │
│ result          │ TEXT         │ DEFAULT ''            │
│ created_at      │ REAL         │ UNIX TIMESTAMP        │
└─────────────────┴──────────────┴───────────────────────┘
```

---

## 2. PostgreSQL Migration Strategy
To scale the platform to 10,000+ active users:
1. **Concurrency**: Migrate to managed PostgreSQL to support concurrent multi-threaded writes without table locking.
2. **Schema Definition**: Transition to SQLAlchemy models matching this structure, and run automated migrations using Alembic.
3. **pgvector**: Use `pgvector` columns inside the database for career search similarity matching, replacing local FAISS files.
