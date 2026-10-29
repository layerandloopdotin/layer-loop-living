# Products page: new filters, sticky sidebar, hover zoom

## What changes
1. **Categories** — All Products, Lighting, Vases & Planters, Collectibles, Desk Essentials, Others. "Others" starts empty (shows "No objects match") until real products are added; I'll add one placeholder item so it isn't blank.
2. **Material filter removed → Spaces filter** — Living Room, Dining, Bedroom, Office, Cafe, Restaurant. Each product gets tagged with one or more spaces (my best guess per item, e.g. pendant → Dining/Restaurant/Cafe, brass task lamp → Office). You can correct the tags later.
3. **One continuous scroll** — all matching products in a single list, no pagination, whatever filter is active. Filter changes fade the grid in smoothly instead of jumping.
4. **Sticky filter column** — on desktop the left Filters panel stays in place while the product images scroll past; the page background scrolls normally. On phones filters stay above the grid.
5. **Hover zoom** — product photo gently scales up (~5%) inside its frame on hover, with a smooth ease; card shape stays fixed.
6. Smooth page scrolling enabled site-wide.

## Technical details
- `src/lib/products.ts`: add "Others" to `Category`; replace `Material` usage in filters with `Space` type + `spaces: Space[]` on each product; export `spaces`.
- `src/routes/products.tsx`: swap material state for spaces state (match if product has any selected space); `aside` gets `md:sticky md:top-24 md:self-start`; update intro copy to cover all object types.
- `ProductCard` in `src/components/site.tsx`: image wrapper `overflow-hidden`, img `transition-transform duration-500 group-hover:scale-105`.
- `src/styles.css`: `html { scroll-behavior: smooth }`.
- Homepage category tiles keep working (same category names).
