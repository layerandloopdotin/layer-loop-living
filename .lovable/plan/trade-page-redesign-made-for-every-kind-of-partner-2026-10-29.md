# Trade page redesign — "Made for every kind of partner"

Keeps the current dark hero, card styling, charcoal/cream/amber theme and footer. Replaces the pricing tiers and registration form.

## 1. Hero (existing dark band, new copy)
- Eyebrow: "Trade & Partnerships"
- Headline: "Built for Businesses That Build Spaces"
- One line: we 3D print in PLA, PETG, TPU, ABS and ASA for studios, retailers, brands and makers, from one-offs to bulk runs.

## 2. Who we work with (replaces the three pricing cards)
Short intro: "Whoever you are, we have something for you." Then a grid of six cards (3 x 2 on desktop, 1 column on phone), same rounded card style, each with a small line icon, a title, one line of copy and 3 short points:

1. **Design & Interior Studios / Architects** — custom fixtures, lighting and decor for projects; colour and size changes.
2. **Retailers & Concept Stores** — wholesale pricing, ready-to-shelf collections, restock support.
3. **Vendors & Resellers** — add our objects to your catalogue; white-label and dropship options.
4. **Startups & Established Businesses** — branded objects, merch and product prototypes to grow your range.
5. **Corporate Gifting** — gifts for employees, clients and retail partners; festive hampers; logo personalisation.
6. **Makers & Enthusiasts** — small-batch collaborations, limited drops, community projects.

A closing line under the grid: "Not sure where you fit? Talk to us anyway."

## 3. Get in touch (CTA band, dark)
- Heading: "Let's Make Something Together"
- Three contact blocks side by side: Email, Phone / WhatsApp, Studio address — each clickable (mail, call).
- One amber button: "Request a Catalogue" that scrolls smoothly to the form below.
- Contact details will be placeholders until you share real ones.

## 4. Catalogue request form (cream section)
Left: short copy — "Tell us what you need and we'll send the right catalogue within 2 business days."
Right: form card with:
- Full name, Company / Studio name, Email, Phone
- I am a… (dropdown: the six partner types above)
- Catalogues I want (multi-select chips): Festive, B2B / Wholesale, Retail, Corporate Gifting, Custom Projects
- Estimated quantity (dropdown: under 50, 50–200, 200–1000, 1000+)
- Message (optional)
- Submit button: "Send My Request", then a thank-you message.

Fields are checked for valid email/phone and length limits.

## Note
Like today, the form shows a thank-you but doesn't save or email submissions. If you want requests landing in your inbox or a dashboard, I can turn on Lovable Cloud for that as a next step.

## Technical
- Rewrite `src/routes/trade.tsx` only; reuse `DarkHero`, `Page`, lucide icons, zod validation; update head meta.
