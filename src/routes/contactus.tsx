import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowUpRight, Clock, Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { img } from "@/lib/media";
import { telHref, useSite } from "@/lib/site";
import { DarkHero, Page } from "@/components/site";
import { careersSchema, fieldValue } from "@/lib/contact";

export const Route = createFileRoute("/contactus")({
  head: () => ({
    meta: [
      { title: "Contact Us — Layer & Loop, Bandra West" },
      {
        name: "description",
        content:
          "Visit the Layer & Loop store on Linking Road, Bandra West, Mumbai. Email, phone and WhatsApp, and a short form to apply to the studio.",
      },
      { property: "og:title", content: "Contact Us — Layer & Loop" },
      {
        property: "og:description",
        content: "Our store in Bandra West, our email and phone, and a quick way to apply to the studio.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/contactus" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/contactus" }],
  }),
  component: Contact,
});

const field =
  "mt-2 w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm normal-case tracking-normal text-foreground placeholder:text-muted-foreground";
const lbl = "block text-xs uppercase tracking-widest text-muted-foreground";

function Contact() {
  const site = useSite();
  const c = site.content("contact");
  const st = site.content("settings");
  const channels = [
    { icon: Mail, label: "Email", value: st.email, note: c.emailNote, href: `mailto:${st.email}` },
    { icon: Phone, label: "Phone / WhatsApp", value: st.phone, note: c.phoneNote, href: telHref(st.phone) },
    { icon: MapPin, label: "Post", value: st.storeAddress.replace(/\n/g, ", "), note: c.postNote, href: undefined },
  ];
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const r = careersSchema.safeParse({
      name: fieldValue(f, "name"),
      email: fieldValue(f, "email"),
      phone: fieldValue(f, "phone"),
      role: fieldValue(f, "role"),
      portfolio: fieldValue(f, "portfolio") || undefined,
      offer: fieldValue(f, "offer"),
    });
    if (!r.success) {
      const errs: Record<string, string> = {};
      r.error.issues.forEach((i) => {
        errs[String(i.path[0])] ??= i.message;
      });
      setErrors(errs);
      return;
    }
    setErrors({});
    setBusy(true);
    const { error } = await supabase.from("submissions").insert({ kind: "career", data: r.data });
    setBusy(false);
    if (error) { toast.error("Couldn't send your application — please try again or email us."); return; }
    setSent(true);
  };

  const err = (k: string) =>
    errors[k] && (
      <span className="mt-1 block text-[11px] normal-case tracking-normal text-destructive">
        {errors[k]}
      </span>
    );

  return (
    <Page>
      <DarkHero eyebrow={c.heroEyebrow} title={c.heroTitle}>
        <p className="mt-4 max-w-md text-ink-muted">{c.heroText}</p>
      </DarkHero>

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-[1fr_1.1fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">{c.storeEyebrow}</p>
          <h2 className="mt-3 text-3xl font-bold md:text-4xl">{c.storeTitle}</h2>
          <p className="mt-5 max-w-md whitespace-pre-line text-muted-foreground">{c.storeText}</p>

          <div className="mt-8 border-t border-border pt-6">
            <p className="font-display text-lg font-semibold">{st.storeName}</p>
            <p className="mt-1 whitespace-pre-line text-muted-foreground">{st.storeAddress}</p>
            <p className="mt-4 flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-primary" />
              {st.storeHours}
            </p>
            <a
              href={st.mapUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-foreground px-5 py-2.5 text-sm font-medium transition-colors hover:bg-foreground hover:text-background"
            >
              {c.directionsLabel} <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        <img
          src={img(c.storeImage)}
          alt={c.storeTitle}
          width={1024}
          height={1280}
          className="aspect-[4/5] w-full rounded-2xl object-cover"
        />
      </section>

      <section className="bg-ink text-ink-foreground">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <h2 className="text-3xl font-bold md:text-4xl">{c.reachTitle}</h2>
          <p className="mt-4 max-w-lg text-ink-muted">{c.reachText}</p>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {channels.map(({ icon: Icon, label, value, note, href }) => {
              const inner = (
                <>
                  <Icon className="h-5 w-5 text-primary" />
                  <p className="mt-4 text-xs uppercase tracking-widest text-ink-muted">{label}</p>
                  <p className="mt-1">{value}</p>
                  <p className="mt-2 text-xs text-ink-muted">{note}</p>
                </>
              );
              return href ? (
                <a
                  key={label}
                  href={href}
                  className="rounded-2xl border border-ink-line bg-ink-soft p-6 transition hover:border-primary"
                >
                  {inner}
                </a>
              ) : (
                <div
                  key={label}
                  className="rounded-2xl border border-ink-line bg-ink-soft p-6"
                >
                  {inner}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl scroll-mt-20 items-start gap-12 px-6 py-20 md:grid-cols-[1fr_1.3fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">{c.careersEyebrow}</p>
          <h2 className="mt-3 text-3xl font-bold md:text-4xl">{c.careersTitle}</h2>
          <p className="mt-4 max-w-md whitespace-pre-line text-muted-foreground">{c.careersText}</p>
          <p className="mt-6 text-xs text-muted-foreground">{c.careersNote}</p>
        </div>

        <form onSubmit={submit} noValidate className="space-y-5 rounded-2xl bg-card p-7">
          {sent ? (
            <p className="py-16 text-center">{c.thankYou}</p>
          ) : (
            <>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className={lbl}>
                  Full Name
                  <input name="name" maxLength={100} className={field} />
                  {err("name")}
                </label>
                <label className={lbl}>
                  Role you're applying for
                  <input name="role" maxLength={100} placeholder="e.g. Print technician, store lead, designer" className={field} />
                  {err("role")}
                </label>
                <label className={lbl}>
                  Email
                  <input name="email" type="email" maxLength={255} className={field} />
                  {err("email")}
                </label>
                <label className={lbl}>
                  Phone / WhatsApp
                  <input name="phone" type="tel" maxLength={20} className={field} />
                  {err("phone")}
                </label>
              </div>
              <label className={lbl}>
                Portfolio or LinkedIn (optional)
                <input name="portfolio" maxLength={300} className={field} />
                {err("portfolio")}
              </label>
              <label className={lbl}>
                What can you offer us?
                <textarea name="offer" rows={4} maxLength={800} className={field} />
                {err("offer")}
              </label>
              <button disabled={busy} className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60">{busy ? "Sending…" : c.submitLabel}</button>
            </>
          )}
        </form>
      </section>
    </Page>
  );
}
