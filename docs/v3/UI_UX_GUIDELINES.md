# UI/UX & Visual Design Guidelines

Design token rules, layout panels, and component mappings for VidyGuideAI V3.

---

## 1. Visual Token Definitions

* **Color Palette (Slate Theme)**:
  * Primary: Slate Dark (`#0B0F19`)
  * Secondary: Cobalt Accent (`#1E3A8A`)
  * Neutral background: Deep Navy Radial Gradient (`#090D16` to `#0B0F19`)
  * Text Primary: Cool Grey (`#E2E8F0`)
* **Typography Hierarchy**:
  * Title Font: **Outfit** (Inter alternative).
  * Body Text Font: **Inter**.
  * Code/Telemetry font: **JetBrains Mono**.

---

## 2. Integrated Visual Assets & Motion
* **Canvas Aurora**: Embed `<SoftAurora />` shader overlay at `opacity: 0.12` behind dashboard cards.
* **Navigation panels**: Implement collapsible floating `<Sidebar />` on left margin with smooth tooltips.
* **Component Animations (Framer Motion)**:
  * Fade-in cards: `initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}`.
  * Tab transition: View transitions enabled to smooth sliding submenus.
  * Active timeline nodes: Hover scaling `whileHover={{ scale: 1.03 }}`.

---

## 3. Responsive Breakpoints
* **Mobile / Portrait**: Collapsed sidebar overlay, single-column dashboard.
* **Tablet / Desktop (>=1024px)**: Uncollapsed left sidebar sidebar navigation, dual-column widgets grid layout.
