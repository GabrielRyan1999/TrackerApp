# Design System: Budget Tracker (50/30/20 IDR)

Crafted using **UI/UX Pro Max** and verified with **Impeccable**.
Target mode: **Operate** (FinTech Personal Finance & Monthly Budget Planning).

---

## 1. Visual Philosophy & Anti-Slop Discipline
- **No Card-in-Card Nesting:** Flattened visual hierarchy. Structural separation is achieved via generous whitespace, deliberate grid alignment, and clean 1px border dividers (`border-slate-200/90 dark:border-slate-800/90`), never via stacked container boxes.
- **No Eyebrow/Kicker Labels:** Headings speak directly with weight and scale; redundant uppercase micro-labels are banned.
- **No Unicode Emoji as Structural Icons:** 100% vector SVG icons from Lucide (`CategoryIcon` system) with a unified 1.75px stroke-width and accessible semantic labeling.
- **No Sub-11px Microtext:** Minimum floor of 12px for small metadata, 14px for body/content, and 18–30px for key financial metrics.
- **Zero-Drift Integers:** All Indonesian Rupiah amounts stored as integers with localized dot separators (`Rp 10.000.000`).

---

## 2. Typography
- **Primary Font:** **Manrope** (Geometric Grotesque, modern fintech authority).
- **Tabular Font:** `JetBrains Mono` / `tabular-nums` for alignment of digits in transaction amounts.
- **Scale (Ratio ~1.28:1):**
  - **Hero Figures:** `text-3xl font-extrabold` (30px / 36px line-height)
  - **Section Titles (H2):** `text-lg font-bold` (18px / 24px)
  - **Card Headers (H3):** `text-sm font-bold` (14px / 20px)
  - **Body / Main Text:** `text-sm font-semibold` (14px / 20px)
  - **Subtext / Meta:** `text-xs font-medium` (12px / 16px)

---

## 3. Color Tokens & Contrast (WCAG AA & AAA Compliant)

| Role | Light Mode | Dark Mode | Usage |
|---|---|---|---|
| **Background** | `#F1F5F9` (`slate-100`) | `#080D1A` (Deep Midnight) | Canvas background |
| **Surface** | `#FFFFFF` (`white`) | `#0F172A` (`slate-900`) | Single-tier cards |
| **Primary Accent** | `#047857` (`emerald-700`) | `#10B981` (`emerald-500`) | Primary actions, CTA (Contrast > 5.2:1) |
| **Needs (50%)** | `#1D4ED8` (`blue-700`) | `#93C5FD` (`blue-300`) | Essential bills, housing, transport |
| **Wants (30%)** | `#BE185D` (`pink-700`) | `#F472B6` (`pink-300`) | Dining, shopping, lifestyle |
| **Savings (20%)** | `#047857` (`emerald-700`) | `#6EE7B7` (`emerald-300`) | Emergency fund, investments |
| **Overbudget** | `#BE123C` (`rose-700`) | `#FDA4AF` (`rose-300`) | Threshold alert (>100%) |

---

## 4. Interaction & Touch Targets
- All interactive controls (buttons, delete triggers, tab filters, theme switchers) enforce a minimum touch target area of **40–44px**.
- Mobile floating action button: 56×56px (`w-14 h-14`).
- Reduced motion: celebratory confetti and gauge transitions respect accessibility defaults.
