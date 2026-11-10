// Every editable page in the CMS: its fields (drive the admin form) and the
// default content (what the site shows until something is saved).
// Browser-safe: no server or database imports.

export type Field =
  | { k: string; label: string; t: "select"; options: { value: string; label: string }[]; help?: string }
  | { k: string; label: string; t: "text" | "textarea" | "image" | "url" | "product" | "link" | "color"; help?: string }
  | { k: string; label: string; t: "images" | "strings"; help?: string }
  | { k: string; label: string; t: "list"; of: Field[]; item: string; help?: string };

export type Group = { title: string; fields: Field[] };

export const LINK_TARGETS = [
  { value: "/", label: "Home" },
  { value: "/products", label: "Products" },
  { value: "/about", label: "About" },
  { value: "/trade", label: "Trade" },
  { value: "/custom", label: "Custom" },
  { value: "/contactus", label: "Contact us" },
] as const;

const settings = {
  brand: "LAYER & LOOP",
  logoMode: "text",
  logoImage: "",
  nav: [
    { label: "Home", path: "/" },
    { label: "Products", path: "/products" },
    { label: "About", path: "/about" },
    { label: "Trade", path: "/trade" },
    { label: "Custom", path: "/custom" },
  ],
  contactButton: "Contact us",
  footerText: "3D printed objects for considered living — lighting, vessels and desk pieces, made layer by layer in Mumbai from non-toxic, recyclable materials.",
  footerExplore: "Explore",
  footerCompany: "Company",
  footerSocial: "Social",
  copyright: "© 2026 Layer & Loop Objects. All rights reserved.",
  email: "hello@layerandloop.in",
  tradeEmail: "trade@layerandloop.in",
  phone: "+91 98000 00000",
  whatsapp: "919800000000",
  whatsappMessage: "Hi Layer & Loop, I have a question about…",
  showWhatsappButton: "yes",
  storeName: "Layer & Loop Objects",
  storeAddress: "12 Linking Road, Bandra West\nMumbai 400050, India",
  storeHours: "Tue – Sun, 11am – 8pm · closed Mondays",
  mapUrl: "https://www.google.com/maps/search/?api=1&query=12+Linking+Road+Bandra+West+Mumbai",
  studioLocation: "Indiranagar, Bengaluru, India",
  socials: [
    { label: "Instagram", url: "https://instagram.com/layerandloop" },
    { label: "Pinterest", url: "https://pinterest.com/layerandloop" },
    { label: "LinkedIn", url: "https://linkedin.com/company/layerandloop" },
  ],
};

const home = {
  heroTitle: "Modern designs.\nEffortless comfort.\nLasting quality.",
  heroSlides: [{ product: "the-stack-lamp" }, { product: "noir" }, { product: "terra" }],
  badge1: "Premium selection",
  badge2: "Non - Toxic Material",
  slideCaption: "Now available for order",
  heroText: "Designed with enduring materials, quiet forms, and thoughtful craftsmanship for interiors that feel timeless rather than trendy.",
  keywords: ["Nature", "Sculptural", "Minimalism"],
  editTitle: "The Edit",
  editSubtitle: "Feature collection",
  philosophyTitle: "Our Philosophy",
  philosophyText: "Every piece is thoughtfully crafted to balance atmosphere, material, and form — bringing quiet elegance into everyday living.",
  editButton: "Enter Collection",
  marquee: "Designed to be lived with ✦",
  categoryTitle: "Shop by Category",
  categorySubtitle: "Find the piece that fits your space",
  categoryButton: "Browse All Collections",
  livingTitle: "Objects That Shape Everyday Living",
  livingImage: "asset:living.jpg",
};

