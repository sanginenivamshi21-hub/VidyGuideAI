# Contributing to VidyGuideAI

Thank you for considering contributing to VidyGuideAI! We welcome contributions from everyone, whether it's a bug report, feature suggestion, code improvement, or documentation fix.

---

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please be respectful, inclusive, and constructive in all interactions.

---

## How to Contribute

### Reporting Bugs

1. Check the [Issues](https://github.com/sanginenivamshi21-hub/VidyGuideAI/issues) to ensure the bug hasn't been reported yet.
2. Open a new issue using the **Bug Report** template.
3. Include:
   - A clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details (OS, browser, Node version)

### Suggesting Features

1. Open a new issue using the **Feature Request** template.
2. Describe the feature, its motivation, and any implementation ideas.
3. Explain how it benefits the project and its users.

### Submitting Code Changes

1. **Fork** the repository and create a branch from `main`:

   ```bash
   git checkout -b feat/my-feature
   ```

2. **Set up** the project locally (see [README](README.md#quick-start)).

3. **Make your changes** following our coding conventions:
   - Use TypeScript for all new code
   - Follow existing code style (Prettier, ESLint)
   - Write meaningful commit messages
   - Add tests for new functionality where possible

4. **Verify** your changes:

   ```bash
   # Frontend
   pnpm --filter web build
   pnpm --filter web lint

   # Backend
   pnpm --filter api build
   pnpm --filter api lint

   # TypeScript checks
   pnpm --filter web typecheck
   pnpm --filter api typecheck
   ```

5. **Commit** your changes:

   ```bash
   git commit -m "feat: add specific feature description"
   ```

   We follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` — new feature
   - `fix:` — bug fix
   - `docs:` — documentation
   - `chore:` — maintenance
   - `refactor:` — code restructuring
   - `style:` — formatting only
   - `test:` — adding tests

6. **Push** and open a Pull Request against `main`.

---

## Pull Request Guidelines

- Keep PRs focused on a single concern.
- Link to the related issue (e.g., `Closes #123`).
- Provide a clear description of what the PR does and why.
- Ensure all checks pass (CI build, lint, typecheck).
- Request review from maintainers.

---

## Development Workflow

### Project Structure

```
apps/api/     — NestJS backend
apps/web/     — Next.js frontend
python/       — Python scripts (OCR, PDF generation)
assets/       — Static assets and screenshots
docs/         — Documentation
```

### Running Locally

```bash
# Start API
pnpm --filter api dev

# Start web (in another terminal)
pnpm --filter web dev
```

### Code Style

- **TypeScript:** Strict mode enabled
- **Formatting:** Prettier (`.prettierrc`)
- **Linting:** ESLint with TypeScript rules
- **Imports:** Organize imports (no unused imports)

---

## Questions?

If you have questions, feel free to open a [Discussion](https://github.com/sanginenivamshi21-hub/VidyGuideAI/discussions) or reach out to the maintainers.
