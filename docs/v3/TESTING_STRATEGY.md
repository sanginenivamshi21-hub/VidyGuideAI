# Testing & QA Strategy

Testing standards and automation policies for VidyGuideAI V3.

---

## 1. Test Architecture Matrix

We write tests using **Jest** (backend) and **Vitest / Playwright** (frontend).

| Scope | Tooling | Focus Area | Goal |
| --- | --- | --- | --- |
| **Unit tests** | Jest | AuthService, Validators, Prompt builders | 80% coverage |
| **Integration tests** | Supertest | REST endpoints mapping to Prisma mock DB | Verify status codes |
| **End-to-End (E2E)** | Playwright | Registration flow, OTP verification, PDF downloads | Verify full user path |

---

## 2. Example Backend Mock Unit Test
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(service);
  });

  it('should generate a 6-digit OTP code', () => {
    const otp = service.generateOtp();
    expect(otp).toHaveLength(6);
    expect(Number(otp)).not.toBeNaN();
  });
});
```

---

## 3. Automation Gating (CI/CD)
The GitHub Actions workflow will block all Pull Request merges unless:
* `npm run lint` passes without errors.
* `npm run test` executes successfully.
* `npm run test:e2e` completes with zero failures.
