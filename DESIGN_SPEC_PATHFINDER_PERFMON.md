# DESIGN_SPEC_PATHFINDER_PERFMON.md
# Pathfinder Institutional Design System & UX Architecture Spec
> Drop-in design guideline, tokens, and prompt template for sister applications.

---

## 1. Executive Design Philosophy
* **Aesthetic Identity:** "Pathfinder Institutional" — clean, authoritative, military/civic-grade precision.
* **Surface Model:** Deep Navy / Obsidian dark mode (`#070d17`) & Crisp Off-White light mode (`#f8fafc`).
* **Visual Discipline:**
  * **Zero Garish Gradients:** All functional action surfaces (buttons, badges, indicators) use solid, flat fills.
  * **Zero Ambient Drop Shadows:** Eliminate heavy glow filters, fuzzy text shadows, and thick drop shadows. Elevation is conveyed strictly through subtle 1px border lines and tonal contrast.
  * **Strict Contrast & Legibility:** Minimum WCAG AA (4.5:1), targeting AAA (>11:1) for primary interactive text.
  * **No Outer Accent Borders:** No colored left/top card borders. All card containers have uniform subtle borders.
  * **No Markdown Blockquotes (`>`):** Banned across application UI text rendering to preserve strict data hierarchy.

---

## 2. Core Color Tokens & CSS Variables

```css
:root {
  /* ── LIGHT MODE ── */
  --color-bg: #f8fafc;
  --color-card-bg: #ffffff;
  --color-card-secondary: #f1f5f9;
  --color-surface: #ffffff;
  
  --color-text: #0f172a;
  --color-text-muted: #475569;
  --color-border: #e2e8f0;
  --color-border-subtle: #f1f5f9;

  --color-primary: #0284c7;        /* Deep Ocean Blue */
  --color-primary-hover: #0369a1;
  --color-primary-text: #ffffff;

  --color-accent: #d97706;         /* Institutional Amber / Gold */
  --color-accent-hover: #b45309;

  --color-danger: #dc2626;
  --color-success: #16a34a;
  --color-warning: #d97706;
  --color-info: #0284c7;

  /* Semantic Status Pills (Light) */
  --status-accomplished-bg: #dcfce7;
  --status-accomplished-text: #15803d;
  --status-accomplished-border: #86efac;

  --status-partial-bg: #fef9c3;
  --status-partial-text: #854d0e;
  --status-partial-border: #fde047;

  --status-pending-bg: #e0f2fe;
  --status-pending-text: #0369a1;
  --status-pending-border: #7dd3fc;

  --status-deferred-bg: #fee2e2;
  --status-deferred-text: #991b1b;
  --status-deferred-border: #fca5a5;

  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

html.dark {
  /* ── DARK MODE (Obsidian & Deep Cyan) ── */
  --color-bg: #070d17;
  --color-card-bg: #0f172a;
  --color-card-secondary: #131d33;
  --color-surface: #0f172a;

  --color-text: #f8fafc;
  --color-text-muted: #94a3b8;
  --color-border: #1e293b;
  --color-border-subtle: #172235;

  --color-primary: #38bdf8;        /* Sky Blue / Cyan */
  --color-primary-hover: #0284c7;
  --color-primary-text: #070d17;   /* High Contrast Deep Navy (>11:1 contrast) */

  --color-accent: #FFD700;
  --color-accent-hover: #fcd34d;

  /* Semantic Status Pills (Dark) */
  --status-accomplished-bg: rgba(16, 185, 129, 0.15);
  --status-accomplished-text: #34d399;
  --status-accomplished-border: rgba(16, 185, 129, 0.4);

  --status-partial-bg: rgba(245, 158, 11, 0.15);
  --status-partial-text: #fbbf24;
  --status-partial-border: rgba(245, 158, 11, 0.4);

  --status-pending-bg: rgba(2, 132, 199, 0.18);
  --status-pending-text: #38bdf8;
  --status-pending-border: rgba(56, 189, 248, 0.4);

  --status-deferred-bg: rgba(239, 68, 68, 0.15);
  --status-deferred-text: #f87171;
  --status-deferred-border: rgba(239, 68, 68, 0.4);
}
```

---

## 3. Layout & Component Blueprints

