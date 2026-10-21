---
name: SIRISOFT ERP
description: Internal time sheet, overtime, leave and team approval system for SIRISOFT staff.
colors:
  evergreen: "#4a8a6c"
  harbour-teal: "#2f7086"
  midnight-navy: "#0c2340"
  forest-action: "#2f6d57"
  forest-hover: "#3b7e66"
  mint-wash: "#e5f1eb"
  mint-mist: "#f1f8f4"
  on-green: "#cfe5da"
  sidebar-canopy: "#164536"
  sidebar-floor: "#0f3328"
  sidebar-sprout: "#7cc4a0"
  sidebar-text: "#b6cdc4"
  ink: "#12283a"
  slate-muted: "#626a76"
  faint-meta: "#6b7280"
  hairline: "#e5e7eb"
  paper: "#ffffff"
  office-grey: "#f4f6f7"
  subtle-fill: "#f9fafb"
  amber-pending: "#94600e"
  amber-wash: "#fff5df"
  brick-alert: "#ba3a3a"
  brick-wash: "#fff0f0"
  ink-2: "#374151"
  divider: "#f0f1f3"
  track: "#eef0f2"
  hover-fill: "#f3f4f6"
  border-input: "#e2e4e8"
  border-strong: "#d1d5db"
  neutral-wash: "#f1f2f4"
  green-300: "#9cc9b6"
  green-200: "#d6e9dd"
  teal-wash: "#edf4fb"
  amber-border: "#efdca6"
  amber-mark: "#d69a36"
  brick-border: "#f3c4c4"
  brick-mark: "#d14b4b"
  violet: "#6b5da4"
  violet-wash: "#f0edfa"
  violet-mark: "#867ab4"
  data-sand: "#c8a05b"
  sand: "#7a5a1f"
  sand-wash: "#f6efe2"
typography:
  headline:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.55px"
  metric:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "26px"
    fontWeight: 700
    letterSpacing: "-0.4px"
  title:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "19px"
    fontWeight: 700
  section:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 700
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
  table:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
  body-sm:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
  meta:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 650
  metric-sm:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: 700
    letterSpacing: "-0.4px"
  title-sm:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 700
  wordmark:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "21px"
    fontWeight: 650
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 700
    letterSpacing: "1.1px"
rounded:
  hairline: "2px"
  bar: "3px"
  kbd: "4px"
  tag: "5px"
  input: "7px"
  button: "8px"
  nav: "9px"
  card: "11px"
  modal: "13px"
  pill: "20px"
spacing:
  tight: "9px"
  grid-gap: "16px"
  panel: "20px"
  page-x: "38px"
  page-x-mobile: "14px"
components:
  button-primary:
    backgroundColor: "{colors.forest-action}"
    textColor: "{colors.paper}"
    rounded: "{rounded.button}"
    padding: "0 16px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.forest-hover}"
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "#374151"
    rounded: "{rounded.button}"
    padding: "0 16px"
    height: "40px"
  button-text:
    textColor: "{colors.forest-hover}"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "#1f2937"
    rounded: "{rounded.input}"
    padding: "0 11px"
    height: "41px"
  card:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.card}"
    padding: "{spacing.panel}"
  status-approved:
    backgroundColor: "#e9f5ee"
    textColor: "{colors.forest-action}"
    rounded: "{rounded.pill}"
    padding: "5px 8px"
  status-pending:
    backgroundColor: "{colors.amber-wash}"
    textColor: "{colors.amber-pending}"
    rounded: "{rounded.pill}"
    padding: "5px 8px"
  status-rejected:
    backgroundColor: "{colors.brick-wash}"
    textColor: "{colors.brick-alert}"
    rounded: "{rounded.pill}"
    padding: "5px 8px"
  status-submitted:
    backgroundColor: "#edf4fb"
    textColor: "{colors.harbour-teal}"
    rounded: "{rounded.pill}"
    padding: "5px 8px"
  status-draft:
    backgroundColor: "#f1f2f4"
    textColor: "#6c7771"
    rounded: "{rounded.pill}"
    padding: "5px 8px"
  nav-item:
    textColor: "{colors.sidebar-text}"
    rounded: "{rounded.nav}"
    padding: "0 14px"
    height: "46px"
  nav-item-active:
    backgroundColor: "rgba(255,255,255,.13)"
    textColor: "{colors.paper}"
