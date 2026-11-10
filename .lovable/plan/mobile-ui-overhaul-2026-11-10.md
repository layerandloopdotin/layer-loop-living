# Mobile UI overhaul

Desktop stays exactly as it is. Everything below only applies to phone-sized screens (under ~768px).

## 1. Header + burger menu (all pages)
- One clean row: logo (single line, never wraps) on the left; favourites, cart and a burger icon on the right.
- The "Contact us" pill is hidden on mobile and moved inside the menu.
- Burger opens a full-height dark slide-in panel listing every page from the CMS navigation (Home, Products, About, Trade, Contact), plus large Contact / WhatsApp actions and social links. Closes on link tap, on the X, or by swiping/tapping outside.

## 2. Homepage
- **Cover**: title, then one big product image. The three thumbnails + arrows are removed on mobile; instead the cover image itself swipes left/right between the hero products, with small dots underneath. Badges and price bar stay on the image but sized for small screens.
- **The Edit**: the three featured products sit side by side in a horizontal swipe row (about 1.3 cards visible so it's clear there's more), snapping card to card — no more stacking.
- **Shop by Category**: compact swipe row of tiles with the title under each image, "Browse all" placed next to the heading so it's always reachable.
- Tighter spacing and smaller headings across all homepage sections so the page feels shorter and more intentional.

## 3. All Objects (products page)
- Filters collapse into a single "Filter" button bar at the top (shows active filter count). Tapping opens a bottom sheet with Category, Space and Featured options and an "Apply / Clear" footer. The products are the first thing seen.
- Products shown as a grid with a grid-size toggle icon next to the Filter button: **2 per row** (default) or **1 large per row**. Choice is remembered.
- Scroll effect: as you scroll, the product nearest the middle of the screen gently scales up and stays sharp while the others shrink slightly and soften — the mobile equivalent of the desktop hover blur. A tiny phone vibration pulse fires when a new product comes into focus (on phones that support it; iPhones ignore vibration, so they get the visual effect only).

## 4. Product page
- On mobile the gallery becomes a vertical stack: all product images one after another, full width, followed by name, price, colours, variants, Buy Now etc. Desktop gallery unchanged.

## 5. Quick pass on other pages
- Check About, Trade, Contact, Cart, Wishlist at phone width and fix any wrapping, oversized text or overflow found.

## Technical details
- `src/components/site.tsx`: SiteHeader gets a mobile row + Sheet (shadcn `sheet`) menu; Logo gets `whitespace-nowrap`/truncate.
- `src/routes/index.tsx`: hero uses a CSS scroll-snap track on mobile (`md:hidden`) with an IntersectionObserver for the active dot; Edit and Category use `flex overflow-x-auto snap-x` below `md`, existing grid at `md+`.
- `src/routes/products.tsx`: sidebar `hidden md:block`; mobile filter bar + bottom Sheet reusing the same filter state; grid density in localStorage (read in effect); focus effect via IntersectionObserver with a centre rootMargin, toggling a data attribute for scale/blur; `navigator.vibrate?.(8)` on focus change.
- `src/components/product-gallery.tsx`: render a stacked list `md:hidden`, existing carousel `hidden md:block`.
- Verify with Playwright at 390x844 on home, products, a product page and the menu.