### A. Bento Box Card Architecture
* Never nest full accordions for primary functions. Use unstacked, square/rectangular Bento Box cards (`bento-card`).
* Card Internal Anatomy:
  1. **Top Row**: Category Pill (`Core` in Amber / `Support` in Violet) + Status Badge.
  2. **Title**: Extra bold (`font-weight: 800; font-size: 0.92rem; color: var(--color-text)`).
  3. **Description**: Thin, readable regular (`font-weight: 400; font-size: 0.8rem; color: var(--color-text-muted)`).
  4. **Bottom Stat & Action Footer**: Border-top subtle separator, large numerical stat (`font-weight: 900; font-size: 1.45rem`) paired with a compact action button (`.btn-sm`).

### B. Flat Action Buttons
* **Buttons must not have gradients.**
* Primary button rule:
  ```css
  .btn-primary {
    background: var(--color-primary);
    color: var(--color-primary-text) !important;
    font-weight: 700;
    border: 1px solid var(--color-primary-hover);
    box-shadow: none;
  }
  html.dark .btn-primary {
    background: var(--color-primary);
    color: #070d17 !important; /* Never white on cyan */
    font-weight: 800;
  }
  ```

### C. Clean Dropdown Selects
* Remove the default Windows/browser square double-arrow button:
  ```css
  select.form-control {
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    padding-right: 32px !important;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 10px center;
    background-size: 11px 11px;
  }
  html.dark select.form-control {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  }
  ```

### D. Horizontal Unstacked KPI Status Tiles
* Left icon badge (`42×42px`) beside a 2-line column:
  * Upper tiny label: `font-size: 0.68rem; font-weight: 700; text-transform: uppercase;`
  * Lower metric value: `font-size: 1.55rem; font-weight: 900; line-height: 1.1;`

### E. Flat Vector Avatars
* Do not use heavy emoji backgrounds or cartoonish portraits. Use minimal, monochrome or semantic flat SVG line icons with clean strokes (`strokeWidth="2.75"`).

---

## 4. Master Prompt for AI Agents on Other Projects

Copy and paste the prompt below into another agent conversation to replicate this UI/UX exactly:

```markdown
You are an expert full-stack developer refactoring this application to adhere to the Pathfinder Institutional Design System.

Apply the following mandatory architectural, UI, and UX constraints across the entire project:

1. COLOR & THEME SYSTEM:
- Enforce full Dark and Light mode support using CSS variables.
- Dark mode background is deep obsidian #070d17, card background #0f172a, subtle border #1e293b.
- Light mode background is #f8fafc, card background #ffffff, border #e2e8f0.
- Primary color in light mode is #0284c7 (white text).
- Primary color in dark mode is #38bdf8 (cyan), BUT button text MUST be deep dark navy #070d17 with font-weight: 800 to maintain an 11:1 WCAG AAA contrast ratio. Never use white text on bright cyan buttons.

2. ZERO GRADIENTS & ZERO SHADOWS:
- Remove all linear-gradient backgrounds on buttons, cards, banners, and headers. Use flat solid fills.
- Remove heavy box-shadows, ambient glow filters, and text-shadow effects. Rely strictly on clean 1px borders and surface contrast.
- Remove all accent borders (no colored left/top borders on cards).
- Never render Markdown blockquotes (>) in application copy.

3. BENTO BOX CARD LAYOUT:
- Group entity indicators, outputs, and commitments into responsive Bento Box grids instead of nested accordions.
- Card Title: Bold font-weight 800 (color: var(--color-text)).
- Card Description: Regular font-weight 400 (color: var(--color-text-muted)).
- Bottom Action Footer: Separated by a 1px subtle top border, featuring large numeric tallies (font-weight 900) and compact action buttons (.btn-sm).

4. FORM CONTROLS & SELECTS:
- All select dropdowns must use `appearance: none` and remove the default OS double-arrow box.
- Provide a clean minimal inline SVG chevron right-aligned.
- Password inputs must include a built-in eye toggle to show/hide plaintext.

5. HORIZONTAL STATUS STAT TILES:
- Status indicators (Accomplished, Pending, Partial, Deferred) must be laid out horizontally: 42x42px icon badge on the left, label and count stacked cleanly on the right.
```
