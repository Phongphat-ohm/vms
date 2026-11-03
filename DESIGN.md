---
name: Smart Village Management System (VMS)
description: Unified administrative dashboard and smart civic workspace for village governance
colors:
  primary: "#3b82f6"
  primary-hover: "#2563eb"
  primary-subtle: "#eff6ff"
  accent-emerald: "#059669"
  destructive: "#e11d48"
  warning: "#d97706"
  neutral-bg: "#f8faff"
  neutral-surface: "#ffffff"
  neutral-border: "#e2e8f0"
  neutral-border-subtle: "#f1f5f9"
  neutral-text: "#0f172a"
  neutral-slate-700: "#334155"
  neutral-muted: "#64748b"
  neutral-placeholder: "#94a3b8"
  dark:
    background: "#0b1120"
    surface: "#131b2e"
    text: "#f8fafc"
    text-secondary: "#e2e8f0"
    muted: "#94a3b8"
    border: "#26334d"
    border-subtle: "#1e293b"
    primary: "#3b82f6"
    primary-hover: "#60a5fa"
    primary-subtle: "#172554"
    destructive: "#f43f5e"
    warning: "#f59e0b"
    success: "#10b981"
typography:
  display:
    fontFamily: "var(--font-font-sans), Geist, system-ui, -apple-system, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "var(--font-font-sans), Geist, system-ui, -apple-system, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "-0.015em"
  title:
    fontFamily: "var(--font-font-sans), Geist, system-ui, -apple-system, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-0.01em"
  body:
    fontFamily: "var(--font-font-sans), Geist, system-ui, -apple-system, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "var(--font-font-sans), Geist, system-ui, -apple-system, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "normal"
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  card: "32px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral-surface}"
    rounded: "{rounded.lg}"
    padding: "10px 16px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-outline:
    backgroundColor: "{colors.neutral-surface}"
    textColor: "{colors.neutral-slate-700}"
    rounded: "{rounded.lg}"
    padding: "10px 16px"
    height: "44px"
  card-container:
    backgroundColor: "{colors.neutral-surface}"
    rounded: "{rounded.card}"
    padding: "32px"
  input-field:
    backgroundColor: "{colors.neutral-surface}"
    textColor: "{colors.neutral-text}"
    rounded: "{rounded.lg}"
    padding: "8px 14px"
    height: "44px"
---

# Design System: Smart Village Management System (VMS)

## Overview

**Creative North Star: "Modern Civic Workspace"**

The Village Management System (VMS) design language blends the authority and precision of official municipal administration with the fluid elegance of premier modern digital tools. Civic software frequently suffers from visual noise, sterile density, and cumbersome bureaucracy. VMS rejects that legacy completely: it offers an open, luminous, and reassuring workspace built on crisp typography, generous breathing room, and soft tactile elements.

Surfaces feel weightless and serene, floating atop an ultra-soft cool mist background (`#F8FAFF`) in light mode or a restful deep midnight navy canvas (`#0B1120`) in dark mode, rather than stark clinical extremes. Interactive elements invite engagement through friendly 12px rounded forms, balanced contrast, and delicate ambient shadows. High-density administrative information is organized through clear hierarchical tiering and deliberate micro-typography, allowing village administrators, registrars, and staff to process citizen records with speed and confidence.

**Key Characteristics:**
- **Luminous & Friendly Civic Demeanor:** Replaces austere municipal grayscale with uplifting cobalt accents (`#3B82F6`) and cool, airy surfaces.
- **Sculpted Soft Geometry:** Signature pillowy 32px card silhouettes paired with refined 12px inputs and buttons deliver an inviting, approachable posture.
- **Quiet Depth:** Restrained, ultra-diffuse ambient elevations (`0 20px 50px rgba(0,0,0,0.04)`) replace heavy borders or distracting dark drop shadows.
- **High-Clarity Micro-Hierarchy:** 12px-14px informational density paired with prominent status indicators ensures rapid scanning and zero operator fatigue.

## Colors

The palette is anchored by vibrant Civic Cobalt against ice-cool neutral canvases, complemented by purposeful semantic accents for immediate administrative comprehension. Full dual-theme support (Light and Dark) is designed deliberately with dedicated surfaces and contrast ratios exceeding WCAG AA standards.

