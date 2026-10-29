# About page: rewrite around 3D printing, add retail store and trade callout

The page layout and look stay the same. The words and photos change to tell the 3D printing story, and three new sections go at the bottom.

## Sections (top to bottom)
1. **Dark header (kept)** — "Our Story" / "Layer. Loop. Form." (a nod to how prints are built up layer by layer).
2. **Story + photo (kept, rewritten)** — Headline: "We believe objects should be designed, not just manufactured." Placeholder story: Layer & Loop started in 2022 as a small print studio with a few machines. Every piece is designed in-house and printed to order, layer by layer, so there is little waste and no warehouse full of stock. New photo: a 3D printer printing a lamp shade in warm studio light.
3. **Material cards (kept, rewritten)** — "Materials We Print With":
   - **PLA** — plant-based, matte finish, non-toxic; used for lamps, vases and collectibles.
   - **PETG** — tough and water-safe; used for planters and everyday objects.
   - **TPU** — soft and flexible; used for grips, feet and desk essentials.
   Each card gets a new close-up photo of printed texture.
4. **What we believe (new)** — three short points in one row: Made to order, Designed in-house, Non-toxic and recyclable materials.
5. **Wide atmosphere photo (kept)** — "Designed for Atmosphere", with the current study image.
6. **Our Retail Store (new)** — a short note on why we opened a shop: so people can touch the textures, see the lamps lit in person and watch a printer at work. Two or three store photos (warm dark interior, shelves of printed objects, a printer running in the window). Placeholder address and opening hours line.
7. **Trade callout (new, dark band)** — "For Studios, Cafés & Retailers": we take B2B and bulk orders and custom prints. A button links to the existing Trade page.

## Placeholder content
The story, store address, opening hours and store photos are all invented and generated for now. Please send the real details and photos when you have them.

## Technical details
- Only `src/routes/about.tsx` changes, plus new generated images in `src/assets/` (a print studio hero, 3 material textures, 3 store photos) in the brand's warm, dark palette.
- Update `head()` meta to describe the 3D printed lifestyle brand.
- The trade callout uses `Link to="/trade"` with the existing outline-pill button style.
