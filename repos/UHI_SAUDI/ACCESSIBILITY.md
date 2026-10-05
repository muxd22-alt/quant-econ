# Accessibility Statement

**Project:** Saudi Arabia Autonomous Economy Simulator
**Last updated:** 2026-10-05
**Status:** actively maintained — accessibility reports are triaged like bugs.

## Our commitment

This is a public-interest research tool about household income and the future
of work in Saudi Arabia. If it cannot be used with assistive technology, most
of the people it is about cannot read it. We aim for **WCAG 2.1 Level AA** and
treat regressions as release blockers.

## Supported environments

| Environment | Support |
|-------------|---------|
| Chrome / Edge (current) | ✅ primary |
| Firefox (current) | ✅ |
| Safari (macOS / iOS, current) | ✅ |
| Text zoom 200% | ✅ layout reflows, main region scrolls |
| Keyboard only | ✅ |
| Screen readers (NVDA, VoiceOver) | ⚠️ partial — see limitations |
| Reduced motion (`prefers-reduced-motion`) | ✅ animations disabled |
| RTL (Arabic) | ✅ full document direction switch |
| Windows High Contrast / forced-colors | ⚠️ not audited |

## What is implemented

- **Language & direction switch** is a real `<button>` with a visible text
  label (`عربي (SAR)` / `English (USD)`), not an icon-only control.
- **Every toggle is a focusable element** with `role="switch"`,
  `aria-checked`, and keyboard activation (`Enter` / `Space`).
- **Sliders are native `<input type="range">`** — arrow keys, `Home`/`End`
  and screen-reader value announcements work. Each carries an `aria-label`
  and a visible min/max pair.
- **Section headers** are `role="button"` + `tabindex="0"` with keyboard
  activation; collapse state is reflected visually.
- **Focus is always visible** (`:focus-visible` outline in the accent colour).
- **Status changes are announced** — the data-source pill is
  `role="status"` / `aria-live="polite"`.
- **Chart mode and preset controls** expose `aria-pressed`; the legend chips
  are real buttons with an off state that is not signalled by colour alone
  (opacity + `aria-pressed`).
- **Text contrast**: body text targets ≥ 4.5:1 on the dark theme; muted text
  is reserved for secondary labels only.
- **No motion by default** for users who request reduced motion.
- **Western Arabic numerals** are forced via `Intl.NumberFormat`
  (`numberingSystem: "latn"`) so digits stay consistent across locales.
- **Scales and units are never colour-only** — every chart axis, tooltip and
  card carries a text label (`SAR`, `$`, `%`, `T`).

## Known limitations

1. **The chart is a `<canvas>`.** Chart.js draws pixels, so screen readers do
   not traverse individual data points. Mitigation: every value shown in the
   chart is also present as text — the five KPI cards, the legend, and the
   tooltip summaries. A tabular data alternative (the existing
   `Export CSV` output) is the current workaround; an on-page data table is
   [planned](https://github.com/muxd22-alt/UHI_SAUDI/issues).
2. **Native `title` tooltips** on slider labels may be slow or silent in some
   screen-reader/browser combinations. The label text itself is always in the
   DOM.
3. **Fine-grained chart tooltips** are hover-driven (`interaction: index`);
   keyboard users get the same values from the KPI cards rather than from the
   chart itself.
4. **Small type** in dense UI (10–11px micro-labels) may be tight for low
   vision users even at 200% zoom; the page reflows but does not re-scale
   those tokens.
5. **`forced-colors` / Windows High Contrast mode has not been audited.**
6. **Arabic copy is machine-assisted** and reviewed by the maintainer; if a
   translation is unclear, that is an accessibility issue too — please report it.
7. **Colour palette** (emerald/blue/amber on near-black) is not verified with
   a deuteranopia/protanopia simulator for every chart series.

## Reporting a barrier

Use the **Accessibility** issue form when
[creating an issue](https://github.com/muxd22-alt/UHI_SAUDI/issues/new/choose),
or open a private report through the contact options on the
[maintainer's profile](https://github.com/muxd22-alt) if the barrier is
sensitive.

Please include:

- Assistive technology + browser + operating system
- What you were trying to do and what happened
- Whether a workaround exists (e.g. CSV export, other language)

**Response target:** acknowledgement within 7 days, triage within 14 days.
Barriers that block basic reading or navigation are treated as high priority.

## Attribution

This statement is adapted from common practice described in
[GitHub's writing an accessibility statement guide](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/writing-an-accessibility-statement).