const catalog = {
  heroTitle: "ALL OBJECTS",
  heroText: "Browse our full catalog of lighting, vases, collectibles and desk objects — crafted for homes, cafés, restaurants and studios.",
  filtersTitle: "Filters",
  categoryLabel: "Category",
  allLabel: "All Products",
  spaceLabel: "Filter by Space",
  emptyText: "No objects match these filters.",
  taxNote: "Inclusive of all taxes",
  madeForLabel: "Made for",
  colourLabel: "Colour",
  variantLabel: "Variant",
  specsLabel: "Size & specification",
  careLabel: "Object care & wear",
  shipsNote: "Ships across India",
  returnsNote: "7-day easy returns",
  paymentsLabel: "Payment options",
  payments: ["Credit card", "Debit card", "UPI", "Net banking", "Wallets"],
  backLabel: "← Back to All Objects",
};

const about = {
  heroEyebrow: "Our Story",
  heroTitle: "Layer. Loop. Form.",
  storyTitle: "We believe objects should be designed, not just manufactured.",
  storyText1: "LAYER & LOOP started in 2022 as a small print studio with a handful of machines and a simple idea: that 3D printing could make calm, sculptural objects for everyday living.",
  storyText2: "Every lamp, vase and desk piece is designed in-house and printed to order, layer by layer. The fine lines you see are not hidden — they are the signature of how each object was made.",
  storyImage: "asset:about-printer.jpg",
  materialsTitle: "Materials We Print With",
  materials: [
    { name: "PLA", text: "Plant-based, matte and non-toxic. Our go-to for lamps, vases and collectibles.", image: "asset:mat-pla.jpg" },
    { name: "PETG", text: "Tough and water-safe, so planters and everyday objects last.", image: "asset:mat-petg.jpg" },
    { name: "TPU", text: "Soft and flexible, used for grips, feet and desk essentials.", image: "asset:mat-tpu.jpg" },
    { name: "ABS", text: "Strong and heat-resistant, for lamp parts and structural pieces.", image: "asset:mat-abs.jpg" },
    { name: "ASA", text: "UV- and weather-resistant, for outdoor planters and café terraces.", image: "asset:mat-asa.jpg" },
  ],
  beliefsTitle: "What We Believe",
  beliefs: [
    { name: "Made to Order", text: "Every piece is printed when you order it — no overstock, little waste." },
    { name: "Designed In-House", text: "Each form is modelled by our own team, then refined print by print." },
    { name: "Kind Materials", text: "Non-toxic filaments, chosen to be safe at home and recyclable where possible." },
  ],
  atmosphereTitle: "Designed for Atmosphere",
  atmosphereImage: "asset:study.jpg",
  storeEyebrow: "Visit Us",
  storeTitle: "Our Retail Store",
  storeText: "Printed objects are best understood in person. We opened our store so you can run a hand over the layer lines, see the lamps glowing as they would at home, and watch a printer at work in the window.",
  storeAddress: "12 Linking Road, Bandra West, Mumbai",
  storeHours: "Tue – Sun, 11am – 8pm",
  storeImages: ["asset:store-1.jpg", "asset:store-4.jpg", "asset:store-2.jpg", "asset:store-5.jpg", "asset:store-3.jpg"],
};

const trade = {
  heroEyebrow: "Trade & Partnerships",
  heroTitle: "Built for Businesses That Build Spaces",
  heroText: "We 3D print in PLA, PETG, TPU, ABS and ASA for studios, retailers, brands and makers — from one-off pieces to bulk runs.",
  partnersEyebrow: "Who we work with",
  partnersTitle: "Whoever you are, we have something for you.",
  partners: [
    { name: "Interiors & Architects", text: "Custom lighting, fixtures and decor for your projects.", image: "asset:trade-studio.jpg" },
    { name: "Retailers & Concept Stores", text: "Ready-to-shelf collections at wholesale pricing.", image: "asset:trade-retail.jpg" },
    { name: "Vendors & Resellers", text: "Add our objects to your catalogue with ease.", image: "asset:trade-vendors.jpg" },
    { name: "Startups & Businesses", text: "Branded objects and prototypes to grow your range.", image: "asset:trade-startups.jpg" },
    { name: "Corporate Gifting", text: "Thoughtful gifts for employees, clients and partners.", image: "asset:trade-gifting.jpg" },
    { name: "Makers & Enthusiasts", text: "Collaborate with us on something new.", image: "asset:trade-makers.jpg" },
  ],
  contactTitle: "Let's Make Something Together",
  contactText: "Reach out directly — we usually reply within a day.",
  catalogueEyebrow: "Catalogue request",
  catalogueTitle: "Get Our Catalogues",
  catalogueSubtitle: "Request a catalogue",
  catalogueText: "Festive, B2B, retail or corporate gifting — tell us what you need and we'll send the right catalogue within 2 business days.",
  catalogues: ["Festive", "B2B / Wholesale", "Retail", "Corporate Gifting", "Custom Projects"],
  quantities: ["Under 50", "50–200", "200–1000", "1000+"],
  submitLabel: "Request a Catalogue",
  thankYou: "Thank you — your catalogue request is in. We'll be in touch within 2 business days.",
};

