# Shop by Category section on the homepage

## What you'll see
A new "Shop by Category" section placed directly above "Objects That Shape Everyday Living" (right after The Edit).

- Header row: heading "Shop by Category" on the left, a "Browse All Collections" button on the right that opens the Products page with everything shown.
- Four large image tiles, one per category: **Lighting**, **Vases & Planters**, **Collectibles**, **Desk Essentials**. Each shows a photo, the name, and an "Explore" arrow; hovering slightly zooms the photo.
- Clicking a tile opens the Products page already filtered to that category.
- Desktop: 4 tiles in a row. Mobile: 2 per row.

## Products page changes
- The category filter becomes these four: Lighting, Vases & Planters, Collectibles, Desk Essentials (current lamp types all move under Lighting).
- The page reads the chosen category from the link, so the filter is pre-ticked when arriving from a homepage tile.
- I'll add a few placeholder products for Vases & Planters, Collectibles and Desk Essentials (prices in INR) so those filters aren't empty — please send real ones later.

## Technical details
- `src/lib/products.ts`: new `Category` union, remap existing items, add ~6 placeholder items plus a `categories` list with image + slug.
- Generate 3 new category photos (vase, collectible, desk item) in the existing warm style; Lighting reuses a lamp image.
- `src/routes/products.tsx`: `validateSearch` with optional `category`; seed the filter state from it.
- `src/routes/index.tsx`: new section using `<Link to="/products" search={{ category }}>`, styled with existing design tokens.
