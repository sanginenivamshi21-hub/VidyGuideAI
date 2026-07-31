
---

## Pass 2 — Pre-launch Brutal Design Review (2026-07-31)

Fresh senior-designer pass; previous scores ignored. Full critique: `BRUTAL_DESIGN_REVIEW.md` (repo root).

### Issues found & fixed
| Issue | Fix |
|---|---|
| "VidyGuideAI · Premium AI SaaS" footer on Dashboard — amateur filler | Removed entirely; page ends cleanly |
| Stat cards stacked `.glass surface-card` (double layer, too glass-heavy) | De-glassed to single `surface-card` layer on dashboard/ocr/translator/interview-prep (all 11 instances) |
| Career page micro-type 9–10px + emoji-labeled fields | Labels raised to explicit 10–12px hierarchy; UI-label emojis removed (🛠💡📍💬📊) — data content emojis kept per icon rule |
| Roadmap milestone badge `📍` prefix | Removed |
| Resume builder: raw `+`/`×` text glyphs as icons (17×) | Replaced with Lucide `Plus`/`X` |
| Resume builder: 24 inputs `rounded-lg p-2.5` vs `rounded-xl p-3` system | Normalized to `rounded-xl p-3` |
| Resume builder: flat main panel, no elevation rhythm | Added `shadow-xl` to active form panel |

### Reviewed & intentionally kept
- Auth page `rounded-xl` system — internally consistent (inputs/buttons/cards all xl)
- Resume review `rounded-3xl` panels — matches dashboard hero radius
- Composer 19px icons — deliberate touch-target scale (36px buttons)
- Home "AI Career Platform" pill — descriptive brand chip
- `✓` glyph in review score bubbles — content mark, not a control icon

### Verification
- `pnpm --filter @vidyguide/web build` ✓ 21/21 static pages, zero TS errors
- Dev server restarted (stale webpack fix); /dashboard, /career, /resume/builder all 200; Safari opened on /dashboard

### 21st.dev status
- MCP unavailable in this environment → zero 21st.dev components used (native shadcn/Radix patterns). Replacement list unchanged (§8 above). Not a component was recreated that the list doesn't already cover.
