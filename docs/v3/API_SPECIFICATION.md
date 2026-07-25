# API Specification (NestJS DTOs)

Defines NestJS controller endpoints, payload structures, and validation rules.

---

## 1. Data Transfer Objects (DTOs)

### Authentication DTO
```typescript
import { IsEmail, IsString, MinLength, Matches } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(3)
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password is too weak. Must contain uppercase, lowercase, numbers, or symbols.',
  })
  password: string;
}
```

### Career Suggestion DTO
```typescript
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CareerSuggestionDto {
  @IsString()
  @IsNotEmpty()
  skills: string;

  @IsString()
  @IsNotEmpty()
  interests: string;

  @IsString()
  @IsNotEmpty()
  education: string;

  @IsString()
  @IsOptional()
  location?: string;
}
```

---

## 2. API Security Policies
* **Rate Limiting**: NestJS `@nestjs/throttler` package configurations limit active route hits to 100 requests per 15 minutes per IP.
* **CORS policy**: Strict configuration mapping allowing queries only from approved client domains (e.g. `https://vidyguide.ai`).
