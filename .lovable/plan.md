# Custom Studio page — "The Bespoke Lab"

A new page at `/custom` in the same dark-and-cream theme, built for exploration: every section reacts to scroll, drag or hover.

## Page flow

1. **Hero — "Make it yours"**
   Large type that assembles layer by layer as it loads (like a print building up), with a slowly rotating 3D lamp behind it. Two entry buttons: "Tweak one of ours" and "Start from scratch".

2. **What we can customise** — five interactive tiles, each with its own live mini-demo on hover/tap:
   - **Name & letter engraving** — type your text and see it appear on a sample object.
   - **Any colour** — pick a hex code or upload a palette image; we show the closest colours we can print and explain we'll confirm by message.
   - **Size & scale** — drag to resize an object next to a coffee cup for reference.
   - **From your photo** — upload a photo; it becomes a relief/lithophane-style 3D preview.
   - **Stackable builds** — stack modules into a floor lamp or tall vase.

3. **The Slicing Sandbox (centrepiece)** — a real rotatable 3D model you build with sliders:
   - Base form: pendant, table lamp, vase, planter, stackable module.
   - Height, width, taper and twist sliders.
   - **Fuzzy skin** slider (off to heavy) — surface gets visibly rough/textured, like Bambu Studio's fuzzy skin.
   - Layer lines density.
   - Stack count (1–6 modules) for floor lamps and tall vases.
   - Colour: preset swatches or any hex code; shows "closest studio match".
   - **Light toggle** (lighting forms): on/off with warm/neutral glow shining through the walls.
   - **Waterproof toggle** (vases/planters): adds wall loops; the wall thickens visibly and weight goes up.
   - Live spec card: approx. size, weight, print time and an estimated price range in ₹.
   - "Send this design to the studio" fills the brief below automatically.

4. **Photo to 3D** — upload a photo and instantly get a lookalike 3D relief model (displacement from the image's light and dark areas), rotatable in place. Honest note: it's a preview; our team makes the final model.

5. **Sketch-to-print slider** — drag before/after between a sketch and a finished piece.

6. **The 4-step creation loop** — steps animate in as you scroll: render preview, sample, print, hand finishing.

7. **Custom brief builder** — a short step-by-step form: what it is, size, colour/hex, engraving text, waterproof/light needs, quantity, timeline, reference uploads (images, STL/OBJ), name, email, WhatsApp, PIN code. Ends with a playful "sent to the studio" animation. Plus a direct WhatsApp button.

## Navigation
- Desktop: "Custom" placed after "Partnership/Trade" in the header.
- Phone and tablet: added inside the burger menu.

## Admin (CMS)
- Page text, images and the price/weight estimate settings editable in the CMS.
- Custom requests land in the existing enquiries inbox tagged "Custom request", with all sandbox settings and uploaded files attached; WhatsApp reply and CSV export work as today.

## What to know
- The 3D models are made live in the browser and look realistic but simplified; they are previews, not final print files.
- Price, weight and time numbers are placeholder formulas until you give me your real rates.
- I'll create stand-in images for the sketch-to-print slider until you share real ones.

## Technical details
- Three.js via React Three Fiber, client-only section; lathe geometry from profile curves, vertex noise for fuzzy skin, stacked module instances, inner-wall offset for wall loops, emissive inner light; photo relief via canvas-sampled displacement plane.
- Hex "closest match" uses colour distance against a CMS-editable palette.
- New `site_content` key for page copy; brief schema in a browser-safe `src/lib` module using `fieldValue`; uploads to the private media bucket; enquiry type extended for custom requests.
- Head metadata for the new route; tests for estimate formula and colour matching.
