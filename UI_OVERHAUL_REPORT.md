# VidyGuideAI — UI Theme & Accessibility Overhaul Report

**Branch:** `feature/ui-theme-accessibility-overhaul` (from `feature/api-reverse-proxy`)
**Commit:** `a4ba35d` — 19 files changed, +2872 / −1294

## What shipped

### 1. Theme system (dark + light, zero hardcoded colors)
- `app/globals.css` rewritten as a semantic design-token layer:
  - Tokens: `--bg-primary/-secondary/-tertiary/-card`, `--text-primary/-secondary/-tertiary/-muted`, `--border-default/-subtle`, status colors (`--success/-warning/-error/-info` + bg/border variants), elevation shadows, radius scale, `--on-accent`.
  - **Light-theme strategy:** the app was built dark-first with the slate scale everywhere (~500 `slate-*` utilities). Instead of editing every component, the light theme reinterprets Tailwind's v4 palette via `:root.light` CSS vars (`--color-slate-950 → #f8fafc` … `--color-white → #0f172a`, accent 400/500 shades darkened for WCAG AA). Every existing utility (including opacity modifiers, hover variants, `text-white`, `bg-black/60`) now resolves correctly in both themes — verified by sweeping all routes in both modes.
  - Targeted light overrides: white labels stay white on solid colored buttons; modal scrims stay dark.
- Utility classes: `.surface-card`, `.surface-elevated`, `.surface-modal`, `.glass/-strong`, `.btn-primary/-secondary/-ghost/-danger/-soft`, `.input-field`, `.select-field`, `.toggle`, `.range-field`, `.chip`, `.alert-*`, `.badge-*`, `.kbd`, `.card-hover`, `.text-h1/h2/h3/h4`, `.text-caption`, `.icon-box`, `.skeleton-shimmer`, `.label`, spinner/message/wave/thinking keyframes.

### 2. i18n (en / हिंदी / తెలుగు) — settings-driven, live
- `lib/i18n.tsx`: `LanguageProvider` + `useI18n()` with full `en` dictionary (nav, settings, dashboard, profile, history, translator, ocr, interview, career, roadmap) and `hi`/`te` overrides; `t(key, params)` with `{param}` interpolation.
- Language switch applies **instantly** (localStorage cache) and persists to backend + `<html lang>` for screen readers.
- Wired into: Settings (live switch), Sidebar, MobileShell (labels, placeholders, theme option names), dashboard, profile, history, translator, ocr, interview-prep, career, roadmap.

### 3. Settings page — now fully functional
- 7 tabbed sections (Appearance, Language, Animations, Notifications, Speech, AI Preferences, Account & Privacy) with live search across all sections.
- Functional: UI language (en/hi/te) instant switch, theme (dark/light) + accent color picker (instant apply, persisted), animations kill switch (sets `data-animations` on `<html>`, disables all motion), notification toggles, speech rate/pitch/voice, model/temperature/maxTokens, auto-speak/auto-translate, sidebar collapsed, default resume style, chat history, profile picture upload/delete, password change, export data, sign out everywhere, delete account.
- Saves to backend `/settings` (service already existed in `apps/api`) with saving indicator + toast feedback; theme/accent/language also cached in localStorage for pre-hydration apply via the head script in `layout.tsx`.

### 4. Motion & polish
- `MotionConfig reducedMotion="user"` + `useAnimationsEnabled()` (honors `data-animations="false"` and `prefers-reduced-motion`).
- `PageTransition` (pathname-keyed AnimatePresence) on the desktop app shell.
- Dashboard: staggered stat cards with spring count-ins, skeleton loaders, error banner with retry. Profile/History/Translator/OCR/Interview: entrance animations, hover/tap states, progress bars, animated score rings. Sidebar: `layoutId` active-pill, collapse/expand persisted.

### 5. Accessibility (WCAG AA pass)
- Focus-visible rings on all interactive elements; `aria-current` on active nav; semantic headings (`text-h1..h4`); contrast-corrected text in light mode (slate-400→slate-600 etc.); `lang` attribute switching; keyboard-friendly controls (all rewritten pages use native buttons/inputs); reduced-motion support; resume paper stays white in light mode; toast/alerts use ARIA-friendly markup.

### 6. Bug fixes
- `lib/routes.ts`: invalid color classes in `DASHBOARD_CARDS` (`text-emerald-455`, `text-teal-465` etc.) → valid tokens.
- Light-mode: `text-white` on `bg-slate-900` surfaces, modal scrims, colored-button labels, resume paper — all verified in a full light-mode sweep.
- Resume dashboard ATS score bar, history timeline, translator swap/copy, OCR upload zone — rebuilt on tokens.

## Manual review checklist
- [ ] Toggle theme in Settings → every route (dashboard, settings, profile, history, translator, ocr, interview-prep, career, roadmap, resume, resume/builder, resume/review, mentor, auth, home) in light + dark.
- [ ] Switch UI language en → hi → te in Settings → nav, settings, and page headers change instantly; refresh persists.
- [ ] Toggle Animations off → no motion anywhere; on macOS enable "Reduce motion" → same.
- [ ] Change accent color → buttons/pills/indicators update instantly; refresh persists.
- [ ] Upload profile picture, change password, export data, delete account.
- [ ] Tab through pages → visible focus rings; sidebar active item announced via `aria-current`.
- [ ] Interview simulator: answer a question → evaluation panel + logs; results saved to History.

## Known issue (pre-existing, not from this change)
- `pnpm --filter @vidyguide/web lint` fails: `@rushstack/eslint-patch@1.16.1` (pulled by `eslint-config-next@15.1.0`) doesn't recognize ESLint 9.39.5 → "Failed to patch ESLint". Non-blocking: `next build` logs it as a warning and compiles cleanly (verified: `✓ Compiled successfully`, 21/21 static pages). Fix options: pin `eslint` ≤ 9.21 in apps/web or upgrade `eslint-config-next`/`eslint` together.

## Before / after
- Before: dark-only UI (white text baked in), hardcoded colors, settings that didn't persist/apply, static pages, no a11y focus treatment, broken card colors on dashboard.
- After: full dark+light theming from one token layer, working settings with live apply + persistence, trilingual UI, animated but reduced-motion-aware pages, AA contrast in both themes, one-commit diff on its own branch.
