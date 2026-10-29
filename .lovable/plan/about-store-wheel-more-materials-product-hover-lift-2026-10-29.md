# About store wheel, more materials, product hover lift

## About page
1. **Retail store section, taller** — the section takes roughly the full screen height. Text stays on the left, and the photos on the right get much bigger.
2. **Curved photo wheel (right side)** — the photos sit on a half-circle arc. The centre photo is the largest and sharpest, and the photos on either side tilt back and shrink along the curve. Three are fully visible at a time.
   - Scroll with the mouse wheel or trackpad over it, drag or swipe, or use small arrow buttons.
   - It loops forever, so after photo 5 comes photo 1 again.
   - It starts with 5 store photos (2 new ones generated in the same warm, dark style). Adding more later (10–15) just means adding them to a list.
   - On phones the wheel flattens into a left/right swipe strip with one large photo and its neighbours peeking in.
3. **Trade callout removed** — the "For Studios, Cafés & Retailers" band comes off the About page. Trade lives only on the Trade page.
4. **Materials: 5 cards** — PLA, PETG, TPU, plus:
   - **ABS** — strong and heat-resistant; used for lamp parts and structural pieces.
   - **ASA** — UV- and weather-resistant; used for outdoor planters and café/terrace pieces.
   The row becomes a left/right slider showing 3 cards at a time, with the same card style and new texture photos.
5. Everything else on the page stays the same.

## Products page: hover effect
- On hover, the **whole product card** (photo, name and price) gently grows (about 6–8%) and lifts above the grid with a soft shadow. The photo no longer zooms inside its own frame.
- At the same time, every other card in the grid gets a very light frosted-glass blur and dims slightly, so the hovered piece stands out.
- Smooth ease in and out. On touch devices the effect is off, so the cards don't flicker.

## Technical details
- `src/routes/about.tsx`: a new `StoreWheel` component (local to the page) built from a `store` images array. It uses an index state, and each slide's offset from the active index (wrapped modulo the array length for looping) drives `rotate`/`translate`/`scale`/`opacity` transforms along the arc. Wheel input is throttled to one step per gesture, with pointer drag and arrow buttons. Below `md` it switches to a flat translate-x layout. Delete the trade band and the unused `Link` import.
- Materials row: horizontal `snap-x` scroller, cards at `basis-1/3` on desktop with prev/next arrows. Generate `mat-abs.jpg`, `mat-asa.jpg`, `store-4.jpg` and `store-5.jpg`.
- Product hover: in the products grid, `group/grid` on the container. Cards get `[@media(hover:hover)]:hover:scale-[1.07] hover:z-10 hover:shadow-xl`, and the siblings get `group-hover/grid:blur-[2px] group-hover/grid:opacity-80`, reset with `hover:blur-0 hover:opacity-100`. Remove the inner image `group-hover:scale-105` from `ProductCard` (the homepage cards keep a neutral look).
