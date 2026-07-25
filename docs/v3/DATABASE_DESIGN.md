# Database Design

This document details the PostgreSQL schema configured via Prisma ORM for VidyGuideAI V3.

---

## 1. Prisma Schema Definition (`schema.prisma`)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id           Int       @id @default(autoincrement())
  username     String    @unique
  email        String    @unique
  passwordHash String
  fullName     String    @default("")
  isVerified   Boolean   @default(false)
  otpCode      String?
  otpExpiresAt DateTime?
  otpPurpose   String?
  createdAt    DateTime  @default(now())
  lastLogin    DateTime?
  history      History[]

  @@index([email])
}

model History {
  id         Int      @id @default(autoincrement())
  userId     Int
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  actionType String
  title      String
  payload    Json     // Using PostgreSQL JSONB for flexible payload structures
  result     String
  createdAt  DateTime @default(now())

  @@index([userId])
}
```

---

## 2. Optimization Strategy
* **Index Strategy**: Create database indices on `User.email` and `History.userId` for fast authentication lookup and log loads.
* **JSONB Storage**: Storing the user inputs (skills, target role, education levels) inside a `payload` JSONB column avoids rigid, non-scalable column declarations.
* **Foreign Key cascade**: Deleting a user cascade-deletes their history logs cleanly.
