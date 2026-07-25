# Contributing to VidyGuideAI

Thank you for your interest in contributing to VidyGuideAI! We welcome contributions from everyone.

---

## 1. Code of Conduct
By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## 2. How to Contribute

### Reporting Bugs
* Check the [Issues tracker](https://github.com/sanginenivamshi21-hub/VidyGuideAI/issues) to ensure the bug hasn't been reported yet.
* Open a new Issue using the **Bug Report** template, providing steps to reproduce the error.

### Suggesting Features
* Open a new Issue using the **Feature Request** template, explaining the proposed behavior and its benefits.

### Submitting Pull Requests
1. Fork the repository and clone it locally.
2. Create a new branch for your feature or bug fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Ensure your changes follow our coding standards:
   * Keep backend endpoints decoupled from framework libraries (Clean Architecture).
   * Follow SOLID principles.
   * Do not commit `.env` or other configuration secrets.
4. Format and lint your code:
   ```bash
   ruff check .
   mypy .
   ```
5. Commit using **Conventional Commit** conventions (e.g. `feat: add PDF exporter`, `fix: correct validation checks`).
6. Push to your branch and open a Pull Request against the `main` branch.

## 3. Pull Request Review Process
* All submissions must pass our GitHub Actions integration builds (CI check).
* Two maintainer reviews are required before merging.
