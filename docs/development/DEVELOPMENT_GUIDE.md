# Development Guide

Welcome developers! Follow these guidelines to build and release code safely.

---

## 1. Branch Naming Policy
We follow feature branch isolation. Never commit directly to `main`.
* **Feature Branches**: `feature/your-feature-name` (e.g. `feature/resume-ocr`)
* **Bug Fixes**: `fix/your-fix-name` (e.g. `fix/otp-timer`)
* **Documentation**: `docs/your-doc-name` (e.g. `docs/api-reference`)

---

## 2. Commit Message Conventions
Commit messages must adhere to the **Conventional Commits** standard:
* `feat:` — Introduces a new application feature.
* `fix:` — Patches a bug or execution error.
* `refactor:` — Modifies code structure without behavior changes.
* `chore:` — Updates tooling configs, ignore rules, or dependencies.
* `docs:` — Updates documentation assets.

---

## 3. Pull Request Quality Gate
All changes must satisfy these checks before merging:
1. **Ruff Linting**: `ruff check .` passes without errors.
2. **Mypy Type Checking**: `mypy .` passes.
3. **Local Run verification**: Both FastAPI and Streamlit start successfully on local ports.
4. **Secret Scanning**: Credentials must be omitted from files.