---

# Design System: SIRISOFT ERP

## Overview

**Creative North Star: "The Evergreen Office"**

A calm, green-lit office that people open every working day. The deep evergreen sidebar is the one large field of brand colour; everything the user works on sits on white paper cards over a cool office-grey floor. The brand lives in precise details rather than big gestures: the active nav rail in sprout green, the forest-green primary button, the mint wash behind a total or a hint.

Density is moderate and work-first. Screens are built from a page header, a row of summary cards, then panels with tables or lists. Colour carries meaning before it carries mood: green means done or approved, amber means waiting, brick red means missing or rejected, teal means submitted. Components are refined and restrained: thin hairlines, nearly invisible shadows, and green used only where someone is meant to act.

**Key Characteristics:**
- Dark evergreen sidebar, light grey page, white cards.
- Flat surfaces separated by 1px hairlines; shadows only on floating layers.
- One primary action per view, in forest green.
- Status colour is semantic and consistent across every feature.
- Inter throughout, with tight negative tracking only on headings and metrics.

## Colors

A restrained palette of evergreen and neutrals, with teal, amber and brick reserved for status.

### Primary
- **Evergreen** (`--brand-green`): the logo green. Used for data marks (chart bars, progress fills, toggles on), focus rings and the saved indicator.
- **Forest Action** (`--green-900`): primary buttons, the selected day in the week strip, active pagination, and approved status text.
- **Forest Hover** (`--green-800`): primary button hover, text buttons, active tabs and settings nav, icons inside mint tiles.

### Secondary
- **Harbour Teal** (`--brand-teal`, exposed as `--blue`): the "submitted" and "remote" state, and the second series in charts.

### Tertiary
- **Midnight Navy** (`--brand-navy`): page headings and the toast background. The darkest ink in the system.

### Neutral
- **Sidebar Canopy → Sidebar Floor** (`--sidebar-top` → `--sidebar-bottom`): the vertical gradient of the sidebar.
- **Sidebar Sprout** (`--sidebar-accent`): the active nav rail and the brand tagline in the sidebar.
- **Sidebar Text** (`--sidebar-text`): resting nav item labels on the sidebar gradient.
- **On Green** (`--on-green`): pale mint text and dots on a solid Forest Action cell (selected day, selected time).
- **Mint Wash / Mint Mist** (`--green-100` / `--green-50`): soft fills for icon tiles, estimates, hours previews and selected settings items.
- **Ink** (`--text`): primary text.
- **Ink 2** (`--ink-2`): field labels and secondary button text.
- **Slate Muted** (`--muted`): secondary text and descriptions.
- **Faint Meta** (`--faint`): timestamps, captions, placeholders and axis labels. The lightest grey that still passes 4.5:1 on white and Subtle Fill; never go lighter for text.
- **Hairline** (`--border`): card borders, dividers, table head borders. Rows inside lists use the lighter Divider (`--divider`); progress tracks use Track (`--track`).
- **Paper** (`--surface`): cards, panels, modals, inputs.
- **Office Grey** (`--bg`): the page floor.
- **Subtle Fill** (`--subtle`): table headers, modal footers, search fields.
- **Hover Fill** (`--hover`): secondary button and row hover.
- **Input Border / Strong Border** (`--border-input` / `--border-strong`): input and secondary button outlines; the stronger grey for secondary button hover, dashed outlines (upcoming and unsubmitted days, upload box) and the toggle track off.
- **Neutral Wash** (`--neutral-bg`): Draft and Probation chips.
- **Amber Pending / Amber Wash** (`--amber` / `--amber-bg`): pending status, items awaiting a decision, warnings.
- **Brick Alert / Brick Wash** (`--red` / `--red-bg`): rejected status, missing time, destructive actions, errors.

