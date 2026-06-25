# Design Document: Mobile Friendliness & Logo Tweak for kranua.com

This document specifies the design details for making the Kyiv Crane Pro (kranua.com) website mobile friendly and slightly increasing the crane icon on the logo.

## 1. Background & Goals
The current website has issues on mobile screens, such as overlapping header items, absolute-positioned bottom tab bars on intermediate mobile widths, cards touching each other without spacing, and modals rendering off-screen due to absolute overlay coordinates. The goal is to:
- Make the header and layout fully responsive for all mobile widths (from 320px up to 767px).
- Slightly increase the crane icon on the logo as requested by the user.
- Resolve UX bugs like iOS viewport zoom, date picker styling, and map scroll trapping.
- Fix the failing tests caused by macOS metadata files.

## 2. Design Specifications

### 2.1 Logo Icon Resize
- Modify the `CraneIcon` size in the header from `24` to `30`.
- Keep vertical alignment centered with the "Kyiv Crane Pro" text.

### 2.2 Responsive Header Layout
- Hide the `geo-tag` (location selection) in the header on viewports narrower than `768px`.
- Place the `geo-tag` component at the top of the mobile side drawer navigation (burger menu) instead.
- The mobile header will contain:
  - Logo (icon resized to 30px + brand name text)
  - Quick Dial phone icon (button style)
  - Hamburger menu icon button
- Add top padding using CSS env variables for notch/status bar compatibility: `padding-top: env(safe-area-inset-top, 16px);`.

### 2.3 Bottom Tab Bar Sticky Behavior
- Update bottom tab bar styles in `index.css` under the `< 768px` media query to always use `position: fixed;` instead of `position: absolute;`.
- Increase `.page-wrapper` padding bottom on mobile to `90px` to prevent the bottom footer contents from being obscured by the fixed tab bar.
- Add safe area bottom padding to the tab bar container.

### 2.4 Spacing & Spacing Layouts
- Add a column gap of `16px` to `.cranes-grid` on mobile layout to separate the cards.
- Change reviews carousel track side navigation chevron buttons to hover/float absolute on the left (`left: -8px`) and right (`right: -8px`) of the viewport to give cards full screen width.

### 2.5 Modals & Overlays
- Update `.modal-overlay` from `position: absolute` to `position: fixed` to cover the entire screen viewport.

### 2.6 Language Tweak (Ukrainian Spelling)
- Change "Аренда" to "Оренда" everywhere.

## 3. Alternative Approaches considered
- **Option A (Chosen):** Move the Location dropdown to the burger menu on mobile. Keep the mobile header minimal and readable.
- **Option B:** Keep the Location dropdown in the header on mobile by reducing the font size of the brand name and removing icons. *Rejected because it makes the header cluttered and hard to read.*

## 4. Verification Plan
- Clear the `__MACOSX` folder and run `npm run test`.
- Manually review all page screens at 320px, 375px, 414px, and 768px width.
