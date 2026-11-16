import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/currency";
import { inTab, ORDER_TABS, STATUS_LABEL, tabOf, type OrderItem, type OrderTab } from "@/lib/account";

export const Route = createFileRoute("/_authenticated/account/orders/")({ component: Orders });

export const chip = (status: string) => {
  const t = tabOf(status);
  return t === "live" ? "bg-primary text-primary-foreground" : t === "cancelled" ? "bg-destructive/15 text-destructive" : "bg-muted text-foreground";
};

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
              <span className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold ${chip(o.status)}`}>{STATUS_LABEL[o.status] ?? o.status}</span>
            </Link>
          </li>
        ); })}
      </ul>
    </div>
  );
}
