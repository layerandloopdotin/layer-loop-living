import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { supabase } from "@/integrations/supabase/client";
import { STATUS_LABEL, statusChip } from "@/lib/account";
import { dailyRevenue, rates, revenueBetween, topProducts } from "@/lib/analytics";
import { formatPrice } from "@/lib/currency";

export const Route = createFileRoute("/_authenticated/admin/")({ component: Dashboard });

const card = "rounded-2xl border border-border bg-card p-5";
const TABS = [{ id: "revenue", label: "Revenue" }, { id: "orders", label: "Orders" }, { id: "analytics", label: "Sales analytics" }] as const;

function Dashboard() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("revenue");
  const [range, setRange] = useState(30);
  const q = useQuery({ queryKey: ["admin-orders"], queryFn: async () => {
    const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (error) throw error; return data;
  } });
  const reqs = useQuery({ queryKey: ["admin-requests"], queryFn: async () => {
    const { data, error } = await supabase.from("custom_requests").select("id, summary, status, created_at, estimate_low, estimate_high").eq("status", "requested").order("created_at", { ascending: false });
    if (error) throw error; return data;
  } });
  const orders = q.data ?? [];
  const day = (n: number) => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - n + 1); return d; };
  const fresh = orders.filter((o) => !o.confirmed_at && o.status !== "cancelled").slice(0, 6);
  const r = rates(orders);

  return (
    <div className="max-w-6xl">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className={`${card} mt-6`}>
        <div className="flex items-center justify-between"><p className="font-semibold">New orders & requests</p><Link to="/admin/orders" className="text-xs underline">All orders</Link></div>
        {fresh.length === 0 && !reqs.data?.length && <p className="mt-3 text-sm text-muted-foreground">Nothing new right now.</p>}
        <ul className="mt-3 divide-y divide-border text-sm">
          {fresh.map((o) => <li key={o.id} className="flex items-center justify-between gap-3 py-2"><Link to="/admin/orders" search={{ q: o.number }} className="font-medium hover:underline">#{o.number}</Link><span className="text-muted-foreground">{formatPrice(Number(o.total))} · {new Date(o.created_at).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}</span></li>)}
          {reqs.data?.map((c) => <li key={c.id} className="flex items-center justify-between gap-3 py-2"><Link to="/admin/custom" className="font-medium hover:underline">Custom request</Link><span className="truncate text-muted-foreground">est. {formatPrice(Number(c.estimate_low))}–{formatPrice(Number(c.estimate_high))}</span></li>)}
        </ul>
      </div>

      <div className="mt-6 flex gap-2">
        {TABS.map((t) => <button key={t.id} onClick={() => setTab(t.id)} className={`rounded-full border px-4 py-1.5 text-sm ${tab === t.id ? "border-foreground bg-foreground text-background" : "border-border"}`}>{t.label}</button>)}
      </div>

      {tab === "revenue" && <div className="mt-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[["Today", 1], ["Last 7 days", 7], ["Last 30 days", 30], ["All time", 36500]].map(([l, n]) => (
            <div key={l} className={card}><p className="text-xs text-muted-foreground">{l}</p><p className="mt-2 text-2xl font-bold">{formatPrice(revenueBetween(orders, day(Number(n))))}</p></div>
          ))}
        </div>
        <div className={card}>
          <div className="flex items-center justify-between"><p className="font-semibold">Revenue per day</p>
            <select value={range} onChange={(e) => setRange(Number(e.target.value))} className="rounded-md border border-border bg-background px-2 py-1 text-xs"><option value={7}>7 days</option><option value={30}>30 days</option><option value={90}>90 days</option></select></div>
          <ChartContainer config={{ revenue: { label: "Revenue", color: "var(--primary)" } }} className="mt-4 h-64 w-full">
            <BarChart data={dailyRevenue(orders, range)}><CartesianGrid vertical={false} /><XAxis dataKey="day" tickLine={false} axisLine={false} minTickGap={16} /><ChartTooltip content={<ChartTooltipContent />} /><Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} /></BarChart>
          </ChartContainer>
        </div>
      </div>}

      {tab === "orders" && <div className="mt-6 space-y-6">
        <div className="grid gap-3 md:grid-cols-5">
          {Object.keys(STATUS_LABEL).map((s) => { const n = orders.filter((o) => o.status === s).length; return n ? <Link key={s} to="/admin/orders" search={{ status: s }} className={card}><p className="text-2xl font-bold">{n}</p><p className="text-xs text-muted-foreground">{STATUS_LABEL[s]}</p></Link> : null; })}
        </div>
        <ul className={`${card} divide-y divide-border`}>
          {orders.slice(0, 10).map((o) => <li key={o.id} className="flex items-center justify-between gap-3 py-2 text-sm"><Link to="/admin/orders" search={{ q: o.number }} className="hover:underline">#{o.number}</Link><span className={`rounded-full px-2.5 py-0.5 text-[11px] ${statusChip(o.status)}`}>{STATUS_LABEL[o.status]}</span><span>{formatPrice(Number(o.total))}</span></li>)}
          {orders.length === 0 && <li className="py-2 text-sm text-muted-foreground">No orders yet.</li>}
        </ul>
      </div>}

      {tab === "analytics" && <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="grid grid-cols-3 gap-3 md:col-span-2">
          <div className={card}><p className="text-xs text-muted-foreground">Average order</p><p className="mt-2 text-2xl font-bold">{formatPrice(r.aov)}</p></div>
          <div className={card}><p className="text-xs text-muted-foreground">Cancel rate</p><p className="mt-2 text-2xl font-bold">{r.cancelRate}%</p></div>
          <div className={card}><p className="text-xs text-muted-foreground">Return rate</p><p className="mt-2 text-2xl font-bold">{r.returnRate}%</p></div>
        </div>
        <div className={card}>
          <p className="font-semibold">Top products</p>
          <ul className="mt-3 space-y-2 text-sm">{topProducts(orders).map((p) => <li key={p.name} className="flex justify-between"><span>{p.name} × {p.qty}</span><span>{formatPrice(p.revenue)}</span></li>)}</ul>
        </div>
        <div className={card}>
          <p className="font-semibold">Orders per day</p>
          <ChartContainer config={{ orders: { label: "Orders", color: "var(--primary)" } }} className="mt-4 h-48 w-full">
            <BarChart data={dailyRevenue(orders, 14)}><XAxis dataKey="day" tickLine={false} axisLine={false} minTickGap={16} /><ChartTooltip content={<ChartTooltipContent />} /><Bar dataKey="orders" fill="var(--color-orders)" radius={4} /></BarChart>
          </ChartContainer>
        </div>
      </div>}
    </div>
  );
}
