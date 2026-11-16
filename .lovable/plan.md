# Admin dashboard, custom-order quotes, live coupons and reviews

Already built this session (account, orders, checkout, product page updates) stays as is.

## Admin dashboard (`/admin`)
- Tabs: **Revenue** (today / 7 / 30 days, total and per-day chart), **Orders** (counts by status, latest orders), **Sales analytics** (top products, category split, average order value, cancel/return rate).
- **Orders** page: search and filter by status; open any order; buttons to Confirm, Cancel, and update status / courier / AWB / invoice / note (current editor extended).

## New-order alerts
- Dashboard shows a **New orders** list (unconfirmed orders and new custom requests) at the top.
- A bell in the admin sidebar with an unread count, updating live while the admin is open, plus a sound/toast when an order arrives.
- **Email** to the shop inbox for every new order and custom request (needs your sending domain, e.g. layerandloop.in, set up once).
- **WhatsApp** message to the shop's number for every new order (needs your WhatsApp Business number connected once).
- Admin settings to choose which alerts are on and which email/number receive them.

## Personalised orders
- On the Custom page, add a **"Request this design"** button next to the estimate. It saves the full design (shape, modules, lighting, colour, size, photos/sketch) plus contact details; signed-in customers also see it under **My orders → Custom requests**.
- New admin page **Custom orders**: preview the design settings, see the estimate, enter the exact quoted price and a note, then **Send quote**. Status: Requested → Quoted → Accepted → In production (becomes a normal order) or Declined.
- Customer sees the quote on their account and can **Accept quote**, which creates the order at the quoted price. Guests get the quote by WhatsApp/email from the team.

## Coupons
- New admin page **Coupons**: code, % or fixed amount, minimum order, start/end date, usage limit, active on/off.
- Cart and checkout accept only live coupons from this list; the current hard-coded coupons are removed.

## Reviews
- In the account, each delivered order item gets **Rate & review**: 1–5 stars, comment, up to 4 photos.
- Product page shows a subtle line under the title (e.g. 4.6 ★ · 12 reviews) and a quiet reviews section at the bottom with photos.
- Admin **Reviews** page: approve, hide or delete. Only approved reviews show publicly.

## Notes
- Real online payment still needs a payment provider connected; until then "Pay now" ends on the WhatsApp hand-off page.
- Only customers with a delivered order for that product can review it.

## Technical details
- Dashboard numbers computed from `orders` (admin RLS) in the browser; lightweight chart using recharts (already in shadcn chart component).
- Tables: `custom_requests` (user_id nullable, contact jsonb, design jsonb, estimate, quote, quote_note, status); anon/auth insert with status locked to `requested`; owner read; owner may update only `status` from quoted → accepted via a SECURITY DEFINER `accept_custom_quote(id)` function that also creates the order.
- `coupons` table, admin-managed; public validation through a SECURITY DEFINER `check_coupon(code, subtotal)` returning discount only (no coupon list exposed). Coupon rules in `src/lib/pricing.ts` with tests.
- `reviews` table (product_id, user_id, order_id, rating 1–5, comment, images text[], status pending/approved/hidden); insert allowed only when the user owns a delivered order containing the product (trigger check); public reads only approved. Photos in a private `review-media` bucket served via the existing media route pattern.
- `admin_notifications` table (kind, ref id, title, read_at), filled by triggers on `orders` and `custom_requests` inserts; admin-only RLS; live updates via realtime.
- Email via Lovable app emails (one fixed "new order" template to the configured shop address); WhatsApp via the WhatsApp Business connector, sent from a server route called by a database webhook on new orders, with sends logged.
- Test rating average, coupon validity (dates, minimum, limit) and quote acceptance rules.