### Status families
Each status hue comes as a family: text (`--amber`, `--red`, `--brand-teal`, `--green-900`), a wash for chips and tiles (`--amber-bg`, `--red-bg`, `--teal-bg`, `--green-100`), a border (`--amber-border`, `--red-border`, `--green-200`) and a mid "mark" for dots, bars and stripes (`--amber-mark`, `--red-mark`, `--brand-green`). Draft and neutral states use `--muted` on `--neutral-bg`.

### Data categories
Leave types, internal work and chart series use their own hues so they never read as a status: **Violet** (`--violet`, `--violet-bg`, `--violet-mark`) for sick leave and Internal work, **Sand** (`--data-sand`) for personal leave, **Green 300** (`--green-300`) for overtime in charts.

### Named Rules
**The Amber Means Waiting Rule.** Amber is only for something awaiting a decision (a submitted request, a week not yet approved). Leave tags and "On leave" use Sand (`--sand`, `--sand-bg`), holidays use Violet, Probation is neutral, and a Draft week is neutral with a dashed outline.

**The Data Is Not Status Rule.** Teal, amber and brick never encode a category. If a chart or tag needs another hue, use the data colours above.

**The Status Is Sacred Rule.** Green = approved/complete, amber = pending/waiting, brick = rejected/missing, teal = submitted, grey = draft. Never reuse these hues decoratively, and never show a status in a colour other than its own.

**The One Green Button Rule.** A view has one forest-green primary button. Other actions are secondary (white with hairline) or text buttons.

**The Tokens Only Rule.** Colours are changed in `:root` of `src/styles/globals.css`, never inline. Outside `:root` the stylesheet uses only `var(--…)`; the only literals left are the rgba scrims and shadows.

## Typography

**Display Font:** Inter (via `next/font`, with ui-sans-serif, system-ui fallbacks)
**Body Font:** Inter
**Label/Mono Font:** none distinct; labels are Inter uppercase.

**Character:** One neutral, highly legible sans for everything. Hierarchy comes from size and weight, not from a second typeface. Weights in use are 400, 550, 600, 650 and 700.

### Hierarchy
- **Headline** (700, 28px, line-height 1.2, −0.55px, Midnight Navy): the page title in `PageHeader`. Drops to 26px under 600px.
- **Metric** (700, 24–26px, −0.4px): the number on summary, report and balance cards.
- **Title** (700, 18–19px): modal and dialog titles.
- **Section** (700, 15px): panel headings.
- **Body** (400, 14–15px, line-height 1.5): page descriptions, nav items, buttons (650), form inputs.
- **Table** (400, 13px; 650 for the primary cell): table cells and dense list rows.
- **Label** (700, 12px, 1.1px tracking, uppercase): eyebrows and table headers (0.55px tracking).

### Named Rules
**The 11px Floor Rule.** No text is smaller than 11px. Use 11–13px for labels and meta, 14–15px for body and table text, 18px+ for headings and values.

**The Thai-Ready Rule.** Thai text is coming. Don't rely on uppercase or letter-spacing to carry meaning, and leave line-height room for Thai vowels and tone marks.

## Layout

A fixed 244px sidebar on the left, a sticky 72px white topbar, and a `main` content column capped at 1560px with 31px/38px padding. Each page follows the same order: page header (title, description, actions on the right), a grid of summary cards (4–5 columns, 15–16px gaps), then one or two panel columns (main panel about 1.65–1.8fr beside a 270–300px side stack).

Spacing is moderate and close to an 8px rhythm, with frequent 15–21px values for panel padding and grid gaps.

Responsive behaviour has three steps:
- **≤1100px:** summary grids go to 2 columns, two-column dashboards stack, filters collapse into a filter button.
- **≤820px:** the sidebar becomes an off-canvas drawer behind a dark overlay, a hamburger appears, page padding drops to 20px, and side stacks move under the main panel.
- **≤600px:** the topbar drops to 62px and hides search, page padding drops to 14px, header actions go full width, forms become one column, and low-priority table/list columns hide.

