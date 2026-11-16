import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { notifyNewRequest } from "@/lib/notify.functions";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/currency";
import { inTab, ORDER_TABS, statusChip, STATUS_LABEL, type OrderItem, type OrderTab } from "@/lib/account";

export const Route = createFileRoute("/_authenticated/account/orders/")({ component: Orders });

function Orders() {
  const [tab, setTab] = useState<OrderTab>("all");
  const q = useQuery({ queryKey: ["my-orders"], queryFn: async () => {
    const { data, error } = await supabase.from("orders").select("id, number, status, items, total, created_at").order("created_at", { ascending: false });
    if (error) throw error; return data;
  } });
  const list = (q.data ?? []).filter((o) => inTab(o.status, tab));
  return (
    <div>
      <h2 className="font-display text-xl font-bold">My orders</h2>
      <div className="-mx-6 mt-4 flex gap-2 overflow-x-auto px-6 md:mx-0 md:px-0">
        {ORDER_TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`shrink-0 rounded-full border px-4 py-1.5 text-sm ${tab === t.id ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground"}`}>{t.label}</button>
        ))}
      </div>
      {q.isPending && <p className="mt-6 text-sm text-muted-foreground">Loading…</p>}
      {q.data && list.length === 0 && <div className="mt-6 rounded-xl bg-card p-8 text-center text-sm text-muted-foreground">No orders here yet. <Link to="/products" className="underline">Start shopping</Link></div>}
      <ul className="mt-6 space-y-4">
        {list.map((o) => { const items = o.items as OrderItem[]; return (
          <li key={o.id}>
            <Link to="/account/orders/$id" params={{ id: o.id }} className="flex items-center gap-4 rounded-xl border border-border p-4 transition-colors hover:border-foreground">
              <div className="flex -space-x-3">{items.slice(0, 3).map((it, i) => it.image ? <img key={i} src={it.image} alt="" className="h-14 w-14 rounded-lg border-2 border-background object-cover" /> : <span key={i} className="h-14 w-14 rounded-lg border-2 border-background bg-muted" />)}</div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">#{o.number}</p>
                <p className="truncate text-xs text-muted-foreground">{items.map((i) => i.name).join(", ")}</p>
                <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString("en-IN", { dateStyle: "medium" })} · {formatPrice(Number(o.total))}</p>
              </div>
              <span className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold ${statusChip(o.status)}`}>{STATUS_LABEL[o.status] ?? o.status}</span>
            </Link>
          </li>
        ); })}
      </ul>
      <CustomRequests />
    </div>
  );
}

const REQ_LABEL: Record<string, string> = { requested: "Awaiting quote", quoted: "Quote ready", accepted: "Accepted", declined: "Declined" };

function CustomRequests() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const q = useQuery({ queryKey: ["my-requests"], queryFn: async () => {
    const { data, error } = await supabase.from("custom_requests").select("id, summary, estimate_low, estimate_high, quote, quote_note, status, created_at").order("created_at", { ascending: false });
    if (error) throw error; return data;
  } });
  const accept = async (id: string) => {
    const { data, error } = await supabase.rpc("accept_custom_quote", { _id: id });
    if (error || !data) { toast.error("Couldn't accept the quote"); return; }
    notifyNewRequest({ data: { kind: "order", id: data } }).catch(() => {});
    qc.invalidateQueries();
    toast.success("Quote accepted — your order is in production");
    navigate({ to: "/account/orders/$id", params: { id: data } });
  };
  if (!q.data?.length) return null;
  return (
    <div className="mt-12">
      <h3 className="font-display text-lg font-bold">Custom requests</h3>
      <ul className="mt-4 space-y-3">
        {q.data.map((r) => (
          <li key={r.id} className="rounded-xl border border-border p-4 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold">Custom design · {new Date(r.created_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}</span>
              <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${r.status === "quoted" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{REQ_LABEL[r.status] ?? r.status}</span>
            </div>
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{r.summary}</p>
            <p className="mt-2 text-xs">Estimate {formatPrice(Number(r.estimate_low))} – {formatPrice(Number(r.estimate_high))}</p>
            {r.quote != null && <div className="mt-3 rounded-lg bg-card p-3">
              <p className="font-semibold">Your price: {formatPrice(Number(r.quote))}</p>
              {r.quote_note && <p className="mt-1 text-xs text-muted-foreground">{r.quote_note}</p>}
              {r.status === "quoted" && <button onClick={() => accept(r.id)} className="mt-3 rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground">Accept quote & confirm order</button>}
            </div>}
          </li>
        ))}
      </ul>
    </div>
  );
}