const contact = {
  heroEyebrow: "Contact",
  heroTitle: "Say hello, or come by.",
  heroText: "Questions about an object, an order or a whole space — every message lands with a person, not a queue.",
  storeEyebrow: "The Store",
  storeTitle: "Come and see them in person.",
  storeText: "Our shop and print studio sit on Linking Road in Bandra West. Run a hand over the layer lines, watch a lamp being printed in the window, or collect an order the same day.",
  storeImage: "asset:store-1.jpg",
  directionsLabel: "Get directions",
  reachTitle: "Reach us directly",
  reachText: "Write, call or send a parcel — we usually reply within a day.",
  emailNote: "Orders, custom pieces, anything at all.",
  phoneNote: "Tue – Sun, 11am – 8pm.",
  postNote: "Returns, couriers and material samples.",
  careersEyebrow: "Work with us",
  careersTitle: "Want to build with us?",
  careersText: "We keep the studio small and hire rarely. Printer, designer, shop floor or film — tell us who you are and what you would bring to the bench.",
  careersNote: "Every note is read by a person. Expect a reply within a week.",
  submitLabel: "Send your application",
  thankYou: "Thank you — your note is with us. We'll come back to you within a week.",
};

const instagram = {
  eyebrow: "On Instagram",
  handle: "layerandloop",
  url: "https://instagram.com/layerandloop",
  text: "Fresh off the print bed — new drops, studio moments and your spaces.",
  buttonLabel: "Follow us",
  posts: ["asset:p-mushroom.jpg", "asset:store-2.jpg", "asset:mat-petg.jpg", "asset:tile-vases.jpg", "asset:about-printer.jpg", "asset:p-orb.jpg", "asset:tile-desk.jpg", "asset:living.jpg", "asset:tile-collectibles.jpg", "asset:p-pendant.jpg"],
};

const terms = {
  eyebrow: "Legal",
  title: "Terms & Conditions",
  intro: "The terms that apply when you browse this website or place an order with Layer & Loop Objects.",
  notice: "This is a summary for reference while the full legal document is being finalised. Final terms will be published on this page.",
  sections: [
    { heading: "Our products", body: "Every object is 3D printed and finished by hand. Fine layer lines, slight variations in texture and minor differences in colour between screen and product are characteristic of the process and are not considered defects." },
    { heading: "Orders & pricing", body: "All prices are listed in Indian Rupees and include applicable taxes. An order is confirmed only once payment is received. We reserve the right to cancel and fully refund any order affected by a pricing error or stock limitation." },
    { heading: "Delivery", body: "Delivery timelines shown at checkout are estimates and may vary by PIN code, courier availability and made-to-order lead times." },
    { heading: "Returns & refunds", body: "Returns, replacements and refunds are governed by our Returns, Replacements & Refunds Policy, which forms part of these terms." },
    { heading: "Intellectual property", body: "All designs, photographs and content on this website belong to Layer & Loop Objects and may not be reproduced, printed or resold without written permission." },
    { heading: "Governing law", body: "These terms are governed by the laws of India, with jurisdiction in the courts of Mumbai." },
  ],
  footer: "Last updated: October 2026. Questions? Write to hello@layerandloop.in.",
};

