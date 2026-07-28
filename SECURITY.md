# Security Policy

## Supported Versions

Only the latest released version of VidyGuideAI receives security updates.

| Version | Supported |
|---------|-----------|
| 3.x     | ✅ Yes    |
| 0.x     | ❌ No     |

## Reporting a Vulnerability

Do **NOT** open public GitHub issues for security vulnerabilities. Instead, report them privately:

- **Email:** sanginenivamshi21@gmail.com
- **Response time:** Initial acknowledgment within 48 hours, detailed response within 5 business days.

Please include:
- A description of the vulnerability
- Steps to reproduce (proof of concept if possible)
- Potential impact
- Any suggested mitigations

## Security Best Practices

### For Contributors

1. **Never commit secrets.** API keys, passwords, tokens, and connection strings must never be committed to version control.
2. **Use environment variables.** All configuration values should be read from environment variables or `.env` files.
3. **Review dependencies.** Keep dependencies updated and review for known vulnerabilities.
4. **Follow the principle of least privilege.** API endpoints should validate authentication and authorization.

### For Production Deployments

1. **Rotate all secrets** before deploying to production.
2. **Enable HTTPS** with a valid TLS certificate.
3. **Use strong JWT secrets** (min 32 characters, cryptographically random).
4. **Enable rate limiting** (already configured via `@nestjs/throttler`).
5. **Set secure cookie flags:** `httpOnly`, `secure`, `sameSite: 'strict'`.
6. **Monitor logs** for suspicious activity.
7. **Keep PostgreSQL** behind a firewall or use a managed service (Neon, AWS RDS).

## Secret Scanning

This repository has **GitHub Push Protection** enabled. Any commit containing raw API keys, passwords, or tokens will be rejected.

If a secret is accidentally committed:
1. Immediately rotate the compromised secret.
2. Use `git filter-branch` or `bfg-repo-cleaner` to remove it from history.
3. Force push the cleaned history.
4. Contact GitHub Support if needed.

## Disclosure Policy

- Security vulnerabilities will be acknowledged within 48 hours.
- We will work with the reporter to understand and validate the issue.
- A fix will be developed and tested.
- The vulnerability will be disclosed publicly after a fix is released (typically 30 days after notification).
- The reporter will be credited in the release notes (if desired).
