import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check, Download, ExternalLink, Printer, Truck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/currency";
import { STATUS_LABEL, STEPS, stepIndex, statusChip, type OrderItem } from "@/lib/account";
import { getOrderTracking } from "@/lib/shiprocket.functions";

export const Route = createFileRoute("/_authenticated/account/orders/$id")({ component: OrderPage });

type Addr = { name?: string; phone?: string; line1?: string; line2?: string; city?: string; state?: string; pin?: string };
const fmt = (d: string) => new Date(d).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

function OrderPage() {
  const { id } = Route.useParams();
  const track = useServerFn(getOrderTracking);
  const q = useQuery({ queryKey: ["order", id], queryFn: async () => {
    const { data, error } = await supabase.from("orders").select("*, order_events(status, note, created_at)").eq("id", id).maybeSingle();
    if (error) throw error; return data;
  } });
  const t = useQuery({ queryKey: ["tracking", id], enabled: !!q.data?.awb, refetchInterval: 5 * 60_000, queryFn: () => track({ data: { orderId: id } }) });

  if (q.isPending) return <p className="text-sm text-muted-foreground">Loading…</p>;
  const o = q.data;
  if (!o) return <p className="text-sm">Order not found. <Link to="/account/orders" className="underline">Back to orders</Link></p>;
  const items = o.items as OrderItem[];
  const addr = (o.address ?? {}) as Addr;
  const step = stepIndex(o.status);
  const events = [...(o.order_events ?? [])].sort((a, b) => a.created_at.localeCompare(b.created_at));
  const when = (s: string) => events.find((e) => e.status === s)?.created_at;

  return (
    <div className="space-y-8 print:space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link to="/account/orders" className="text-xs text-muted-foreground underline print:hidden">← All orders</Link>
          <h2 className="mt-2 font-display text-2xl font-bold">Order #{o.number}</h2>
          <p className="text-sm text-muted-foreground">Placed {fmt(o.created_at)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusChip(o.status)}`}>{STATUS_LABEL[o.status] ?? o.status}</span>
          {o.invoice_url
            ? <a href={o.invoice_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-foreground px-4 py-1.5 text-xs"><Download className="h-3.5 w-3.5" /> Invoice</a>
            : <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-full border border-foreground px-4 py-1.5 text-xs"><Printer className="h-3.5 w-3.5" /> Invoice</button>}
        </div>
      </div>

      <div className="rounded-xl bg-card p-5">
        <p className="flex items-center gap-2 text-sm font-semibold"><Check className="h-4 w-4 text-primary" /> Order confirmed</p>
        <p className="mt-1 text-xs text-muted-foreground">Thank you — your order was confirmed on {fmt(o.created_at)}. Each piece is printed for you, then checked before dispatch.</p>
      </div>

      {step >= 0 ? (
        <ol className="grid gap-4 sm:grid-cols-5">
          {STEPS.map((s, i) => (
            <li key={s} className="flex items-start gap-3 sm:flex-col sm:gap-2">
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs ${i <= step ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground"}`}>{i <= step ? <Check className="h-4 w-4" /> : i + 1}</span>
              <div><p className={`text-sm ${i <= step ? "font-semibold" : "text-muted-foreground"}`}>{STATUS_LABEL[s]}</p>{when(s) && <p className="text-[11px] text-muted-foreground">{fmt(when(s)!)}</p>}</div>
            </li>
          ))}
        </ol>
      ) : (
        <div className="rounded-xl border border-border p-5 text-sm"><p className="font-semibold">{STATUS_LABEL[o.status] ?? o.status}</p>{o.note && <p className="mt-1 text-muted-foreground">{o.note}</p>}</div>
      )}

      <div className="rounded-xl border border-border p-5 print:hidden">
        <p className="flex items-center gap-2 text-sm font-semibold"><Truck className="h-4 w-4 text-primary" /> Tracking</p>
        {!o.awb ? <p className="mt-2 text-sm text-muted-foreground">Tracking details appear once your order is dispatched.</p> : <>
          <p className="mt-2 text-sm">{o.courier ?? "Courier"} · AWB <span className="font-mono">{o.awb}</span>{t.data?.status && <> · {t.data.status}</>}{t.data?.etd && <> · Expected {new Date(t.data.etd).toLocaleDateString("en-IN")}</>}</p>
          {t.data?.scans.length ? <ul className="mt-4 space-y-3 border-l border-border pl-4">{t.data.scans.map((s, i) => <li key={i} className="text-xs"><p className="font-medium">{s.activity}</p><p className="text-muted-foreground">{s.location} · {s.date}</p></li>)}</ul> : null}
          <a href={t.data?.url ?? `https://shiprocket.co/tracking/${o.awb}`} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-xs underline">Track on Shiprocket <ExternalLink className="h-3 w-3" /></a>
        </>}
      </div>

      <div className="grid gap-6 md:grid-cols-[1.5fr_1fr]">
        <ul className="divide-y divide-border border-y border-border">
          {items.map((it, i) => (
            <li key={i} className="flex items-center gap-4 py-4">
              {it.image ? <img src={it.image} alt="" className="h-16 w-16 rounded-lg object-cover" /> : <span className="h-16 w-16 rounded-lg bg-muted" />}
              <div className="flex-1 text-sm"><p className="font-semibold">{it.name}</p>{it.variant && <p className="text-xs text-muted-foreground">{it.variant}</p>}<p className="text-xs text-muted-foreground">Qty {it.qty}</p></div>
              <p className="text-sm">{formatPrice(it.price * it.qty)}</p>
            </li>
          ))}
        </ul>
        <div className="space-y-4 text-sm">
          <dl className="space-y-1.5 rounded-xl bg-card p-5">
            <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>{formatPrice(Number(o.subtotal))}</dd></div>
            {Number(o.discount) > 0 && <div className="flex justify-between"><dt className="text-muted-foreground">Discount</dt><dd>− {formatPrice(Number(o.discount))}</dd></div>}
            <div className="flex justify-between"><dt className="text-muted-foreground">Shipping</dt><dd>{Number(o.shipping) ? formatPrice(Number(o.shipping)) : "Free"}</dd></div>
            <div className="flex justify-between border-t border-border pt-2 font-semibold"><dt>Total</dt><dd>{formatPrice(Number(o.total))}</dd></div>
            {o.payment_label && <p className="pt-2 text-xs text-muted-foreground">Paid with {o.payment_label}</p>}
          </dl>
          {addr.line1 && <div className="rounded-xl border border-border p-5"><p className="text-xs uppercase tracking-widest text-muted-foreground">Delivering to</p><p className="mt-2">{addr.name} · {addr.phone}</p><p className="text-muted-foreground">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}, {addr.city}, {addr.state} {addr.pin}</p></div>}
        </div>
      </div>
    </div>
  );
}
