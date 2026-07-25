# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.2.0] - 2026-07-26
### Added
* Created `.gitignore` to prevent tracking `.env`, `.db`, and python cache files.
* Established GitHub Actions workflows for continuous integration validation.
* Added standard issue and pull request templates inside `.github/`.
* Created architectural documentation assets: [ARCHITECTURE.md](ARCHITECTURE.md), [ROADMAP.md](ROADMAP.md), [CONTRIBUTING.md](CONTRIBUTING.md), [SECURITY.md](SECURITY.md), and [LICENSE](LICENSE).

### Fixed
* Wiped all historic Groq, Anthropic, and HuggingFace API key credentials from all commits in git history.
* Fixed syntax error in backend mentor chat (`rom` to `from`).
* Fixed `SMTP_HOST` configuration typo inside local `.env` variables from email address to server address (`smtp.gmail.com`).

---

## [0.1.0] - 2026-03-09
### Added
* Initial prototype release of VidyGuideAI with Streamlit frontend and FastAPI backend.
* Integrated local SQLite user accounts database.
* Added basic modules for Resume Exporter, Speech synthesizer, and PDF scanner.
