import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Lock, MessageCircle } from "lucide-react";
import { Page } from "@/components/site";
import { formatPrice } from "@/lib/currency";
import { useSite, waHref } from "@/lib/site";

export const Route = createFileRoute("/payment")({
  head: () => ({
    meta: [
      { title: "Redirecting to payment — Layer & Loop" },
      { name: "description", content: "Taking you to secure payment for your Layer & Loop order." },
      { property: "og:title", content: "Redirecting to payment — Layer & Loop" },
      { property: "og:description", content: "Secure payment for your Layer & Loop order." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Pay,
});

type Pending = { method: string; total: number; address: { name: string; city: string; pin: string }; items: { name: string; qty: number; variant?: string; engraving?: { text: string; font: string } }[] };

function Pay() {
  const s = useSite().content("settings");
  const [pending, setPending] = useState<Pending | null>(null);
  const [phase, setPhase] = useState<"redirecting" | "unavailable">("redirecting");
  useEffect(() => {
    try { setPending(JSON.parse(sessionStorage.getItem("ll-checkout") ?? "null")); } catch { /* ignore */ }
    // No payment gateway is connected yet; once one is, hand off to its hosted page here.
    const id = setTimeout(() => setPhase("unavailable"), 2600);
    return () => clearTimeout(id);
  }, []);

  const summary = pending ? `Hi! I'd like to complete payment (${pending.method}) for: ${pending.items.map((i) => `${i.name}${i.variant ? ` (${i.variant})` : ""} × ${i.qty}${i.engraving ? ` [engrave “${i.engraving.text}”, ${i.engraving.font}]` : ""}`).join(", ")}. Total ${formatPrice(pending.total)}. Delivery: ${pending.address.name}, ${pending.address.city} ${pending.address.pin}.` : "Hi! I'd like to complete my order.";

  return (
    <Page>
      <section className="flex min-h-[70vh] items-center justify-center bg-ink px-6 py-20 text-ink-foreground">
        <div className="w-full max-w-md text-center">
          {phase === "redirecting" ? <>
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
            <h1 className="mt-6 font-display text-3xl font-bold">Redirecting to secure payment…</h1>
            <p className="mt-3 text-sm text-ink-muted">Please don't refresh or press back.{pending && <> Paying {formatPrice(pending.total)} by {pending.method}.</>}</p>
            <div className="mx-auto mt-8 h-1 w-48 overflow-hidden rounded-full bg-ink-soft"><div className="h-full w-1/2 animate-pulse rounded-full bg-primary" /></div>
            <p className="mt-6 inline-flex items-center gap-1.5 text-xs text-ink-muted"><Lock className="h-3.5 w-3.5" /> Encrypted, secure checkout</p>
          </> : <>
            <Lock className="mx-auto h-10 w-10 text-primary" />
            <h1 className="mt-6 font-display text-3xl font-bold">Online payment opens soon</h1>
            <p className="mt-3 text-sm text-ink-muted">Our payment gateway isn't live yet. Send us your order on WhatsApp and we'll share a secure payment link right away.</p>
            {s.whatsapp && <a href={waHref(s.whatsapp, summary)} target="_blank" rel="noreferrer" className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"><MessageCircle className="h-4 w-4" /> Complete on WhatsApp</a>}
            <div className="mt-4"><Link to="/cart" className="text-xs text-ink-muted underline">Back to cart</Link></div>
          </>}
        </div>
      </section>
    </Page>
  );
}
