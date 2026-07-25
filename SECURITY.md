# Security Policy

## 1. Supported Versions
Only the latest released version of VidyGuideAI receives security updates.

| Version | Supported |
| --- | --- |
| v0.2.x (Current) | ✅ Yes |
| v0.1.0 | ❌ No |

## 2. Reporting a Vulnerability
Do **NOT** open public GitHub issues for security vulnerabilities. Instead, report them privately:
* Email: **sanginenivamshi21@gmail.com**
* Expect an initial response within 48 hours.

## 3. Secret Scanning & GitHub Push Protection
This repository has **GitHub Push Protection** enabled. 
* Any commit containing raw API keys, passwords, or tokens will be rejected.
* Never commit `.env` or SQLite database files.
* Use environment variables or secrets managers (e.g. AWS Secrets Manager) in production.
* If a secret is leaked in history, rewrite the commits immediately using history scrubbing tools before unblocking the repository.
