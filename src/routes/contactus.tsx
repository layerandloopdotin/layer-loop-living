import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowUpRight, Clock, Mail, MapPin, Phone } from "lucide-react";
import storeImg from "@/assets/store-1.jpg";
import { DarkHero, Page } from "@/components/site";
import { careersSchema, roles } from "@/lib/contact";

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

const directions =
  "https://www.google.com/maps/search/?api=1&query=12+Linking+Road+Bandra+West+Mumbai";

const channels = [
  {
    icon: Mail,
    label: "Email",
    value: "hello@layerandloop.in",
    note: "Orders, custom pieces, anything at all.",
    href: "mailto:hello@layerandloop.in",
  },
  {
    icon: Phone,
    label: "Phone / WhatsApp",
    value: "+91 98000 00000",
    note: "Tue – Sun, 11am – 8pm.",
    href: "tel:+919800000000",
  },
  {
    icon: MapPin,
    label: "Post",
    value: "12 Linking Road, Bandra West, Mumbai 400050",
    note: "Returns, couriers and material samples.",
  },
];

const field =
  "mt-2 w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm normal-case tracking-normal text-foreground placeholder:text-muted-foreground";
const lbl = "block text-xs uppercase tracking-widest text-muted-foreground";

function Contact() {
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const r = careersSchema.safeParse({
      name: f.get("name"),
      email: f.get("email"),
      phone: f.get("phone"),
      role: f.get("role"),
      portfolio: f.get("portfolio") || undefined,
      offer: f.get("offer"),
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
      <DarkHero eyebrow="Contact" title="Say hello, or come by.">
        <p className="mt-4 max-w-md text-ink-muted">
          Questions about an object, an order or a whole space — every message lands with a
          person, not a queue.
        </p>
      </DarkHero>

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-[1fr_1.1fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">The Store</p>
          <h2 className="mt-3 text-3xl font-bold md:text-4xl">Come and see them in person.</h2>
          <p className="mt-5 max-w-md text-muted-foreground">
            Our shop and print studio sit on Linking Road in Bandra West. Run a hand over the
            layer lines, watch a lamp being printed in the window, or collect an order the same
            day.
          </p>

          <div className="mt-8 border-t border-border pt-6">
            <p className="font-display text-lg font-semibold">Layer &amp; Loop Objects</p>
            <p className="mt-1 text-muted-foreground">
              12 Linking Road, Bandra West
              <br />
              Mumbai 400050, India
            </p>
            <p className="mt-4 flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-primary" />
              Tue – Sun, 11am – 8pm · closed Mondays
            </p>
            <a
              href={directions}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-foreground px-5 py-2.5 text-sm font-medium transition-colors hover:bg-foreground hover:text-background"
            >
              Get directions <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        <img
          src={storeImg}
          alt="Inside the Layer & Loop store in Bandra West, Mumbai"
          width={1024}
          height={1280}
          className="aspect-[4/5] w-full rounded-2xl object-cover"
        />
      </section>

      <section className="bg-ink text-ink-foreground">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <h2 className="text-3xl font-bold md:text-4xl">Reach us directly</h2>
          <p className="mt-4 max-w-lg text-ink-muted">
            Write, call or send a parcel — we usually reply within a day.
          </p>
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
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Work with us
          </p>
          <h2 className="mt-3 text-3xl font-bold md:text-4xl">Want to build with us?</h2>
          <p className="mt-4 max-w-md text-muted-foreground">
            We keep the studio small and hire rarely. Printer, designer, shop floor or film —
            tell us who you are and what you would bring to the bench.
          </p>
          <p className="mt-6 text-xs text-muted-foreground">
            Every note is read by a person. Expect a reply within a week.
          </p>
        </div>

        <form onSubmit={submit} noValidate className="space-y-5 rounded-2xl bg-card p-7">
          {sent ? (
            <p className="py-16 text-center">
              Thank you — your note is with us. We'll come back to you within a week.
            </p>
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
                  <select name="role" defaultValue="" className={field}>
                    <option value="" disabled>
                      Select
                    </option>
                    {roles.map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
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
              <button className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground">
                Send your application
              </button>
            </>
          )}
        </form>
      </section>
    </Page>
  );
}
