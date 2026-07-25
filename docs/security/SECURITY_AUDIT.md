# Security Audit

Evaluation of cryptography, credential scanning, and routing protections.

---

## 1. Authentication & Session Security
* **Password Hashing**: Passwords are saved in SQLite using salted SHA-256 hashes.
* **Vulnerability (Exposed OTP Fallback)**: If SMTP connection fails, the OTP code is printed on the client-side UI screen. In production, this allows any user to bypass email ownership checks.
* **No JWT Token Verification**: Streamlit holds session state variables inside local memory instead of signed HTTP-only cookies, exposing session state to tampering.

---

## 2. Secrets Management
* **Status**: **Resolved**.
* **Clean commits history**: All historic API key strings (Groq `gsk_`, Anthropic `sk-ant-`, HuggingFace `hf_`) have been scrubbed from git history on all branches.
* **Environment variables**: Configured inside a git-ignored `.env` file.
