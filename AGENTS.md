<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Format every product price through the shared currency formatter so the homepage and catalog always use the same currency presentation.
- Keep each form's zod schema in a browser-safe module under `src/lib` and read submitted values through `fieldValue`, so a select left on its disabled placeholder still shows the friendly message and the rules stay testable.
- Site text and photos live in the `site_content` table (one JSON document per key); `src/lib/cms-schema.ts` holds each key's admin fields and default content, and pages read it via `useContent(key)` — add new editable copy there, never as hard-coded page text, so it stays editable.
- Products, categories and spaces come only from the database through the root `siteQuery` loader; never reintroduce a static product list, or admin edits stop showing.
- Image values are references resolved by `img()` in `src/lib/media.ts` (`asset:` bundled, `media:` uploaded); uploads go to the private `cms-media` bucket and are served by `/api/public/media/*` because public buckets are blocked in this workspace.
- The shared Logo reads its display mode and media reference from site settings so header and footer stay consistent; uploaded media responses carry sandbox CSP and nosniff to prevent active SVG content executing on the app origin.
- Admin writes go straight from the browser client and are protected by admin-only RLS via `has_role`; the first account ever created becomes admin through a database trigger.
- Product inventory lives in a separate admin-only table and is queried only by CMS editors, never by public site loaders, to keep stock counts private.
- Product galleries share one selected-photo view with scrollable thumbnails across screen sizes, so mobile and desktop retain the same photo navigation.
- Use the shared centered rail for featured objects, categories and materials on every screen size; responsive item and edge widths keep both directions reachable.
- Catalog density controls apply at every breakpoint; the compact three-column view must not blur sibling products.
- Custom page 3D (three/R3F) lives in `src/components/custom/studio-3d.tsx`, loaded only via `React.lazy` behind `<ClientOnly>`; sandbox rules/estimates stay in `src/lib/custom.ts` so they are testable and SSR-safe.
- Customer brief uploads go to the private `custom-briefs` bucket (anon insert under `briefs/`, admin-only read via signed URLs) so customer files are never public.
- Photo-to-3D object mode calls the AI gateway only from the `analyzeObjectPhoto` server function, which returns simple primitive parts validated by `photoObjectSchema` in `src/lib/custom.ts`, so the key stays server-side and the browser just renders parts.
- Customer accounts live under `src/routes/_authenticated/account*` (sign-in at `/signin`, admin sign-in stays at `/auth`); order status/tab rules live in `src/lib/account.ts` so they stay testable.
- Orders are created only by admins or the `accept_custom_quote` database function, never directly by customers, so prices can't be tampered with.
- Coupons are validated only by the `check_coupon` database function; `evaluateCoupon` in `src/lib/pricing.ts` mirrors it for tests/previews.
- Review photos are private and served by `/api/public/review-media/*` only for approved reviews.
- New orders/requests create `admin_notifications` rows via triggers; `notifyNewRequest` sends external alerts once per row within 15 minutes.

- Separate admin username/password login is reset only from /admin/login by a signed-in admin via a server function (service role), with rules in src/lib/admin-login.ts; never seed or hard-code a default password.