## Elevation & Depth

Flat by default. Cards and panels sit on the grey floor with a 1px hairline and a shadow so faint (`0 1px 2px` at 2.5% opacity) it reads as a crisp edge, not a lift. Real shadows belong to layers that float above the page: modals, confirm dialogs and toasts. Hover lift is reserved for things you can click: the primary button rises 1px and calendar days rise 1px with a soft shadow.

### Shadow Vocabulary
- **Card edge** (`box-shadow: 0 1px 2px rgba(22,47,35,.025)`): panels and summary cards.
- **Button edge** (`box-shadow: 0 1px 2px rgba(13,59,44,.14)`): primary button.
- **Hover lift** (`box-shadow: 0 4px 12px rgba(15,40,30,.08)`): clickable calendar days on hover.
- **Toast** (`box-shadow: 0 8px 30px rgba(9,45,30,.25)`): the bottom-right toast.
- **Popover** (`box-shadow: 0 12px 32px rgba(9,45,30,.16)`): the open dropdown list.
- **Overlay** (`box-shadow: 0 24px 70px rgba(8,32,21,.24)`): modals and confirm dialogs, over a `rgba(10,29,20,.45)` backdrop with a 2px blur.

### Named Rules
**The Flat Floor Rule.** Surfaces at rest are flat. Separate them with hairlines and tonal fills, not shadows. Only floating layers get a real shadow.

## Shapes

Gently rounded and consistent, getting rounder as the element gets bigger: progress bars and legend swatches (2–4px), tags (5px), inputs (7px), buttons and search (8px), nav items (9px), cards and panels (11–12px), modals (13px). Status chips and availability badges are full pills (20px). Avatars and dots are circles. Icon tiles are 34–46px rounded squares (8–11px) on a mint, amber, teal or brick wash. Cards never carry coloured edge stripes: the icon tile or a small 8px dot before the label carries the tone.

## Components

### Buttons
Refined and restrained; one green button per view.
- **Shape:** gently rounded (8px), at least 40px tall, 0 16px padding, 14px weight 650, icon gap 8px.
- **Primary:** Forest Action fill, white text, button edge shadow.
- **Hover / Focus:** Primary moves to Forest Hover and rises 1px; transitions are 0.2s.
- **Secondary:** white with a `#e2e4e8` border and `#374151` text; hover fills `#f3f4f6`.
- **Text button:** no fill, Forest Hover text, often with a trailing chevron.
- **Review:** compact 34px outline button in Forest Hover; on mobile it collapses to its icon.
- **Reject / Destructive:** white with brick text and a pale brick border; inside a confirm dialog it becomes solid brick.

### Chips
- **Status chip:** pill, 12px weight 650, a 5px dot in currentColor, then the label. Colours follow The Status Is Sacred Rule.
- **Tag:** 5px radius, 12px: Billable on mint, Internal on Violet (`--violet` on `--violet-bg`), Leave on Sand (`--sand` on `--sand-bg`).
- **Availability / employment badges:** 11px pills: Working in green, Remote in teal, On leave in Sand, Probation neutral.

### Cards / Containers
- **Corner Style:** 11px (report cards 12px).
- **Background:** Paper on Office Grey.
- **Shadow Strategy:** card edge only (see Elevation & Depth).
- **Border:** 1px Hairline.
- **Internal Padding:** 18–21px. Panels have a `panel-head` (title, optional description, actions) with an optional bordered bottom.
- **Summary card:** eyebrow label, Metric value, muted caption, a 38px icon tile in the top-right, optional 4px progress bar.

