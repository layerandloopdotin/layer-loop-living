// Browser-safe sales maths for the admin dashboard.
import type { OrderItem } from "@/lib/account";

export type SaleOrder = { status: string; total: number | string; created_at: string; items: unknown };
const COUNTED = (s: string) => s !== "cancelled";

export function revenueBetween(orders: SaleOrder[], from: Date, to = new Date()) {
  return orders.filter((o) => COUNTED(o.status) && new Date(o.created_at) >= from && new Date(o.created_at) <= to).reduce((s, o) => s + Number(o.total), 0);
}

export function dailyRevenue(orders: SaleOrder[], days: number, today = new Date()) {
  const out: { day: string; revenue: number; orders: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const list = orders.filter((o) => COUNTED(o.status) && o.created_at.slice(0, 10) === key);
    out.push({ day: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }), revenue: list.reduce((s, o) => s + Number(o.total), 0), orders: list.length });
  }
  return out;
}

export function topProducts(orders: SaleOrder[], n = 5) {
  const m = new Map<string, { name: string; qty: number; revenue: number }>();
  for (const o of orders) if (COUNTED(o.status)) for (const it of o.items as OrderItem[]) {
    const r = m.get(it.slug) ?? { name: it.name, qty: 0, revenue: 0 };
    r.qty += it.qty; r.revenue += it.qty * it.price; m.set(it.slug, r);
  }
  return [...m.values()].sort((a, b) => b.revenue - a.revenue).slice(0, n);
}

export function rates(orders: SaleOrder[]) {
  const n = orders.length || 1;
  const counted = orders.filter((o) => COUNTED(o.status));
  return {
    aov: counted.length ? Math.round(counted.reduce((s, o) => s + Number(o.total), 0) / counted.length) : 0,
    cancelRate: Math.round((orders.filter((o) => o.status === "cancelled").length / n) * 100),
    returnRate: Math.round((orders.filter((o) => ["return_requested", "returned"].includes(o.status)).length / n) * 100),
  };
}
