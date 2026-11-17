# Engraving, 2-day returns everywhere, and the real Instagram feed

## 1. Engraving — on the product page and in the custom builder
Engraving belongs where the customer is already choosing: on the product page for catalogue items, and inside the sandbox for custom builds. The custom page's "Engraving" card will scroll to the builder's engraving step.

**Catalogue product page**
- A "Personalise with engraving" toggle under colours and variants. It only appears on products you mark as engravable in admin.
- When it's on: a text box (up to 20 characters by default), a choice of 2–3 font styles, and a placement choice (front, base or back).
- A live preview of the text over the selected product photo.
- The extra engraving charge is added to the product price. Engraved items show a note that they can't be returned, only replaced if they arrive damaged.
- The engraving travels through the cart, checkout and order details, and appears in admin Orders so the studio knows what to engrave.

**Custom builder (sandbox)**
- A new "Engrave" tab with the same text, font and placement controls, previewed on the 3D model.
- Saved with the design, so it shows in My designs, in quote requests, and in the admin quote view. The charge is included in the estimate.

**Admin**
- On each product: an "Engravable" switch, an engraving price, a character limit and allowed placements.
- In Site content: the default engraving price and font list.

## 2. 2-day returns everywhere
I searched the site's code and all saved content, and every return mention already says 2 days. The 7-day wording you saw is probably on the published site, which is still running an older version. I'll still:
- Check the product page, checkout, footer, policy pages, terms and FAQs again, and fix any remaining "7-day / 7 days / week" return wording.
- Add a check that fails if a return window other than 2 days ever comes back.
- Remind you to publish so the live site picks up the change.
(Delivery times like "4–7 days" are shipping estimates, not returns, so they stay as they are.)

## 3. Instagram — @layerandloop.in, with real posts
- Change the handle and profile link everywhere (footer, socials, Instagram strips) to instagram.com/layerandloop.in, both in the code defaults and in saved content.
- Pulling posts in automatically needs Instagram's official access, which works only for a Business or Creator account linked to a Facebook page. Once you give me an access token, the homepage and About strips will show your latest posts, refreshed regularly.
- Until a token is added, the strip keeps the current photos but links correctly to @layerandloop.in.

## Technical details
- Engraving fields go in a browser-safe module in `src/lib`, with a zod schema and tests for character limit, allowed placements and price add-on. The price is checked again on the server/database when an order is created.
- New columns on products (`engravable`, `engraving_price`, `engraving_max_chars`, `engraving_placements`). Cart lines carry `engraving`; order items store it. Custom design snapshots get an optional `engraving` field, so older saved designs still open.
- The 3D sandbox adds a text decal/overlay in `studio-3d.tsx`; the 2D product preview is a CSS overlay.
- Instagram: a server function calls the Instagram Graph API (`/me/media`) using the `INSTAGRAM_ACCESS_TOKEN` secret, with cached results. Photos go through a server proxy so tokens never reach the browser.
- Migration to update the `instagram` and `settings` content records to the new handle and URL.

## 4. Photo to 3D object — remove it for now
Blender can't run inside the website, and the current tool can only guess simple shapes, so it will never match a real object closely. The plan:
- Remove the "3D object" photo mode from the Custom page. Keep Relief and Lithophane, which do turn a photo into an accurate surface.
- Visitors can still upload a reference photo with "Request this design", so your studio can model the object yourself, in Blender or any other tool.
- Optional later step: connect a dedicated photo-to-3D service such as Meshy or Tripo. This gives much closer results, but it needs a paid account and API key and takes about 1–2 minutes per model.
- Technical: remove the object mode UI and the `analyzeObjectPhoto` server function and its schema, and update its tests and the AGENTS.md rule.
