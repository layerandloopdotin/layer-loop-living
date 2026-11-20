# Header menus, search, lamp on/off photos, and the Play / Living split

## Part A — Build now

### 1. Cleaner top menu
- Remove "Home" (the logo already goes home) and "Contact Us" from the top menu.
- Contact Us stays in the footer, adds to the profile menu, and stays in the mobile burger menu near the bottom.
- Menu: Products · Trade · Custom, then the icons for search, wishlist, cart and profile.

### 2. Dropdowns when you hover (desktop)
- **Products**: a row of category shortcuts with a swipeable strip of product photos (with names and prices) below it, plus "View all".
- **Profile**: signed in, it shows My orders, My designs, Wishlist, Addresses, Payments, Profile, Contact us and Log out. Signed out, it shows Sign in / Create account and Continue as guest.
- **Cart**: up to 3 items with photo, name, engraving note, quantity and price, plus the subtotal and "View cart" / "Checkout". Shows an empty-cart message when there's nothing in it.
- **Wishlist**: saved items with photos and a quick "Add to cart".
- The dropdowns open after a short pause and close when the pointer leaves. Clicking the icon still opens the full page. Phones keep tapping straight to the page.

### 3. Search icon that slides open
- Clicking the search icon makes the bar grow left over the space between Custom and the icons. Esc or clicking outside closes it.
- Live results as you type: matching categories (Lighting, Vases…), spaces and product names, with thumbnails. Enter opens the shop already filtered by the search.
- On phones the search opens as a full-width bar under the header.

### 4. Lights on / off on lighting products
- In the admin product editor, each gallery photo can be marked **Lights off** or **Lights on**.
- On the product page, a **Lights on / off** switch appears only if the product has at least one "lights on" photo. Flipping it fades the gallery to the matching photos instantly, without reloading the page. Off is the default.
- Colour and variant photos keep working the same way.

## Part B — Play and Living: options to choose from

Proposed names: **Layer & Loop Living** (the elegant lamps, vases and sculptural decor) and **Layer & Loop Play** (the poppy Gen Z desk toys, tumblers, F1 tyre stacks, puffer-style pieces). Other naming ideas: "Living / Play", "Studio / Playground", "Calm / Loud".

**Option 1 — One site with a Play/Living switch (recommended)**
A small two-way switch in the header, like Myntra's Men/Women. One cart, one account and one checkout. The switch changes the homepage, colours and type style, and the products shown. Living keeps today's dark and cream look; Play gets brighter colours, rounder shapes and more lively motion. Search and the cart cover both.

**Option 2 — Two separate sections on one site**
Living is the main site. Play lives at /play with its own homepage, menu and look, linked from a tile on the homepage and from the Products menu. It's simpler to build, but Play feels like a sub-brand.

**Option 3 — Two separate websites**
Separate addresses (for example layerandloop.in and play.layerandloop.in) with separate looks, which can still share accounts and products. This gives the strongest brand split, but it's the most work, and shoppers can't mix both in one order easily.

Whichever option you pick: each product is tagged Play or Living in the admin panel, and the categories differ by side (Play gets Desk Accessories, Drinkware, Collectibles, Wearables-style pieces and similar). This part needs your choice before I build it.

## Technical notes
- New header pieces go in `src/components/site.tsx` (or split into `src/components/header/*`). Nav items stay CMS-editable; the Home and Contact entries are removed from the default `nav` and the stored site settings.
- Search is filtered on the client from the already-loaded `siteQuery` products, categories and spaces, so there's no new endpoint. `/products` accepts a `q` search param.
- Gallery images gain an optional `lighting: "off" | "on"` tag inside the product JSON. The read helper defaults old images to "off". A small helper in `src/lib` gets a test.
- Hover menus use Radix HoverCard/NavigationMenu with semantic tokens only.