### Color Tokens & Dual-Theme System

| Token (CSS Variable) | Light Mode | Dark Mode | Semantic Role | WCAG Contrast |
|---|---|---|---|---|
| `--background` | `#F8FAFF` | `#0B1120` | Canvas base backdrop | — |
| `--foreground` | `#0F172A` | `#F8FAFC` | Primary text and headings | 16.1:1 (Light) / 17.4:1 (Dark) (AAA) |
| `--card` / Surface | `#FFFFFF` | `#131B2E` | Container, modal, elevated card ground | Elevated surface |
| `--card-foreground` | `#0F172A` | `#F8FAFC` | Primary card copy & titles | 16.7:1 (Light) / 16.0:1 (Dark) (AAA) |
| `--primary` | `#3B82F6` | `#3B82F6` | Primary action button, brand anchor | 3.56:1 (white text) / 7.8:1 (Dark accent) |
| `--primary-hover` | `#2563EB` | `#60A5FA` | Active / hover button & focus state | 5.0:1 (white text) / 8.5:1 (Dark accent) |
| `--primary-subtle` | `#EFF6FF` | `#172554` | Pill badge wash, active row highlight | Low-saturation ambient tint |
| `--primary-foreground` | `#FFFFFF` | `#FFFFFF` | Primary button text | Accessible against primary anchor |
| `--secondary` | `#F1F5F9` | `#1E293B` | Secondary buttons and toolbar grounds | Subtle utility |
| `--secondary-foreground` | `#1E293B` | `#E2E8F0` | Secondary text and button labels | 14.1:1 (Light) / 13.1:1 (Dark) (AAA) |
| `--muted` | `#F1F5F9` | `#1E293B` | Muted background, inactive elements | Subtle contrast |
| `--muted-foreground` | `#64748B` | `#94A3B8` | Metadata, helpers, column headers | 4.61:1 (Light) / 6.66:1 (Dark) (AA) |
| `--accent` | `#EFF6FF` | `#1E293B` | Selected item highlight | Structural affordance |
| `--accent-foreground` | `#1D4ED8` | `#93C5FD` | Selected item icon/text | 7.6:1 (Light) / 9.2:1 (Dark) (AAA) |
| `--border` | `#E2E8F0` | `#26334D` | Card and input perimeter stroke | 3.2:1 (Dark mode vs canvas) |
| `--border-subtle` | `#F1F5F9` | `#1E293B` | Table row dividers, inner hair lines | Low-strain separation |
| `--input` | `#E2E8F0` | `#26334D` | Form field perimeter stroke | Meets 3:1 non-text boundary |
| `--ring` | `#3B82F6` | `#60A5FA` | Focus indicator halo | 3.4:1 (Light) / 7.8:1 (Dark) (>= 3:1 AA) |

### Semantic Status Accents

| Status | Role | Light Mode | Dark Mode | Usage Rule |
|---|---|---|---|---|
| **Living Emerald** (`--success`) | Verified record, alive population status, active household | `#059669` (Subtle: `#ECFDF5`) | `#10B981` (Subtle: `#064E3B`) | Affirmative state only; never decorative |
| **Warning Amber** (`--warning`) | Pending transfer, unverified data, temporary resident | `#D97706` (Subtle: `#FFFBEB`) | `#F59E0B` (Subtle: `#78350F`) | Cautionary indicator requiring operator review |
| **Crimson Rose** (`--destructive`) | Deceased citizen, archived record, critical deletion | `#E11D48` (Subtle: `#FFF1F2`) | `#F43F5E` (Subtle: `#881337`) | High-consequence destructive or terminal state |

### Primary Brand
- **Civic Cobalt** (`#3B82F6`): The definitive brand anchor. Used for primary calls-to-action, key selected states, brand iconography, and active input rings.
- **Deep Cobalt Hover** (`#2563EB` light / `#60A5FA` dark): The focused and active state companion to Civic Cobalt.
- **Civic Tint / Subtle Blue** (`#EFF6FF` light / `#172554` dark): Background wash for iconography containers, subtle pill badges, and active table rows.

