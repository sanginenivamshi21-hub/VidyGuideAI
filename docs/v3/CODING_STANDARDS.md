# Coding Standards & Guidelines

Formatting, linting, naming rules, and patterns for VidyGuideAI V3.

---

## 1. Programming Language Standards
We write **TypeScript** across both client and server nodes.
* Strict null checking enabled (`"strict": true` in `tsconfig.json`).
* Avoid using `any`. Explicitly declare type signatures or use generic constraints.
* Files must be formatted using Prettier and linted with ESLint before staging.

---

## 2. Naming Conventions
* **Classes & Interfaces**: PascalCase (e.g. `CareerService`, `IUserData`).
* **Variables & Functions**: camelCase (e.g. `getUserById`, `isVerified`).
* **Database Tables**: PascalCase singular (matching Prisma standards).
* **Environment variables**: UPPER_CASE (e.g. `JWT_SECRET`).

---

## 3. SOLID & Architecture Standards
* **Decoupled Interfaces**: Career engine and resume builders must inherit from base interfaces. This allows developers to swap Groq with Anthropic without altering endpoint controllers.
* **Separation of Concerns**: Controllers only handle HTTP validations and return DTO models. Logic operations reside in specialized Service classes. Database reads/writes go through Prisma repositories.
