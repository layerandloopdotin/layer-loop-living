# Culture polish, shared About/Trade look, and homepage cleanup

## 1. Colour balance (Culture)
- Keep the cream/ink base. In Culture, dark sections stay near-black ink (not blue); blue becomes an accent, with orange used for tags, active chips, toggles, underlines and small hand-drawn marks.
- Shop page (Culture): orange active category chip, orange knob/track on toggles, orange sticker tags on cards, small scribble underline on the heading.
- Cart and Wishlist (Culture): orange totals/buttons highlight and scribble headings ("Saved for later" with a doodle underline). Still one cart, one wishlist, one account across both worlds.
- Product page (Culture): orange-accented toggles and buttons plus light scribble doodles around the title and section headings. Not loud.

## 2. About and Partnership: one shared look
- Both pages use the same neutral black-and-cream theme in either world, so they no longer turn blue. Same images in both worlds. About keeps its current motion/hover effects.

## 3. Header line
- Replace "Calm lighting & living objects" / "Pop collectibles…" beside the logo with "Two worlds, one identity" (editable in admin).

## 4. Homepage
- Keep only the "Two worlds, one studio" interactive slide; remove the left and right side slides.
- Keep "Choose your world".
- Studio projects: each project fills the full screen width, swipeable both left and right (arrows + drag/swipe).
- Design process: page margins on both sides; hand-drawn scribble cards (sketch lines, arrows, handwritten text) that slide left/right with the drawing animating as you swipe, instead of photos.
- "Objects that shape everyday living": one full-width image of all Space products together; swipe right to one full-width image of all Culture products. No four-photo grid.

## 5. Space page
- Restore exactly the previous homepage layout and behaviour on the Space page: same sections, rails, swiping, haptics and scrolling as before.

## 6. Culture page
- Drops: a featured rail swipeable both ways. Admin gets a "Drop" mark on any product (separate from Space "Featured"), so you choose exactly which pieces appear.
- Shop by culture: swipeable both ways and shows every Culture category you add (no limit).
- Setups with culture: swipeable both ways.
- After setups: one full-width image showcasing all Culture products (editable).
- Card hover keeps the twist; tone down image twisting so photos don't look distorted.

## 7. Product page: Frequently bought together
- Only suggests products from the same world (Culture with Culture, Space with Space).

## 8. Admin
- Categories: add, rename, reorder, set world, set photo, hide/delete (only when no products use it).
- Product editor: new "Drop" toggle for Culture.
- New editable photos: Space showcase, Culture showcase, header line.

## Technical details
- Override `--ink*` back to neutral under `html[data-world="culture"]`; add `--pop-orange` driven utilities (`scribble-underline`, sticker tag) in `src/styles.css`; About/Trade set a neutral scope (`data-world-neutral`) wrapper.
- Database: add `is_drop boolean default false` to products; categories already DB-managed, extend admin CRUD.
- `worlds.tsx`: drop `SideSlide`, rebuild `StudioProjects`/`DesignProcess`/showcase with the shared centered rail (two-way). Design process uses inline SVG strokes animated with `stroke-dashoffset` tied to scroll position.
- Space page reuses the previous homepage sections (Edit, category rail, retail carousel, Instagram) recovered from history.
- `frequentlyBought` filtered with `inWorld`; add a test asserting no cross-world items.