const returns = {
  eyebrow: "Customer care",
  title: "Returns, Replacements & Refunds",
  intro: "How we handle damaged parcels, returns, replacements and refunds.",
  notice: "This is a summary for reference while the full policy is being finalised. The final policy will be published on this page.",
  sections: [
    { heading: "Record your unboxing", body: "Please record a continuous, unedited video while opening your parcel, starting with the sealed package and its shipping label in view.\n\nClaims for damaged, missing or incorrect items can only be considered with this video. Report any issue within 48 hours of delivery." },
    { heading: "Eligibility", body: "Not every product is eligible for return at this time. Made-to-order, personalised, custom-colour and trade or bulk orders are non-returnable. Eligibility for each object will be stated on its product page." },
    { heading: "Replacements", body: "Items verified as damaged in transit or carrying a manufacturing defect will be replaced at no cost. If a replacement is unavailable, we will offer a full refund or store credit." },
    { heading: "Returns", body: "Eligible items may be returned within 7 days of delivery, unused and in their original packaging. Return shipping may be charged unless the item was damaged or incorrect." },
    { heading: "Refunds", body: "Approved refunds are issued to the original payment method within 7–10 working days of the returned item passing inspection." },
    { heading: "Special cases", body: "All returns, replacements and refunds are assessed case by case and remain at the discretion of Layer & Loop. Terms and conditions apply." },
  ],
  footer: "Last updated: October 2026. Questions? Write to hello@layerandloop.in.",
};

const custom = {
  heroEyebrow: "The Bespoke Lab",
  heroTitle: "Make it yours.",
  heroImage: "asset:custom-hero.jpg",
  heroText: "Engrave a name, ask for your colour, change the scale, print from your photo or stack a floor lamp. Play with it here — we'll make it real.",
  tweakLabel: "Tweak one of ours",
  scratchLabel: "Start from scratch",
  offersTitle: "What we can customise",
  offers: [
    { name: "Name & letter engraving", text: "Initials, names, dates or a short line — engraved into any piece." },
    { name: "Your colour", text: "Ask for your preferred colour — we'll match it to the closest shade we print." },
    { name: "Size & scale", text: "Shrink it for a shelf or grow it for a lobby — every piece can be rescaled." },
    { name: "From your photo", text: "Upload a photo and we'll turn it into a relief, lithophane or a printed lookalike." },
    { name: "Stackable builds", text: "Stack modules into floor lamps and tall vases, as high as your room allows." },
  ],
  sandboxEyebrow: "The Slicing Sandbox",
  sandboxTitle: "Shape it. Texture it. Light it.",
  sandboxText: "Drag the sliders and spin the model. Fuzzy skin is the soft, matte texture our printers give the surface.",
  sandboxNote: "Estimates are a guide only — we confirm the final price after reviewing your design.",
  sendLabel: "Send this design to the studio",
  gramPrice: "6",
  basePrice: "900",
  lightKitPrice: "1200",
  waterproofLoops: "3",
  photoEyebrow: "Photo to 3D",
  photoTitle: "Turn a photo into an object.",
  photoText: "Upload a photo and choose what it becomes: a 3D object our AI recognises and models, a raised relief, or a lithophane that reveals the picture when lit.",
  photoNote: "This is an instant preview. Our designers make the final model by hand.",
  sketchEyebrow: "From sketch to print",
  sketchTitle: "Sketch it. See it in 3D.",
  sketchImage: "asset:custom-sketch.jpg",
  printImage: "asset:custom-print.jpg",
  stepsTitle: "The creation loop",
  steps: [
    { name: "Render preview", text: "We model your idea and send you a 3D render to approve." },
    { name: "Sample & colour", text: "We match your colour and test the layers on a small sample." },
    { name: "Print", text: "Your piece is printed layer by layer, made to order." },
    { name: "Hand finishing", text: "Wired, checked and finished by hand before it ships." },
  ],
  briefEyebrow: "Custom brief",
  briefTitle: "Tell us what you'd like made.",
  briefText: "A few quick steps. Attach sketches, photos or 3D files if you have them.",
  submitLabel: "Send to the studio",
  thankYou: "It's on our workbench. We'll reply within 2 business days with ideas, a render and a quote.",
  whatsappLabel: "Rather talk it through? WhatsApp us",
};