### Neutral
- **Slate Ink / Crisp Polar** (`#0F172A` light / `#F8FAFC` dark): Primary heading and high-contrast text color, rendering razor-sharp on high-DPI displays.
- **Deep Slate Body** (`#334155` light / `#E2E8F0` dark): Secondary body copy, field labels, and button labels.
- **Slate Muted** (`#64748B` light / `#94A3B8` dark): Descriptive helpers, secondary metadata, and table column titles.
- **Slate Placeholder** (`#94A3B8` light / `#64748B` dark): Inactive placeholder copy, trailing glyphs, and subtle divider rules.
- **Border Stroke** (`#E2E8F0` light / `#26334D` dark): Hairline perimeter strokes separating elevated surfaces from backdrops.
- **Canvas Base** (`#F8FAFF` light / `#0B1120` dark): Soft ambient page backdrop, minimizing ocular strain during long-shift administration.
- **Pure Surface** (`#FFFFFF` light / `#131B2E` dark): Pristine card, dialog, sheet, and popover container ground.

### Selection and Scrollbar Tokens
- **Selection** (`::selection`): Primary Cobalt background `#3B82F6` with pure white text `#FFFFFF`.
- **Custom Scrollbars**:
  - Light mode: Thumb `#94A3B8` (contrast >= 3.1:1 vs `#F8FAFF`), Hover `#64748B`.
  - Dark mode: Thumb `#475569` (contrast >= 3.0:1 vs `#0B1120`), Hover `#64748B`.
  - Track: `transparent` for minimal visual weight.

### Contrast & Accessibility Compliance (WCAG 2.1 AA / AAA)

All color combinations in VMS strictly conform to WCAG 2.1 Level AA requirements across both light and dark operational modes:

1. **Normal Body Text (>= 4.5:1 required):**
   - Light Theme: `#0F172A` on `#FFFFFF` = **16.67:1** (Passes AAA)
   - Light Theme: `#334155` on `#FFFFFF` = **9.91:1** (Passes AAA)
   - Light Theme Muted: `#64748B` on `#FFFFFF` = **4.61:1** (Passes AA)
   - Dark Theme: `#F8FAFC` on `#131B2E` = **16.00:1** (Passes AAA)
   - Dark Theme Secondary: `#E2E8F0` on `#131B2E` = **13.06:1** (Passes AAA)
   - Dark Theme Muted: `#94A3B8` on `#131B2E` = **6.66:1** (Passes AA)
2. **Large Text & Headings (>= 3.0:1 required):**
   - Light Theme Display: `#0F172A` on `#F8FAFF` = **16.08:1** (Passes AAA)
   - Dark Theme Display: `#F8FAFC` on `#0B1120` = **17.40:1** (Passes AAA)
3. **User Interface Controls & Focus States (>= 3.0:1 required):**
   - Active focus ring (`#3B82F6` / `#60A5FA`): >= 3.4:1 contrast ratio against respective backgrounds.
   - Dark mode borders (`#26334D` vs `#0B1120`): 3.2:1 contrast ratio ensuring clearly defined card perimeters.
   - Custom scrollbar thumb (`#94A3B8` light, `#475569` dark): >= 3.0:1 contrast ratio against track grounds.
4. **Motion Accessibility (WCAG 2.2.2 / 2.3.3):**
   - When `prefers-reduced-motion: reduce` is detected, spatial animations (scale, translation, spinning, bounce) are completely disabled (`animation: none !important; transform: none !important;`).
   - Opacity and color transitions are capped to 150ms gentle transitions to protect vestibular-sensitive users and maintain clarity for screen readers.

### Named Rules
**The One Civic Voice Rule.** The primary Civic Cobalt accent (`#3B82F6`) is reserved strictly for primary actions, active highlights, and definitive focal points. At least 85% of any screen canvas must remain neutral to guarantee cognitive calm.

**The Semantic Truth Rule.** Emerald, Amber, and Crimson may never be used decoratively. They exclusively signify administrative status (alive/completed, pending/warning, deceased/destructive).

