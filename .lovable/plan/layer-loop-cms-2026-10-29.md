# Layer & Loop CMS

A private admin area at `/admin` where you sign in and edit everything on the site. The site keeps its current design, but its text and photos come from the CMS instead of being written into the code.

## 1. Sign-in and access
- Admin sign-in with email and password. Only accounts you mark as admin can open `/admin`.
- Shoppers never see the admin area.

## 2. Site settings (used everywhere)
- Navigation labels: rename Home, Products, About, Trade, Contact us (for example, "Products" to "Collection"). You can also reorder them and hide or show them.
- Brand: logo text and the footer description.
- Contact: email, phone numbers, WhatsApp number, studio and store address, opening hours, map link.
- Socials: Instagram, Pinterest, LinkedIn and any extra profiles (add, remove or reorder).
- Footer link groups and their labels.

## 3. Page editors
Each page gets a form where every heading, paragraph, button label and placeholder photo can be edited. Photos are uploaded straight from your computer.
- **Homepage:** cover headline and copy, the three keywords, image badges, cover slides (pick products), The Edit heading and subtitle (filled automatically with products marked Featured), Shop by Category heading and tiles (title, photo, linked category), "Objects That Shape Everyday Living" text and photo, Browse All button label.
- **About:** all text and photos. The retail store gallery allows any number of photos, with drag to reorder.
- **Trade:** hero text, every partner panel (Interiors & Architects and the others: title, description, photo; add, remove or reorder), contact block text, and the catalogue form options.
- **Contact us:** all text, store photo and the careers form copy.
- **Instagram strip:** handle, profile link and the grid photos.
- **Legal pages:** Terms & Conditions and Returns, Replacement & Refunds, edited in a simple text editor with headings and lists.

## 4. Products
- Product list with search, filters and drag to reorder. Actions: add, edit, duplicate, hide or show, delete.
- Product fields:
  - Name, tagline (for example "Layered sculptural table lamp"), short description, long description ("About the product") and Care & wear text.
  - Price and an optional compare-at price.
  - Featured on/off. Featured products appear in The Edit on the homepage.
  - Categories: choose one or more.
  - Spaces: choose several (The Lounge, The Café and so on).
  - Specifications: dimensions, weight, material, bulb, cable, plus any extra rows you want to add.
  - Colours: add as many as you need, each with a name and a hex code shown as a swatch. **Each colour has its own unlimited photo set**, so clicking a swatch on the product page switches the gallery to that colour.
  - Shared photos that show for every colour.
- **Categories and spaces manager:** create, rename, reorder or delete them. The shop filters, the footer links and the homepage tiles update to match.

## 5. Forms and submissions
- Trade enquiries, catalogue requests and job applications are saved and appear in an **Inbox** in the admin area. You can filter them, mark them as read or replied, and export them to a spreadsheet file.
- **WhatsApp:**
  - Every enquiry gets a "Reply on WhatsApp" button.
  - The site gets a floating "Chat on WhatsApp" button for shoppers.
  - Automatic WhatsApp alerts for every new form submission need a WhatsApp Business account, which Meta must approve. I'll set that up as an optional step once your account is ready.
- Optional email notice for each submission can be added later.

## 6. Instagram and LinkedIn
- First version: you add the profile links and choose which photos appear in the Instagram strip.
- Later, optional: the strip pulls your latest Instagram posts automatically. This needs your Instagram Business account connected.

## 7. Not in this phase
- Orders and payments. These come with Razorpay or Stripe, and the cart stays as it is until then.
- Revision history, so the CMS saves the latest version of each edit only.

## Build order
1. Turn on Lovable Cloud, then add admin sign-in and photo storage.
2. Products, categories, spaces and colours. Move the current products into the CMS so nothing is lost.
3. Site settings, navigation, socials and footer.
4. Page editors: Homepage, About, Trade, Contact, Instagram strip and legal pages.
5. Inbox and WhatsApp buttons.
6. Optional: WhatsApp alerts and Instagram auto-feed.

## Technical details
- Lovable Cloud tables: `site_settings` (single row, JSON), `pages` (one row per page key, JSON content checked by zod schemas in `src/lib`), `categories`, `spaces`, `products`, `product_categories`, `product_spaces`, `product_colors` (name, hex, sort), `product_images` (color_id nullable, sort), `submissions` (type, payload, status), and `user_roles` with `has_role()`.
- Public reads use narrow anon SELECT policies on published rows. All writes and the submissions read are limited to admins.
- One public `cms-media` storage bucket. Uploads are admin-only.
- The public site reads content through server functions that use route loaders and react-query. Current hard-coded values become defaults, so pages still render if a field is empty. Prices keep using the shared INR formatter.
- Admin routes live under `_authenticated/admin/*`, with an admin role check.
- Each form's zod schema stays in `src/lib`, with `fieldValue`. Submissions are written by a server function.
- Seed migration with the existing products, categories, spaces and page text.
