import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { fieldValue, tradeSchema } from "@/lib/contact";
import { img } from "@/lib/media";
import { telHref, useSite } from "@/lib/site";
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

const field = "mt-2 w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm normal-case tracking-normal text-foreground";
const lbl = "block text-xs uppercase tracking-widest text-muted-foreground";

function Trade() {
  const site = useSite();
  const c = site.content("trade");
  const st = site.content("settings");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const v = (k: string) => fieldValue(f, k);
    const r = tradeSchema.safeParse({
      name: v("name"), company: v("company"), email: v("email"), phone: v("phone"),
      type: v("type"), catalogues: picked, quantity: v("quantity"), message: v("message") || undefined,
    });
    if (!r.success) {
      const errs: Record<string, string> = {};
      r.error.issues.forEach((i) => { errs[String(i.path[0])] ??= i.message; });
      setErrors(errs);
      return;
    }
    setErrors({});
    setBusy(true);
    const { error } = await supabase.from("submissions").insert({ kind: "catalogue", data: r.data });
    setBusy(false);
    if (error) { toast.error("Couldn't send your request — please try again or email us."); return; }
    setSent(true);
  };

  const err = (k: string) => errors[k] && <span className="mt-1 block text-[11px] normal-case tracking-normal text-destructive">{errors[k]}</span>;

  return (
    <Page>
      <div data-world-neutral hidden />
      <DarkHero eyebrow={c.heroEyebrow} title={c.heroTitle}>
        <p className="mt-4 max-w-md text-ink-muted">{c.heroText}</p>
      </DarkHero>

      <section className="bg-ink text-ink-foreground">
      <div className="mx-auto max-w-7xl px-6 pt-20 pb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">{c.partnersEyebrow}</p>
        <h2 className="mt-3 text-3xl font-bold md:text-4xl">{c.partnersTitle}</h2>
      </div>

      <div className="relative">
        {c.partners.map(({ image, name, text }, i) => (
          <div key={name} className="sticky top-0 flex h-[75vh] min-h-[520px] items-center bg-ink" style={{ zIndex: i + 1 }}>
            <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-6 py-10 md:grid-cols-[1.2fr_1fr]">
              <div>
                <span className="font-display text-sm text-ink-muted">{String(i + 1).padStart(2, "0")} / {String(c.partners.length).padStart(2, "0")}</span>
                <h3 className="mt-4 font-display text-5xl font-extrabold uppercase leading-[0.95] md:text-6xl">{name}</h3>
                <p className="mt-6 max-w-md text-lg text-ink-muted">{text}</p>
              </div>
              <div className="group overflow-hidden rounded-2xl border border-ink-line">
                <img src={img(image)} alt={name} loading="lazy" width={1200} height={1408} className="aspect-[4/3] max-h-[55vh] w-full object-cover transition duration-700 group-hover:scale-105" />
              </div>
            </div>
          </div>
        ))}
      </div>
      </section>

      <section className="bg-ink text-ink-foreground">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <h2 className="text-3xl font-bold md:text-4xl">{c.contactTitle}</h2>
          <p className="mt-4 max-w-lg text-ink-muted">{c.contactText}</p>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <a href={`mailto:${st.tradeEmail}`} className="rounded-2xl border border-ink-line bg-ink-soft p-6 transition hover:border-primary">
              <Mail className="h-5 w-5 text-primary" /><p className="mt-4 text-xs uppercase tracking-widest text-ink-muted">Email</p><p className="mt-1">{st.tradeEmail}</p>
            </a>
            <a href={telHref(st.phone)} className="rounded-2xl border border-ink-line bg-ink-soft p-6 transition hover:border-primary">
              <Phone className="h-5 w-5 text-primary" /><p className="mt-4 text-xs uppercase tracking-widest text-ink-muted">Phone / WhatsApp</p><p className="mt-1">{st.phone}</p>
            </a>
            <div className="rounded-2xl border border-ink-line bg-ink-soft p-6">
              <MapPin className="h-5 w-5 text-primary" /><p className="mt-4 text-xs uppercase tracking-widest text-ink-muted">Studio</p><p className="mt-1">{st.studioLocation}</p>
            </div>
          </div>
        </div>
      </section>

      <section id="catalogue" className="mx-auto grid max-w-7xl scroll-mt-20 items-start gap-12 px-6 py-20 md:grid-cols-[1fr_1.3fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">{c.catalogueEyebrow}</p>
          <h2 className="mt-3 text-3xl font-bold md:text-4xl">{c.catalogueTitle}</h2>
          <p className="mt-2 text-lg font-semibold">{c.catalogueSubtitle}</p>
          <p className="mt-4 max-w-md text-muted-foreground">{c.catalogueText}</p>
        </div>
        <form onSubmit={submit} noValidate className="space-y-5 rounded-2xl bg-card p-7">
          {sent ? <p className="py-16 text-center">{c.thankYou}</p> : <>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className={lbl}>Full Name<input name="name" maxLength={100} className={field} />{err("name")}</label>
              <label className={lbl}>Company / Studio<input name="company" maxLength={120} className={field} />{err("company")}</label>
              <label className={lbl}>Email<input name="email" type="email" maxLength={255} className={field} />{err("email")}</label>
              <label className={lbl}>Phone<input name="phone" type="tel" maxLength={20} className={field} />{err("phone")}</label>
              <label className={lbl}>I am a…
                <select name="type" defaultValue="" className={field}><option value="" disabled>Select</option>{c.partners.map((p) => <option key={p.name}>{p.name}</option>)}</select>{err("type")}
              </label>
              <label className={lbl}>Estimated Quantity
                <select name="quantity" defaultValue="" className={field}><option value="" disabled>Select</option>{c.quantities.map((q) => <option key={q}>{q}</option>)}</select>{err("quantity")}
              </label>
            </div>
            <div>
              <p className={lbl}>Catalogues I want</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {c.catalogues.map((cat) => {
                  const on = picked.includes(cat);
                  return <button type="button" key={cat} onClick={() => setPicked(on ? picked.filter((x) => x !== cat) : [...picked, cat])}
                    className={`rounded-full border px-4 py-1.5 text-sm transition ${on ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-foreground"}`}>{cat}</button>;
                })}
              </div>
              {err("catalogues")}
            </div>
            <label className={lbl}>Message (optional)<textarea name="message" rows={4} maxLength={1000} className={field} /></label>
            <button disabled={busy} className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60">{busy ? "Sending…" : c.submitLabel}</button>
          </>}
        </form>
      </section>
    </Page>
  );
}
