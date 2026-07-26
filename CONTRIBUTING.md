# Contributing to VidyGuideAI

Thank you for considering contributing to VidyGuideAI! We welcome contributions from everyone.

---

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## How to Contribute

### Reporting Bugs

- Check the [Issues tracker](https://github.com/sanginenivamshi21-hub/VidyGuideAI/issues) to ensure the bug hasn't been reported yet.
- Open a new Issue using the **Bug Report** template, providing steps to reproduce the error.

### Suggesting Features

- Open a new Issue using the **Feature Request** template, explaining the proposed behavior and its benefits.

### Submitting Pull Requests

1. Fork the repository and clone it locally.
2. Create a new branch for your feature or bug fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Ensure your changes follow our coding standards:
   - Follow TypeScript best practices.
   - Keep backend endpoints decoupled from framework specifics.
   - Do not commit `.env` or other configuration secrets.
4. Format and lint your code:
   ```bash
   pnpm lint
   ```
5. Verify the build:
   ```bash
   pnpm build
   ```
6. Commit using **Conventional Commit** conventions (e.g. `feat: add PDF exporter`, `fix: correct validation checks`).
7. Push to your branch and open a Pull Request against the `main` branch.

## Pull Request Review Process

- All submissions must pass our GitHub Actions integration builds (CI check).
- At least one maintainer review is required before merging.
