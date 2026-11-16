import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { CreditCard, Landmark, Smartphone, Wallet } from "lucide-react";
import { Page } from "@/components/site";
import { supabase } from "@/integrations/supabase/client";
import { addressSchema, fieldValue } from "@/lib/account";
import { unitPrice } from "@/lib/catalog";
import { formatPrice } from "@/lib/currency";
import { cartTotals } from "@/lib/pricing";
import { useShop } from "@/lib/shop";
import { useSite } from "@/lib/site";

export const Route = createFileRoute("/checkout")({
  validateSearch: (s: Record<string, unknown>) => ({ coupon: typeof s.coupon === "string" ? s.coupon : undefined }),
  head: () => ({
    meta: [
      { title: "Checkout — Layer & Loop" },
      { name: "description", content: "Enter delivery details and pay for your Layer & Loop order." },
      { property: "og:title", content: "Checkout — Layer & Loop" },
      { property: "og:description", content: "Secure checkout for Layer & Loop objects." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Checkout,
});

const METHODS = [{ id: "UPI", Icon: Smartphone }, { id: "Card", Icon: CreditCard }, { id: "Net banking", Icon: Landmark }, { id: "Wallet", Icon: Wallet }];
const input = "mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm";
const label = "block text-xs uppercase tracking-widest text-muted-foreground";
const KEYS = ["name", "phone", "line1", "line2", "city", "state", "pin"] as const;
const CHECKOUT_KEY = "ll-checkout";

function Checkout() {
  const { coupon } = Route.useSearch();
  const navigate = useNavigate();
  const { cart } = useShop();
  const site = useSite();
  const [method, setMethod] = useState("UPI");
  const lines = cart.flatMap((c) => { const p = site.bySlug(c.slug); return p ? [{ ...c, p }] : []; });
  const t = cartTotals(lines.reduce((s, l) => s + unitPrice(l.p, l.variant) * l.qty, 0), coupon);
  const session = useQuery({ queryKey: ["checkout-user"], queryFn: async () => (await supabase.auth.getUser()).data.user });
  const saved = useQuery({ queryKey: ["addresses"], enabled: !!session.data, queryFn: async () => (await supabase.from("addresses").select("*").order("is_default", { ascending: false })).data ?? [] });
  const def = saved.data?.[0];

  const pay = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const v = addressSchema.safeParse({ label: "Delivery", ...Object.fromEntries(KEYS.map((k) => [k, fieldValue(fd, k)])) });
    if (!v.success) { toast.error(v.error.issues[0]?.message); return; }
    sessionStorage.setItem(CHECKOUT_KEY, JSON.stringify({ address: v.data, email: fieldValue(fd, "email"), method, total: t.total, items: lines.map((l) => ({ name: l.p.name, qty: l.qty, variant: l.variant })) }));
    navigate({ to: "/payment" });
  };

  if (lines.length === 0) return <Page><section className="mx-auto max-w-xl px-6 py-24 text-center"><p className="text-muted-foreground">Your cart is empty.</p><Link to="/products" className="mt-6 inline-flex rounded-full border border-foreground px-6 py-3 text-sm font-semibold">Browse objects</Link></section></Page>;

  return (
    <Page>
      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-12 md:grid-cols-[1.5fr_1fr]">
        <form id="checkout" onSubmit={pay} key={def?.id ?? "blank"} className="space-y-8">
          <div>
            <h1 className="font-display text-3xl font-bold">Checkout</h1>
            {!session.data && <p className="mt-2 text-sm text-muted-foreground">Checking out as guest. <Link to="/signin" className="underline">Sign in</Link> to use saved addresses and track orders.</p>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <h2 className="font-display text-lg font-semibold sm:col-span-2">Delivery details</h2>
            <label className={label}>Full name<input name="name" defaultValue={def?.name} className={input} autoComplete="name" /></label>
            <label className={label}>Mobile number<input name="phone" defaultValue={def?.phone} inputMode="numeric" maxLength={10} className={input} autoComplete="tel-national" /></label>
            <label className={`${label} sm:col-span-2`}>Email (for the invoice)<input name="email" type="email" defaultValue={session.data?.email ?? ""} className={input} autoComplete="email" /></label>
            <label className={`${label} sm:col-span-2`}>Address line 1<input name="line1" defaultValue={def?.line1} className={input} autoComplete="address-line1" /></label>
            <label className={`${label} sm:col-span-2`}>Address line 2 (optional)<input name="line2" defaultValue={def?.line2 ?? ""} className={input} autoComplete="address-line2" /></label>
            <label className={label}>City<input name="city" defaultValue={def?.city} className={input} /></label>
            <label className={label}>State<input name="state" defaultValue={def?.state} className={input} /></label>
            <label className={label}>PIN code<input name="pin" defaultValue={def?.pin} inputMode="numeric" maxLength={6} className={input} /></label>
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold">Payment method</h2>
            <div role="radiogroup" className="mt-3 grid gap-2 sm:grid-cols-2">
              {METHODS.map(({ id, Icon }) => (
                <button key={id} type="button" role="radio" aria-checked={method === id} onClick={() => setMethod(id)} className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm ${method === id ? "border-foreground bg-card" : "border-border"}`}><Icon className="h-4 w-4 text-primary" />{id}</button>
              ))}
            </div>
          </div>
        </form>
        <aside className="h-fit rounded-2xl bg-card p-6 md:sticky md:top-6">
          <p className="font-display text-lg font-semibold">Order summary</p>
          <ul className="mt-4 space-y-3 text-sm">{lines.map((l) => <li key={l.slug + (l.variant ?? "")} className="flex justify-between gap-3"><span>{l.p.name} × {l.qty}</span><span>{formatPrice(unitPrice(l.p, l.variant) * l.qty)}</span></li>)}</ul>
          <div className="mt-5 space-y-1.5 border-t border-border pt-4 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(t.subtotal)}</span></div>
            {t.discount > 0 && <div className="flex justify-between text-primary"><span>Discount</span><span>− {formatPrice(t.discount)}</span></div>}
            <div className="flex justify-between"><span>Shipping</span><span>{t.shipping === 0 ? "Free" : formatPrice(t.shipping)}</span></div>
          </div>
          <div className="mt-4 flex justify-between border-t border-border pt-4 font-display text-lg font-semibold"><span>Total</span><span>{formatPrice(t.total)}</span></div>
          <button form="checkout" className="mt-6 w-full rounded-full bg-primary py-3.5 text-sm font-semibold text-primary-foreground">Pay now · {formatPrice(t.total)}</button>
        </aside>
      </section>
    </Page>
  );
}