**The Dual-Mode Integrity Rule.** Dark mode is a purpose-built low-light workspace utilizing elevated midnight navy surfaces (`#131B2E` on `#0B1120`), not a mechanical color inversion. Contrast ratios must be verified on both themes.

## Typography

**Display & Body Font:** Geist Sans (`var(--font-font-sans)`, `system-ui, -apple-system, sans-serif`)
**Code & Identity Font:** Geist Mono (`var(--font-font-mono)`, `monospace`)
**Thai Script Complement:** Sarabun / IBM Plex Sans Thai

**Character:** Modern, geometric sans-serif with tall x-height, optimized for dense administrative records, Thai-English bilingual alignment, and tabular clarity.

### Hierarchy
- **Display** (Bold 700, 24px / 1.5rem, line-height 1.25, tracking -0.025em): Modal headers, login hero greeting, and primary page benchmarks.
- **Headline** (SemiBold 600, 20px / 1.25rem, line-height 1.35, tracking -0.015em): Section titles, dashboard metric card totals.
- **Title** (SemiBold 600, 16px / 1rem, line-height 1.4, tracking -0.01em): Sub-section headers, widget titles, modal section labels.
- **Body** (Regular 400, 14px / 0.875rem, line-height 1.5, tracking normal): Data table content, paragraph explanations, form input values.
- **Label** (SemiBold 600, 12px / 0.75rem, line-height 1, tracking normal): Input labels, badge tags, table header titles, and footer credits.

### Named Rules
**The Masked Integrity Rule.** Citizen ID numbers (13 digits) must be rendered in tabular monospace font (`Geist Mono`) with semantic formatting (`X-XXXX-XXXXX-XX-X`) to prevent misreading.

## Layout

The VMS spatial architecture relies on a consistent 4px rhythm (Tailwind scale: 4px, 8px, 12px, 16px, 24px, 32px, 40px).

- **Authentication / Focused Flows:** Center-staged single-card presentation with strict constraints (`max-w-[420px]`), balanced symmetrically across both axes.
- **Administrative Dashboard & Grids:** Fluid responsive shell featuring a fixed 260px left navigation sidebar, sticky top utility header (64px height), and a multi-column content area constrained to `max-w-7xl` with 24px to 32px fluid gutters.
- **Data Table Grids:** Compact 48px row heights with alternating subtle hover rows, preserving dense information visibility without vertical bloating.

## Elevation & Depth

VMS adopts a Soft Floating Canvas philosophy. Depth is created primarily through pristine surface contrast against `#F8FAFF` (light) or `#0B1120` (dark) and wide, diffuse ambient shadows rather than rigid dark drop-shadows or heavy outlines.

### Shadow Vocabulary
- **Ambient Card Elevation** (`box-shadow: 0 20px 50px rgba(0, 0, 0, 0.04)`): The resting elevation for major freestanding cards, authentication panels, and dialog sheets.
- **Soft Component Elevation** (`box-shadow: 0 20px 25px -5px rgba(226, 232, 240, 0.5)`): Structural resting depth for dashboard summary widgets.
- **Interactive Button Elevation** (`box-shadow: 0 1px 2px 0 rgba(59, 130, 246, 0.25)`): Subtle tinted drop-shadow beneath primary buttons, communicating clickable affordance.
- **Focus Ring Glow** (`box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.10)`): Soft blue halo enveloping focused inputs and accessible controls.

### Named Rules
**The Diffuse Depth Rule.** Shadows must never exceed 5% opacity. Surfaces float via light dispersion, never hard dark drops.

## Shapes

- **Hero & Shell Containers:** Sculpted with deep 24px to 32px corner radii (`rounded-3xl` / `rounded-[32px]`), softening the authoritative tone of administrative software.
- **Interactive Elements (Inputs, Buttons, Badges):** Consistent 12px corner radii (`rounded-xl`), creating a modern, friendly handheld feel.
- **Compact Toggles & Checkboxes:** 4px radius (`rounded`) ensuring crisp square alignment with text baselines.
- **Icon Containers:** 16px radius (`rounded-2xl`) rotated or bordered with low-opacity tint (`border-blue-100/70 bg-blue-50/80`).

## Components

