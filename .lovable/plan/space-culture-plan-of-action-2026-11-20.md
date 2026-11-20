# Space & Culture — plan of action

## What "hybrid" means
Idea 1 (pick Space or Culture from the Products menu and the homepage) + Idea 2 (a small Space | Culture switch above the logo). Some things are shared and some change with the world you're in:

- **Shared (never changes):** logo, search, wishlist, cart, profile, orders, checkout, About, Partnership, Contact. One account, one cart, even if you buy from both worlds.
- **Switches with the world:** colours, Products menu, catalogue categories, landing page, featured edit. Custom only shows in Space.

So shoppers never feel like they've left the site. It just changes mood.

## How each world looks
**Space (today's look, refined)**
- Cream background, deep ink text, warm brass accent. Plenty of space, slow fades, calm image zoom on hover.
- Photos: rooms, soft daylight, lamps glowing at dusk.

**Culture (pop world)**
- Same cream/ink base and fonts, so it's still clearly Layer & Loop.
- Accents: pop electric blue and pop orange, used for tags, buttons, outlines and stickers such as "Drop 03" or "Limited".
- Livelier feel: cards tilt slightly on hover, label strips run across the screen, chunkier rounded tags.
- Photos: desk setups, shelves, figurines, bright backdrops.

**Top switch:** a small pill above the logo reading `SPACE | CULTURE`. The active side fills (ink for Space, blue for Culture), and the site colours change smoothly in about 0.4s.

## Homepage (studio page)
1. **Full-screen cover, 3 swipeable slides**
   - Slide 1: a Space hero shot.
   - **Slide 2 (centre, the hook): "Two worlds."** The screen is split down the middle, with a Space room on one side and a Culture desk setup on the other. Moving the cursor (or dragging a finger on phones) pushes the dividing line, so one world grows as the other shrinks. Each side has a small label and button: "Enter Space" and "Enter Culture". Clicking a side opens that world. On phones, the line follows your finger and you tap a side to enter.
   - Slide 3: a studio project shot, like the F1 car.
   - The site opens on slide 2 so visitors find out about both worlds straight away.
2. **Choose your world:** two large photo panels side by side, Space on the left and Culture on the right (stacked on phones). This replaces "Shop by Category".
3. **Studio projects:** a swipeable row of photo/video cards (1:2 F1 car, in-store custom lighting, mascot). This replaces "The Edit".
4. **Design process (one combined section):** a swipeable row of steps (Listen, Brief, 3D model, Slice, Print, Post-process). Each card has a photo or video and a short insight, and the step cards also show the scale range "from a fidget to a sculpture". The same section also appears on About.
5. **Living with our objects:** Space room photos and Culture setup photos.
6. Instagram strip.

## Products menu (hover)
Two large tiles, Space and Culture, each with 3–4 swipeable product photos and links to its categories. Clicking a tile opens that world's catalogue.

## Catalogue (/products)
- A Space | Culture tab sits at the top, matching the top switch.
- Space categories: Lighting, Vases & Planters, Desk Essentials, Organisers, Decor, Featured.
- Culture categories: Collectibles & Figurines, Quirky Desk, Organisers, Statement Pieces, Featured.
- Filters, grid size and the light switch (Space Lighting only) work the same as today. Culture cards get pop tags.

## Product page
The layout stays the same. Culture products use pop accents for the price tag, Add to cart button and badges. A small "Space" or "Culture" label next to the breadcrumb links back to that world. Engraving, sharing and reviews stay as they are.

## World landings (/space, /culture)
Each has its own cover, featured edit, category tiles and setups gallery. Culture adds a "Drops" row for limited releases.

## User journeys
```text
A) Lifestyle buyer
Home -> slide 2, drags toward Space -> clicks "Enter Space"
 -> /space landing -> Lighting tile -> catalogue (Space, Lighting)
 -> flips light switch -> opens Terra lamp -> adds engraving -> cart -> checkout

B) Gen Z collector
Home -> drags toward Culture, colours turn pop blue/orange -> "Enter Culture"
 -> /culture -> Drops row -> figurine page -> wishlist heart
 -> later: Profile > Wishlist -> add to cart -> checkout

C) Mixed cart
In Culture, searches "lamp" -> result tagged "Space" -> opens it
 -> cart shows items from both worlds together -> one checkout

D) Custom / B2B
Space -> Custom (not shown in Culture) -> sandbox -> request design
Either world -> Partnership -> catalogue request form
```

## Admin
- Every product and category gets a World setting (Space or Culture). Existing items are set to Space.
- Editable sections: cover slides (including the two-worlds slide photos), world panels, studio projects (photo/video), design process steps, setups gallery, and the Space/Culture landing pages.

## Build order
1. World setting on products and categories, plus the Culture colour scheme.
2. Top switch, Products menu tiles, catalogue tabs, and hiding Custom in Culture.
3. Homepage: cover with the two-worlds slide, world panels, studio projects, design process, living gallery.
4. /space and /culture landing pages; Design process on About.
5. Sample Culture products and photos as placeholders until you upload real ones.
6. Create a test customer and walk through journeys A–D in the preview on desktop and phone, with screenshots shared in chat.

## Technical details
- `world` column (`space` | `culture`, default `space`) on products and categories; exposed through `siteQuery`; filtering helpers in `src/lib/catalog.ts` with tests.
- World preference stored in localStorage, read after hydration; `?world=` on `/products`.
- `[data-world="culture"]` token scope in `src/styles.css`; no hard-coded colours.
- Two-worlds slide uses a clip-path split driven by pointer position (respects reduced motion).
- New `site_content` keys `space` and `culture`, plus an extended `home`; videos stored in private `cms-media` and served through the existing media route.
