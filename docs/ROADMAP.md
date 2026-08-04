# VidyGuideAI — Roadmap

Living document. Kept intentionally small — every item must map to a user outcome, not a framework preference.

## Shipped

- [x] AI Mentor (streaming, provider fallback, file + voice input)
- [x] Resume Builder (5 ATS templates, live preview, PDF export)
- [x] Resume Review (OCR parsing, ATS scoring, AI feedback)
- [x] Career guidance & role validation
- [x] Interview prep (mock interviews, scored feedback)
- [x] Multilingual translator (10+ languages)
- [x] Auth (JWT http-only cookies, OTP), guest mode
- [x] Dashboard (streaks, XP, activity), PWA offline, Docker, CI
- [x] Real Jest unit tests in CI (2026-08)

## Now / next

- [ ] Skill-gap analysis — map resume + goals to missing competencies
- [ ] Company-specific interview question banks
- [ ] LinkedIn integration

## Later

- [ ] Community resume templates
- [ ] Resume version history & comparison
- [ ] Offline-first with full service worker
- [ ] Dedicated domain beyond `.is-a.dev`
- [ ] Redis caching + rate-limit hardening at scale
- [ ] e2e test coverage for auth + resume analysis flows

## Non-goals (deliberate)

- Custom "AI model" hype features without a clear user outcome
- Paid tiers before free value is proven