### Inputs / Fields
- **Style:** white, 1px `#e2e4e8`, 7px radius, 41px tall, 14px text, `#9ca3af` placeholder. A field is a 13px weight 650 label above the control; required marks are a red asterisk.
- **Focus:** border turns Evergreen with a 3px soft green ring (`rgba(78,155,113,.11)`).
- **Error:** 12px brick text with an icon under the field. Warnings use an amber validation banner.
- **Forms:** two-column `form-grid` (17px × 18px gaps), single column under 600px.
- **Dropdowns:** native `<select>` everywhere, styled with `appearance: base-select` where supported: a white list with a 1px hairline, card radius (11px), 4px inset and the Popover shadow; options are 14px with the input radius (7px, concentric with the list), Mint Mist on hover, and the selected option in Forest Action weight 650 with a brand-green check. Browsers without support show their native list. Never replace `<select>` with a custom div menu.
- **Date fields:** the shared `DatePicker` (`components/ui/date-picker.tsx`), never a native date input. The trigger looks like an input (41px, 7px radius) showing "Fri, May 16, 2025" with a calendar icon. The calendar opens in the top layer: 296px, card radius, Popover shadow, Monday-first like the week strip; today has a hairline Mint ring, the selected day is solid Forest Action with pale mint text, weekends are muted, out-of-range days are faded and disabled, and public holidays carry a violet dot (with a legend). Arrow keys, Page Up/Down, Home/End and Escape work; day cells grow to 44px on phones.
- **Time fields:** the shared `TimePicker` (`components/ui/time-picker.tsx`), never a native time input. It stays typeable for speed ("930", "9:30", "18" all work); ↑/↓ step one minute and Page Up/Down one hour. It opens hour (00–23) and minute (00–59) columns in the same popover as the date picker, the chosen cell solid Forest Action, and a footer that shows an end time's duration from the start ("3h 30m from start"). A shared `useAnchoredPopover` hook places both pickers.

### Navigation
- **Sidebar:** Canopy-to-Floor gradient, white brand block with the logo mark on a white rounded tile. Items are 46px tall, 9px radius, 15px weight 550 in `#b6cdc4`. Hover adds a 7% white wash. Active adds a 13% white wash, white text, weight 650 and a 3px Sprout rail on the inside left. Count badges are amber pills.
- **Topbar:** white, sticky, with search (and ⌘K hint), role switcher, notifications and profile.
- **Tabs:** underline tabs; active is Forest Hover with a 2px bottom border; counts sit in small grey pills.
- **Mobile:** under 820px the sidebar slides in from the left over a dark overlay.

### Week Strip (signature)
The time sheet's week navigator: arrows on both ends and seven day cells showing weekday, date and logged hours. The selected day is a solid Forest Action cell with pale mint text. Holidays show their hours in Violet (On Green when selected).

### Completion Calendar (signature)
Month grid for the incomplete time sheet report. Each day is a bordered tile coloured by state: complete (mint), unapproved (amber), unfilled (brick), off (grey) and upcoming (dashed outline). On mobile the tiles shrink and hide their captions.

## Do's and Don'ts

### Do:
- **Do** use the existing classes in `src/styles/globals.css` (`panel`, `panel-head`, `primary-btn`, `secondary-btn`, `field`, `status-*`, `summary-card`) before creating new ones, and add new rules next to related ones, including their responsive rules.
- **Do** keep one forest-green primary action per view.
- **Do** pair every status colour with its label and dot; colour is never the only signal.
- **Do** separate surfaces with 1px Hairline borders and `#f0f1f3` row dividers.
- **Do** design every new screen at 600px and 820px as well as desktop.

### Don't:
- **Don't** change or replace the SIRISOFT green theme, or hard-code colours outside `:root`.
- **Don't** use status colours (amber, brick, teal) for decoration.
- **Don't** add heavy shadows to cards at rest; only modals, dialogs and toasts float.
- **Don't** set text below 11px.
- **Don't** build new modal backdrops; use the shared `Modal` and `ConfirmDialog`.
- **Don't** put a bordered, tinted box inside a panel (a card in a card). Separate a summary row inside a panel with a 1px divider instead.
- **Don't** add coloured stripes along a card edge; use the icon tile or a dot.