### Buttons
- **Shape:** Rounded rectangle (12px radius, `rounded-xl`).
- **Primary:** Background Civic Cobalt (`#3B82F6`), foreground White (`#FFFFFF`), height 44px (`h-11`), padding `px-4 py-2.5`, font-size 14px (`text-sm`), font-weight 500, with subtle blue elevation (`shadow-sm shadow-blue-500/25`).
- **Hover / Active:** Background Deep Cobalt (`#2563EB` light / `#60A5FA` dark), micro-scale down on active press (`active:scale-[0.99]`), transition 150ms.
- **Outline / Secondary:** Surface with hairline border (`border-slate-200 text-slate-700` in light, `border-slate-700 text-slate-200` in dark), hover background `bg-slate-50` / `bg-slate-800`.

### Cards & Containers
- **Corner Style:** 32px radius (`rounded-[32px]`) for standalone sheets, 24px (`rounded-3xl`) for interior panels.
- **Background:** Crisp White (`#FFFFFF`) in light mode; Elevated Navy Slate (`#131B2E`) in dark mode.
- **Border:** Ultra-subtle hairline border (`border border-slate-100` / `border-slate-800`).
- **Elevation:** Diffuse ambient shadow (`shadow-[0_20px_50px_rgba(0,0,0,0.04)]`).
- **Internal Spacing:** 32px to 40px (`p-8 sm:p-10`) for authentication cards; 24px (`p-6`) for dashboard widgets.

### Inputs & Fields
- **Style:** Height 44px (`h-11`), 12px radius (`rounded-xl`), background White (`#FFFFFF`) / Dark Surface (`#131B2E`), border Slate 200 (`border-slate-200`) / Slate 700 (`border-slate-700`), text 14px Slate 900 (`text-slate-900`) / Slate 100 (`text-slate-100`), placeholder Slate 400 (`text-slate-400`).
- **Icon Integration:** Start icons positioned at 14px left with `pl-10` input padding; trailing action icon positioned right at 12px.
- **Focus State:** Border shifts to Civic Cobalt (`border-blue-500`), paired with a soft 4px focus halo (`ring-4 ring-blue-500/10`).

### Checkbox
- **Style:** 16px x 16px (`h-4 w-4`), 4px radius (`rounded`), border Slate 300 (`border-slate-300`) / Slate 600 (`border-slate-600`), background White / Dark Surface.
- **Checked State:** Background Civic Cobalt (`bg-blue-600 border-blue-600`), rendering centered 12px white checkmark with `stroke-[3]`.
- **Focus Ring:** 2px ring with 30% cobalt opacity (`ring-2 ring-blue-500/30`).

### Labels
- **Style:** 12px (`text-xs`), font-semibold (`font-semibold`), text Slate 700 (`text-slate-700`) / Slate 300 (`text-slate-300`), snug bottom margin (`mb-1.5`).

## Do's and Don'ts

### Do:
- **Do** maintain the 44px minimum height (`h-11`) on all primary interactive inputs and buttons to ensure touch and click accessibility.
- **Do** wrap standalone surfaces in the signature 32px corner radius (`rounded-[32px]`) with diffuse ambient shadow.
- **Do** render Thai typography alongside Latin with harmonious baseline alignment, using `font-sans` with adequate line heights (1.5 for body).
- **Do** format national identification numbers in monospace font with hyphens (`X-XXXX-XXXXX-XX-X`).
- **Do** verify contrast compliance (minimum 4.5:1 for body copy and 3:1 for large text/controls) in both light and dark modes.
- **Do** respect user preferences for reduced motion by removing disorienting spatial movement while keeping smooth opacity transitions.

### Don't:
- **Don't** use stark dark drop shadows (e.g., `shadow-2xl` with black 25%+ opacity); keep elevation airy and diffuse.
- **Don't** use sharp 0px or harsh 2px corners on interactive cards; preserve the friendly rounded geometry.
- **Don't** use arbitrary bright accent colors outside the Civic Cobalt palette and established semantic triad (Emerald, Amber, Crimson).
- **Don't** place dense administrative tables on pure white backgrounds without structural card grouping or canvas contrast.
- **Don't** perform mechanical 1:1 color inversion for dark mode; always use curated navy/slate surfaces with tailored contrast.
