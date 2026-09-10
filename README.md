# Lemon Herb Roast Chicken — Recipe App

A single-file recipe viewer with a fully accessible, scalable serving control.

## Features

- Adjustable servings (1–99) with `−` / `+` buttons or direct number input
- All ingredient quantities scale in real time
- Screen-reader announcements on every quantity change
- Keyboard-operable end to end, in visual order
- No horizontal scrolling at 320 px
- Responsive two-column → tab layout

---

## How the Two Sections Are Handled on a Narrow Screen

### The problem

On a wide screen, **Ingredients** and **Method** sit side by side in a two-column grid — both are visible simultaneously and neither requires the user to scroll past the other to reach content they need.

On a screen narrower than 641 px, a two-column layout would either overflow (causing horizontal scroll) or stack — and a stacked layout forces the user to scroll a long ingredient list before reaching the method, then scroll all the way back when they need a quantity again.

### The solution — a tab / section-toggle

Below the servings control, two tab buttons appear:

```
┌──────────────┬──────────────┐
│ Ingredients  │    Method    │
└──────────────┴──────────────┘
```

Only one panel is visible at a time. Both sections are always one tap or keypress away — no scrolling between them is needed. The active panel is shown immediately below the tabs.

### Implementation details

- The tab bar uses correct ARIA roles: `role="tablist"`, `role="tab"`, `role="tabpanel"`.
- Arrow keys (`←` / `→`) navigate between tabs within the tablist; `Tab` moves focus into the active panel.
- The inactive panel receives the `hidden` attribute on narrow screens, which removes it from both the visual render and the accessibility tree.
- On wide screens (`≥ 641 px`) both panels are always rendered via CSS (`display: block !important`); the tab bar is `display: none` and the `hidden` attribute is cleared by a `matchMedia` resize handler.
- This means the DOM source order (Ingredients → Method) matches visual order on every screen size, so the keyboard Tab sequence is always correct.

---

## Accessibility checklist

| Criterion | Implementation |
|-----------|---------------|
| Keyboard operable end to end | All interactive elements are native `<button>` or `<input type="number">`. Tab order follows source order which matches visual order. |
| Visible focus on every interactive element | `:focus-visible` outline (3 px solid, high-contrast amber) is applied globally. Removed only for pointer users via the `focus-visible` pseudo-class (not `:focus`). |
| No horizontal scrolling at 320 px | `box-sizing: border-box` everywhere, fluid `clamp()` typography, no fixed-width containers wider than viewport, `width: 100%` on all panels. |
| Quantity changes announced to AT | A single `role="status" aria-live="polite"` region receives `"Quantities updated for N servings."` on every change (with a 50 ms debounce/clear cycle to guarantee re-announcement). Each `<span>` holding a quantity also carries an updated `aria-label` for users navigating by element. |
| Narrow-screen usability without scrolling | Tab/section-toggle pattern — see above. |

---

## Running locally

Open `index.html` directly in any browser — no build step or server required.

```sh
# macOS / Linux
open index.html

# Windows
start index.html
```

---

## File structure

```
recipe-app/
├── index.html   # All markup, styles, and script in one file
└── README.md    # This file
```