export const defaults = { settings, home, catalog, about, trade, contact, custom, instagram, terms, returns };
export type ContentKey = keyof typeof defaults;
export type Content<K extends ContentKey> = (typeof defaults)[K];

const t = (k: string, label: string, help?: string): Field => ({ k, label, t: "text", ...(help ? { help } : {}) });
const ta = (k: string, label: string, help?: string): Field => ({ k, label, t: "textarea", ...(help ? { help } : {}) });
const im = (k: string, label: string): Field => ({ k, label, t: "image" });
const legal: Group[] = [
  { title: "Header", fields: [t("eyebrow", "Small label"), t("title", "Title"), ta("intro", "Introduction"), ta("notice", "Notice box")] },
  { title: "Sections", fields: [{ k: "sections", label: "Sections", t: "list", item: "section", of: [t("heading", "Heading"), ta("body", "Text", "Leave a blank line between paragraphs.")] }] },
  { title: "Footer", fields: [t("footer", "Last line")] },
];

export const sections: Record<ContentKey, { title: string; description: string; groups: Group[] }> = {
  settings: {
    title: "Site settings",
    description: "Navigation, contact details, store location, socials and footer — used on every page.",
    groups: [
      { title: "Logo", fields: [{ k: "logoMode", label: "Display logo as", t: "select", options: [{ value: "text", label: "Text" }, { value: "image", label: "Image (SVG or PNG)" }] }, t("brand", "Logo text", "Also used as the image description and fallback if no image is uploaded."), { k: "logoImage", label: "Logo image", t: "image", help: "Upload an SVG or PNG logo. Choose Image above to display it." }] },
      { title: "Navigation", fields: [{ k: "nav", label: "Menu links", t: "list", item: "link", of: [t("label", "Label"), { k: "path", label: "Opens page", t: "link" }] }, t("contactButton", "Contact button label")] },
      { title: "Contact details", fields: [t("email", "Main email"), t("tradeEmail", "Trade email"), t("phone", "Phone number"), t("whatsapp", "WhatsApp number", "Country code + number, digits only, e.g. 919800000000"), t("whatsappMessage", "WhatsApp greeting"), t("showWhatsappButton", "Show floating WhatsApp button", "Type yes or no")] },
      { title: "Store & studio", fields: [t("storeName", "Store name"), ta("storeAddress", "Store address"), t("storeHours", "Opening hours"), { k: "mapUrl", label: "Google Maps link", t: "url" }, t("studioLocation", "Studio location")] },
      { title: "Social profiles", fields: [{ k: "socials", label: "Profiles", t: "list", item: "profile", of: [t("label", "Name (e.g. Instagram)"), { k: "url", label: "Profile link", t: "url" }] }] },
      { title: "Footer", fields: [ta("footerText", "Footer description"), t("footerExplore", "Explore heading"), t("footerCompany", "Company heading"), t("footerSocial", "Social heading"), t("copyright", "Copyright line")] },
    ],
  },
  home: {
    title: "Homepage",
    description: "Cover, The Edit, Shop by Category and the closing image. The Edit shows every product marked Featured; category tiles come from Categories.",
    groups: [
      { title: "Cover", fields: [ta("heroTitle", "Headline", "Each new line starts a new line on the page."), { k: "heroSlides", label: "Cover slides", t: "list", item: "slide", of: [{ k: "product", label: "Product", t: "product" }] }, t("badge1", "Photo badge 1"), t("badge2", "Photo badge 2"), t("slideCaption", "Slide caption"), ta("heroText", "Text under the cover")] },
      { title: "The Edit", fields: [t("editTitle", "Title"), t("editSubtitle", "Subtitle"), t("philosophyTitle", "Side heading"), ta("philosophyText", "Side text"), t("editButton", "Button label")] },
      { title: "Scrolling banner", fields: [t("marquee", "Banner text")] },
      { title: "Shop by Category", fields: [t("categoryTitle", "Title"), t("categorySubtitle", "Subtitle"), t("categoryButton", "Button label")] },
      { title: "Closing image", fields: [t("livingTitle", "Title"), im("livingImage", "Photo")] },
    ],
  },
  catalog: {
    title: "Products page & product details",
    description: "Labels on the All Objects page and on every product page.",
    groups: [
      { title: "All Objects page", fields: [t("heroTitle", "Title"), ta("heroText", "Intro"), t("filtersTitle", "Filters heading"), t("categoryLabel", "Category heading"), t("allLabel", "“All” option"), t("spaceLabel", "Spaces heading"), t("emptyText", "No results text")] },
      { title: "Product page", fields: [t("taxNote", "Under price"), t("madeForLabel", "Spaces label"), t("colourLabel", "Colour label"), t("variantLabel", "Variant label"), t("specsLabel", "Specifications heading"), t("careLabel", "Care heading"), t("shipsNote", "Shipping note"), t("returnsNote", "Returns note"), t("paymentsLabel", "Payments heading"), { k: "payments", label: "Payment methods", t: "strings" }, t("backLabel", "Back link")] },
    ],
  },
  about: {
    title: "About page",
    description: "Story, materials, beliefs and the retail store photos (add as many as you like).",
    groups: [
      { title: "Header", fields: [t("heroEyebrow", "Small label"), t("heroTitle", "Title")] },
      { title: "Story", fields: [t("storyTitle", "Heading"), ta("storyText1", "Paragraph 1"), ta("storyText2", "Paragraph 2"), im("storyImage", "Photo")] },
      { title: "Materials", fields: [t("materialsTitle", "Heading"), { k: "materials", label: "Materials", t: "list", item: "material", of: [t("name", "Name"), ta("text", "Description"), im("image", "Photo")] }] },
      { title: "Beliefs", fields: [t("beliefsTitle", "Heading"), { k: "beliefs", label: "Beliefs", t: "list", item: "belief", of: [t("name", "Title"), ta("text", "Text")] }] },
      { title: "Atmosphere", fields: [t("atmosphereTitle", "Heading"), im("atmosphereImage", "Photo")] },
      { title: "Retail store", fields: [t("storeEyebrow", "Small label"), t("storeTitle", "Heading"), ta("storeText", "Text"), t("storeAddress", "Address"), t("storeHours", "Hours"), { k: "storeImages", label: "Store photos", t: "images", help: "Add as many as you like — the slider loops through all of them." }] },
    ],
  },
  trade: {
    title: "Trade page",
    description: "Partner panels, contact block and the catalogue request form. Email and phone come from Site settings.",
    groups: [
      { title: "Header", fields: [t("heroEyebrow", "Small label"), t("heroTitle", "Title"), ta("heroText", "Intro")] },
      { title: "Who we work with", fields: [t("partnersEyebrow", "Small label"), t("partnersTitle", "Heading"), { k: "partners", label: "Partner panels", t: "list", item: "panel", of: [t("name", "Title"), ta("text", "Description"), im("image", "Photo")] }] },
      { title: "Contact block", fields: [t("contactTitle", "Heading"), ta("contactText", "Text")] },
      { title: "Catalogue form", fields: [t("catalogueEyebrow", "Small label"), t("catalogueTitle", "Heading"), t("catalogueSubtitle", "Subheading"), ta("catalogueText", "Text"), { k: "catalogues", label: "Catalogue options", t: "strings" }, { k: "quantities", label: "Quantity options", t: "strings" }, t("submitLabel", "Button label"), ta("thankYou", "Thank-you message")] },
    ],
  },
  contact: {
    title: "Contact page",
    description: "Store block, contact cards and the careers form. Address, email and phone come from Site settings.",
    groups: [
      { title: "Header", fields: [t("heroEyebrow", "Small label"), t("heroTitle", "Title"), ta("heroText", "Intro")] },
      { title: "Store", fields: [t("storeEyebrow", "Small label"), t("storeTitle", "Heading"), ta("storeText", "Text"), im("storeImage", "Store photo"), t("directionsLabel", "Directions button")] },
      { title: "Reach us", fields: [t("reachTitle", "Heading"), ta("reachText", "Text"), t("emailNote", "Email card note"), t("phoneNote", "Phone card note"), t("postNote", "Post card note")] },
      { title: "Careers", fields: [t("careersEyebrow", "Small label"), t("careersTitle", "Heading"), ta("careersText", "Text"), t("careersNote", "Small note"), t("submitLabel", "Button label"), ta("thankYou", "Thank-you message")] },
    ],
  },
  custom: {
    title: "Custom page",
    description: "The Bespoke Lab: customisation options, 3D sandbox, photo to 3D, sketch slider, steps and the custom brief form.",
    groups: [
      { title: "Header", fields: [t("heroEyebrow", "Small label"), t("heroTitle", "Title"), im("heroImage", "Cover photo"), ta("heroText", "Intro"), t("tweakLabel", "Button 1"), t("scratchLabel", "Button 2")] },
      { title: "What we customise", fields: [t("offersTitle", "Heading"), { k: "offers", label: "Options", t: "list", item: "option", of: [t("name", "Title"), ta("text", "Text")] }] },
      { title: "3D sandbox", fields: [t("sandboxEyebrow", "Small label"), t("sandboxTitle", "Heading"), ta("sandboxText", "Text"), ta("sandboxNote", "Estimate note"), t("sendLabel", "Send button")] },
      { title: "Estimate settings (₹)", fields: [t("gramPrice", "Price per gram", "Numbers only"), t("basePrice", "Base fee"), t("lightKitPrice", "Light kit price"), t("waterproofLoops", "Extra wall loops for waterproofing")] },
      { title: "Photo to 3D", fields: [t("photoEyebrow", "Small label"), t("photoTitle", "Heading"), ta("photoText", "Text"), t("photoNote", "Note")] },
      { title: "Sketch to print", fields: [t("sketchEyebrow", "Small label"), t("sketchTitle", "Heading"), im("sketchImage", "Sketch photo"), im("printImage", "Finished photo")] },
      { title: "Steps", fields: [t("stepsTitle", "Heading"), { k: "steps", label: "Steps", t: "list", item: "step", of: [t("name", "Title"), ta("text", "Text")] }] },
      { title: "Custom brief form", fields: [t("briefEyebrow", "Small label"), t("briefTitle", "Heading"), ta("briefText", "Text"), t("submitLabel", "Button label"), ta("thankYou", "Thank-you message"), t("whatsappLabel", "WhatsApp link label")] },
    ],
  },
  instagram: {
    title: "Instagram strip",
    description: "Shown on the homepage and the About page.",
    groups: [{ title: "Instagram", fields: [t("eyebrow", "Small label"), t("handle", "Handle (without @)"), { k: "url", label: "Profile link", t: "url" }, ta("text", "Text"), t("buttonLabel", "Button label"), { k: "posts", label: "Post photos", t: "images" }] }],
  },
  terms: { title: "Terms & Conditions", description: "Opens from the footer link.", groups: legal },
  returns: { title: "Returns & Refunds policy", description: "Opens from the footer link.", groups: legal },
};

/** Saved values win; anything missing falls back to the default. */
export function mergeContent<K extends ContentKey>(key: K, saved: unknown): Content<K> {
  const base = defaults[key] as Record<string, unknown>;
  if (!saved || typeof saved !== "object") return base as Content<K>;
  const out: Record<string, unknown> = { ...base };
  for (const [k, v] of Object.entries(saved as Record<string, unknown>)) {
    if (v !== null && v !== undefined && k in base) out[k] = v;
  }
  return out as Content<K>;
}
