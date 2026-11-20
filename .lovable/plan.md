# Space & Culture — plan of action

## Recommendation (a hybrid of your two ideas)
Keep one site, one cart, one profile, one search — but give it two "worlds":

- **Space** — today's calm lifestyle range (lamps, vases, planters, desk essentials, organisers, decor).
- **Culture** — the Gen Z / collectible range (figurines, anime/movie pieces, quirky desk caddies, statement pieces), with pop blue and pop orange on the same cream/dark base.

Why the hybrid: Idea 2 (a toggle above the logo that swaps the whole site) looks great but hides half the shop from people who don't notice the toggle, and splits search, cart and wishlist mentally. Idea 1 alone is simpler but makes Culture feel like just another filter. So:

1. A **small Space | Culture switch** sits in the top bar (above/next to the logo, like Myntra/Nike sub-brands). It changes which world's shop and landing you see, and remembers your choice.
2. The **Products menu** shows just two big image tiles: Space and Culture (with 3–4 swipeable product previews each).
3. Navigation stays as is: Products, About, Partnership, Custom, search, wishlist, cart, profile. On the Culture side, **Custom is hidden**; Partnership stays.
4. Cart, wishlist, profile, orders and search are **shared** across both worlds (search results show a small Space/Culture tag).

## New pages
- `/space` — Space landing: cover, featured Space edit, spaces gallery ("objects that shape everyday living").
- `/culture` — Culture landing in pop colours: cover, featured Culture drops, setups gallery (desk setups, rooms, shelves).
- `/products` — still one catalogue, with a Space / Culture switch at the top; categories and filters change per world. Featured collection stays as a filter here.
- Old links (`/products?category=...`) keep working.

## New homepage = the studio page
Top to bottom:
1. **Full-screen cover carousel** — 3 (or more) full-width photos, swipe left/right, CMS-editable, each with a short line and button.
2. **Choose your world** — two large side-by-side panels: Space (left), Culture (right), with photos; replaces "Shop by Category".
3. **Studio projects** — swipeable rail replacing "The Edit": e.g. 1:2 scale F1 car, in-store custom lighting, mascot build. Each with photo or video, title, one-liner.
4. **How we make** — Listen, Brief, 3D model, Slice, Print, Post-process (6 short steps, editable). Also shown on About.
5. **From fidget to sculpture** — swipeable range of project scales with images/videos and short insights.
6. **Living with our objects** — Space room shots and Culture setup shots side by side.
7. Instagram strip (unchanged).

## Admin / CMS
- Products get a **World** field (Space or Culture); categories belong to a world. Existing products become Space.
- New editable sections: cover slides, world panels, studio projects (photo/video upload), process steps, scale range, setups gallery, Space and Culture landing content.
- Culture categories to start: Collectibles & Figurines, Quirky Desk, Organisers, Statement Pieces (editable).

## Look for Culture
Same fonts and layout system; pop blue and pop orange accents, bolder tags and stickers, slightly playful card hover. Space keeps today's calm look.

## Build order
1. World field on products/categories + Culture colour theme.
2. Products menu tiles, top Space/Culture switch, catalogue world switch, hide Custom on Culture.
3. `/space` and `/culture` landing pages.
4. New studio homepage sections + CMS editors (including video upload).
5. Process + scale sections on About.
6. Sample Culture products/photos (placeholders until you upload real ones), tests, desktop + phone checks.

## Technical details
- Add `world text check in ('space','culture') default 'space'` to products and categories; root `siteQuery` exposes it; catalog filtering helpers in `src/lib/catalog.ts` with tests.
- World preference stored in localStorage, read after hydration; `?world=` search param on `/products`.
- Culture theme via a `[data-world="culture"]` token scope in `src/styles.css` (no hard-coded colours).
- New `site_content` keys: `space`, `culture`, extended `home` (slides, worlds, projects, process, scales, setups); videos stored in private `cms-media`, served through the existing media route.
