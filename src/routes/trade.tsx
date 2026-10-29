import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DarkHero, Page } from "@/components/site";

export const Route = createFileRoute("/trade")({
  head: () => ({
    meta: [
      { title: "Trade & Partnership Pricing — Layer & Loop" },
      { name: "description", content: "Trade discounts for interior designers, architects and hospitality specialists." },
      { property: "og:title", content: "Trade & Partnership Pricing — Layer & Loop" },
      { property: "og:description", content: "Register for architectural and trade pricing." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Trade,
});

const tiers = [
  { name: "Design Access", big: "15% OFF", text: "For independent interior designers and architects working on residential projects. No minimum order required.", perks: ["Standard Trade Discount", "Tear sheet generator access", "3D model files (.OBJ / .REVIT)"] },
  { name: "Studio Pro", big: "25% OFF", featured: true, text: "For established design studios and developers requiring priority dispatch and customization service.", perks: ["Higher volume discount tiered rates", "Custom cord-length adjustments", "Dedicated account consultant", "Free material sample kit"] },
  { name: "Hospitality", big: "VOLUME", text: "For larger-scale boutique hotels, corporate office fitouts, and multi-residential builds.", perks: ["Fully custom ceramic glaze matched", "Project timeline storage & staging", "UL listing / commercial certifications"] },
];

function Trade() {
  const [sent, setSent] = useState(false);
  return (
    <Page>
      <DarkHero eyebrow="Trade & Partnership" title="Architectural and Trade Pricing">
        <p className="mt-4 max-w-md text-ink-muted">We partner with interior designers, architects, and hospitality specialists to integrate our atmospheric lighting into customized commercial and residential spaces.</p>
      </DarkHero>
      <section className="mx-auto grid max-w-7xl items-start gap-6 px-6 py-20 md:grid-cols-3">
        {tiers.map((t) => (
          <div key={t.name} className={`rounded-2xl p-7 ${t.featured ? "bg-ink text-ink-foreground md:-mt-4 md:pb-11" : "bg-card"}`}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold uppercase">{t.name}</h3>
              {t.featured && <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase text-primary-foreground">Recommended</span>}
            </div>
            <p className={`mt-5 font-display text-3xl font-extrabold ${t.featured ? "text-primary" : ""}`}>{t.big}</p>
            <p className={`mt-4 text-sm ${t.featured ? "text-ink-muted" : "text-muted-foreground"}`}>{t.text}</p>
            <ul className={`mt-6 space-y-2 border-t pt-5 text-sm ${t.featured ? "border-ink-line" : "border-border"}`}>{t.perks.map((p) => <li key={p}>✓ {p}</li>)}</ul>
          </div>
        ))}
      </section>
      <section className="bg-ink text-ink-foreground">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="text-3xl font-bold">Register for Trade Pricing</h2>
            <p className="mt-4 max-w-lg text-ink-muted">Submit your company credentials to unlock architectural pricing tier discounts, custom commission options, and direct sample kit orders.</p>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="space-y-4 rounded-2xl border border-ink-line bg-ink-soft p-6">
            {sent ? <p className="py-10 text-center">Thank you — our trade team will be in touch within 2 business days.</p> : <>
              {[["Full Name", "Sarah Jenkins", "text"], ["Studio / Firm Name", "Jenkins Arch Design Studio", "text"], ["Professional Email", "sarah@jenkinsarch.com", "email"]].map(([l, ph, type]) => (
                <label key={l} className="block text-xs uppercase tracking-widest text-ink-muted">{l}
                  <input required type={type} placeholder={ph} className="mt-2 w-full rounded-md border border-ink-line bg-ink px-3 py-2 text-sm normal-case tracking-normal text-ink-foreground" />
                </label>
              ))}
              <button className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground">Submit Application</button>
            </>}
          </form>
        </div>
      </section>
    </Page>
  );
}
