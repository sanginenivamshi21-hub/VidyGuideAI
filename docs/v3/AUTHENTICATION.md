# Authentication & Authorization Specification

Detailed security protocols for user sessions in VidyGuideAI V3.

---

## 1. Authentication Topology
VidyGuideAI V3 migrates from memory session states to stateless JWT (JSON Web Tokens) stored in secure cookies:

```
[Client Dashboard] ──(1. Login request)──> [NestJS AuthController]
[Client Dashboard] <──(2. Secure Cookie)─── [NestJS AuthController]
  * Cookie Payload: { accessToken: JWT_String }
  * HTTP-Only, Secure, SameSite=Strict
```

---

## 2. JWT Cookie Specification
* **Secret Key**: Defined via `JWT_SECRET` environment variable (HMAC-SHA256).
* **Payload Structure**:
  ```json
  {
    "sub": 124,         // User ID
    "username": "ravi",
    "email": "ravi@gmail.com"
  }
  ```
* **Cookie Parameters**:
  * `httpOnly: true` (Blocks cross-site scripting access).
  * `secure: true` (Enforces HTTPS transmission).
  * `sameSite: "strict"` (Blocks cross-site request forgery attacks).
  * `maxAge: 86400000` (1 day expiry).

---

## 3. OTP Flow Configuration (Resend Integration)
* **API Handler**: NestJS routes query `Resend` REST API for email delivery.
* **Database Updates**: Save the hashed 6-digit verification code with a expiration timestamp (`now() + 10 minutes`).
* **Insecure Fallback Removal**: Disable the prototype fallback where OTPs are rendered on-screen if SMTP fails. In production, if Resend API returns an error, the endpoint must return a `502 Bad Gateway` to the client.
