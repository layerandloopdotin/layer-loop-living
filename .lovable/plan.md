# Customer accounts, profile and orders

## What customers get

**Sign in page (`/account/login`)**
- Mobile number + OTP code
- Continue with Google, Continue with Apple (official button styles)
- Email + password sign up / sign in, with forgot password
- "Continue as guest" — returns to shopping; cart and wishlist keep working on the device

**Profile (`/account`)** — header person icon opens it (or login when signed out)
- Name, phone, email, gender (optional), profile photo (optional)
- Default avatar: pick from 8 cute anime-style animal avatars (fox, cat, panda, bunny, owl, red panda, penguin, shiba) made to match the dark/cream theme
- Saved addresses: add, edit, delete, set default (name, phone, address lines, city, state, PIN)
- Saved payment methods: shows only methods saved during a past payment (e.g. "Visa •••• 4242", "UPI name@okbank"); otherwise "No saved payment methods". Remove option only.
- Side menu: Profile, My Orders, Wishlist (existing page), Addresses, Payments, Logout

**My Orders (`/account/orders`)**
- Tabs: All, Live, Cancelled, Replaced, Returns
- Each card: order ID, date, items, total, status chip

**Order page (`/account/orders/$id`)**
- Item preview, order ID, order confirmation summary, address, payment summary
- Status timeline: In production → Quality check → Dispatched → Out for delivery → Delivered (or Cancelled / Replaced / Return states)
- Tracking: courier, AWB number, live scan history from Shiprocket, link to Shiprocket tracking page
- Download invoice (printable PDF-style page)

**CMS (`/admin`)**
- New Orders section: view orders, update status, add AWB/courier, mark cancel/replace/return, upload invoice
- Shiprocket: once an AWB is set, tracking auto-refreshes from Shiprocket

## Important notes
- There is no checkout yet, so orders will appear only when created in the CMS (or by a future payment integration). I can add a few demo orders on your account for preview.
- Saved cards/UPI are never stored by us — only the masked label returned by a payment provider, once one (e.g. Razorpay) is connected. Until then the section shows empty.
- Mobile OTP needs an SMS provider account (e.g. Twilio or MSG91 via Twilio-compatible setup); I'll ask for its keys when building. Google and Apple work without setup.
- Shiprocket tracking needs your Shiprocket API user email and password; I'll request them securely.
- Customer accounts will never get CMS access; the admin stays a separate role.

## Technical details
- Enable email auth, Google + Apple via configure_social_auth; phone auth via configure_auth with Twilio secrets.
- Update the signup trigger: customers get a `profiles` row; admin role is never auto-granted to new signups after the first admin (verify current trigger and the existing signup block, re-enable signups for customers).
- Tables (all RLS to `auth.uid()`, admin read/write via `has_role`): `profiles` (name, phone, gender, avatar_ref), `addresses`, `saved_payment_methods` (provider, type, label, last4/vpa masked, provider token ref — insert only server-side), `orders` (user_id, number, status, items jsonb, totals, address snapshot, courier, awb, invoice_ref), `order_events` (status history).
- Avatar uploads to a private `avatars` bucket, served via the existing media route pattern; default avatars are bundled assets.
- Routes under `_authenticated/account*`; login at public `/account/login`; existing `/auth` stays for admin.
- Server function `getShiprocketTracking` (auth + ownership check) calls Shiprocket API with token cached in a table; tracking API by AWB.
- Order status/tab rules in `src/lib/orders.ts` with tests; form schemas in `src/lib`.
- Header account icon reflects session state; logout clears queries and replaces history.
