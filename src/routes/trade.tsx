import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Briefcase, Gift, Mail, MapPin, Phone, PenTool, Sparkles, Store, Truck } from "lucide-react";
import { DarkHero, Page } from "@/components/site";

export const Route = createFileRoute("/trade")({
  head: () => ({
    meta: [
      { title: "Trade, Wholesale & Corporate Gifting — Layer & Loop" },
      { name: "description", content: "3D printed objects for studios, retailers, vendors, startups and corporate gifting. Request our B2B, festive, retail or gifting catalogue." },
      { property: "og:title", content: "Trade, Wholesale & Corporate Gifting — Layer & Loop" },
      { property: "og:description", content: "Partner with Layer & Loop — request our B2B, festive, retail and gifting catalogues." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Trade,
});

const partners = [
  { icon: PenTool, name: "Design Studios & Architects", text: "Custom lighting, fixtures and decor for your projects.", points: ["Colour & size changes", "Project-specific runs", "Material samples"] },
  { icon: Store, name: "Retailers & Concept Stores", text: "Ready-to-shelf collections at wholesale pricing.", points: ["Wholesale rates", "Curated assortments", "Restock support"] },
  { icon: Truck, name: "Vendors & Resellers", text: "Add our objects to your catalogue with ease.", points: ["White-label options", "Dropship support", "Product imagery"] },
  { icon: Briefcase, name: "Startups & Businesses", text: "Branded objects and prototypes to grow your range.", points: ["Branded merch", "Prototyping", "Small to bulk batches"] },
  { icon: Gift, name: "Corporate Gifting", text: "Thoughtful gifts for employees, clients and partners.", points: ["Festive hampers", "Logo personalisation", "Bulk delivery"] },
  { icon: Sparkles, name: "Makers & Enthusiasts", text: "Collaborate with us on something new.", points: ["Small-batch collabs", "Limited drops", "Community projects"] },
];

const catalogues = ["Festive", "B2B / Wholesale", "Retail", "Corporate Gifting", "Custom Projects"];
const quantities = ["Under 50", "50–200", "200–1000", "1000+"];

const schema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(100),
  company: z.string().trim().min(1, "Please enter your company").max(120),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().regex(/^[+\d][\d\s-]{6,18}$/, "Enter a valid phone number"),
  type: z.string().min(1, "Please choose one"),
  catalogues: z.array(z.string()).min(1, "Pick at least one catalogue"),
  quantity: z.string().min(1, "Please choose one"),
  message: z.string().max(1000).optional(),
});

const field = "mt-2 w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm normal-case tracking-normal text-foreground";
const lbl = "block text-xs uppercase tracking-widest text-muted-foreground";

function Trade() {
  const [sent, setSent] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const r = schema.safeParse({
      name: f.get("name"), company: f.get("company"), email: f.get("email"), phone: f.get("phone"),
      type: f.get("type"), catalogues: picked, quantity: f.get("quantity"), message: f.get("message") || undefined,
    });
    if (!r.success) {
      const errs: Record<string, string> = {};
      r.error.issues.forEach((i) => { errs[String(i.path[0])] ??= i.message; });
      setErrors(errs);
      return;
    }
    setErrors({});
    setSent(true);
  };

  const err = (k: string) => errors[k] && <span className="mt-1 block text-[11px] normal-case tracking-normal text-destructive">{errors[k]}</span>;

  return (
    <Page>
      <DarkHero eyebrow="Trade & Partnerships" title="Built for Businesses That Build Spaces">
        <p className="mt-4 max-w-md text-ink-muted">We 3D print in PLA, PETG, TPU, ABS and ASA for studios, retailers, brands and makers — from one-off pieces to bulk runs.</p>
      </DarkHero>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Who we work with</p>
        <h2 className="mt-3 text-3xl font-bold md:text-4xl">Whoever you are, we have something for you.</h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {partners.map(({ icon: Icon, name, text, points }) => (
            <div key={name} className="rounded-2xl bg-card p-7 transition hover:-translate-y-1 hover:shadow-lg">
              <Icon className="h-6 w-6 text-primary" strokeWidth={1.5} />
              <h3 className="mt-5 font-bold uppercase">{name}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{text}</p>
              <ul className="mt-5 space-y-2 border-t border-border pt-5 text-sm">{points.map((p) => <li key={p}>✓ {p}</li>)}</ul>
            </div>
          ))}
        </div>
        <p className="mt-10 text-center text-muted-foreground">Not sure where you fit? Talk to us anyway.</p>
      </section>

      <section className="bg-ink text-ink-foreground">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <h2 className="text-3xl font-bold md:text-4xl">Let's Make Something Together</h2>
          <p className="mt-4 max-w-lg text-ink-muted">Reach out directly — we usually reply within a day.</p>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <a href="mailto:trade@layerandloop.in" className="rounded-2xl border border-ink-line bg-ink-soft p-6 transition hover:border-primary">
              <Mail className="h-5 w-5 text-primary" /><p className="mt-4 text-xs uppercase tracking-widest text-ink-muted">Email</p><p className="mt-1">trade@layerandloop.in</p>
            </a>
            <a href="tel:+919800000000" className="rounded-2xl border border-ink-line bg-ink-soft p-6 transition hover:border-primary">
              <Phone className="h-5 w-5 text-primary" /><p className="mt-4 text-xs uppercase tracking-widest text-ink-muted">Phone / WhatsApp</p><p className="mt-1">+91 98000 00000</p>
            </a>
            <div className="rounded-2xl border border-ink-line bg-ink-soft p-6">
              <MapPin className="h-5 w-5 text-primary" /><p className="mt-4 text-xs uppercase tracking-widest text-ink-muted">Studio</p><p className="mt-1">Indiranagar, Bengaluru, India</p>
            </div>
          </div>
          <a href="#catalogue" className="mt-10 inline-block rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground">Request a Catalogue</a>
        </div>
      </section>

      <section id="catalogue" className="mx-auto grid max-w-7xl scroll-mt-20 items-start gap-12 px-6 py-20 md:grid-cols-[1fr_1.3fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Catalogue request</p>
          <h2 className="mt-3 text-3xl font-bold md:text-4xl">Get Our Catalogues</h2>
          <p className="mt-4 max-w-md text-muted-foreground">Festive, B2B, retail or corporate gifting — tell us what you need and we'll send the right catalogue within 2 business days.</p>
        </div>
        <form onSubmit={submit} noValidate className="space-y-5 rounded-2xl bg-card p-7">
          {sent ? <p className="py-16 text-center">Thank you — your catalogue request is in. We'll be in touch within 2 business days.</p> : <>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className={lbl}>Full Name<input name="name" maxLength={100} className={field} />{err("name")}</label>
              <label className={lbl}>Company / Studio<input name="company" maxLength={120} className={field} />{err("company")}</label>
              <label className={lbl}>Email<input name="email" type="email" maxLength={255} className={field} />{err("email")}</label>
              <label className={lbl}>Phone<input name="phone" type="tel" maxLength={20} className={field} />{err("phone")}</label>
              <label className={lbl}>I am a…
                <select name="type" defaultValue="" className={field}><option value="" disabled>Select</option>{partners.map((p) => <option key={p.name}>{p.name}</option>)}</select>{err("type")}
              </label>
              <label className={lbl}>Estimated Quantity
                <select name="quantity" defaultValue="" className={field}><option value="" disabled>Select</option>{quantities.map((q) => <option key={q}>{q}</option>)}</select>{err("quantity")}
              </label>
            </div>
            <div>
              <p className={lbl}>Catalogues I want</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {catalogues.map((c) => {
                  const on = picked.includes(c);
                  return <button type="button" key={c} onClick={() => setPicked(on ? picked.filter((x) => x !== c) : [...picked, c])}
                    className={`rounded-full border px-4 py-1.5 text-sm transition ${on ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-foreground"}`}>{c}</button>;
                })}
              </div>
              {err("catalogues")}
            </div>
            <label className={lbl}>Message (optional)<textarea name="message" rows={4} maxLength={1000} className={field} /></label>
            <button className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground">Send My Request</button>
          </>}
        </form>
      </section>
    </Page>
  );
}
