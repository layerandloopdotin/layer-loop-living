import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ALL_STATUSES, STATUS_LABEL, statusChip, fieldValue, type OrderItem } from "@/lib/account";
import { formatPrice } from "@/lib/currency";
import { useSite } from "@/lib/site";

export const Route = createFileRoute("/_authenticated/admin/orders")({ component: AdminOrders });

const input = "mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm";
const label = "block text-[11px] uppercase tracking-widest text-muted-foreground";

function AdminOrders() {
  const qc = useQueryClient();
  const site = useSite();
  const [creating, setCreating] = useState(false);
  const orders = useQuery({ queryKey: ["admin-orders"], queryFn: async () => {
    const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (error) throw error; return data;
  } });
  const customers = useQuery({ queryKey: ["admin-customers"], queryFn: async () => {
    const { data, error } = await supabase.from("profiles").select("id, full_name, email, phone").order("created_at", { ascending: false });
    if (error) throw error; return data;
  } });
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-orders"] });
  const who = (uid: string) => { const c = customers.data?.find((x) => x.id === uid); return c?.full_name || c?.email || c?.phone || uid.slice(0, 8); };

  const update = async (id: string, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const { error } = await supabase.from("orders").update({
      status: fieldValue(fd, "status"), courier: fieldValue(fd, "courier") || null, awb: fieldValue(fd, "awb") || null,
      invoice_url: fieldValue(fd, "invoice_url") || null, note: fieldValue(fd, "note") || null,
    }).eq("id", id);
    if (error) return toast.error("Couldn't update order");
    toast.success("Order updated"); refresh();
  };

  const create = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const p = site.bySlug(fieldValue(fd, "product"));
    const qty = Math.max(1, Number(fieldValue(fd, "qty")) || 1);
    const user_id = fieldValue(fd, "customer");
    if (!p || !user_id) return toast.error("Pick a customer and a product");
    const items: OrderItem[] = [{ slug: p.slug, name: p.name, qty, price: p.price, image: p.image }];
    const subtotal = p.price * qty;
    const { error } = await supabase.from("orders").insert({ user_id, items, subtotal, total: subtotal, payment_label: fieldValue(fd, "payment") || null });
    if (error) return toast.error("Couldn't create order");
    setCreating(false); refresh(); toast.success("Order created");
  };

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Orders</h1>
        <button onClick={() => setCreating(!creating)} className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">{creating ? "Close" : "New order"}</button>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">Update status, courier and AWB — customers see changes on their order page. Tracking pulls from Shiprocket once an AWB is set.</p>

      {creating && (
        <form onSubmit={create} className="mt-6 grid gap-3 rounded-xl bg-card p-5 sm:grid-cols-4">
          <label className={`${label} sm:col-span-2`}>Customer<select name="customer" className={input} defaultValue=""><option value="" disabled>Choose…</option>{customers.data?.map((c) => <option key={c.id} value={c.id}>{c.full_name || c.email || c.phone}</option>)}</select></label>
          <label className={label}>Product<select name="product" className={input}>{site.products.map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}</select></label>
          <label className={label}>Qty<input name="qty" type="number" min={1} defaultValue={1} className={input} /></label>
          <label className={`${label} sm:col-span-3`}>Payment label<input name="payment" placeholder="UPI" className={input} /></label>
          <button className="self-end rounded-full bg-foreground py-2 text-sm text-background">Create</button>
        </form>
      )}

      <ul className="mt-6 space-y-4">
        {orders.data?.length === 0 && <p className="text-sm text-muted-foreground">No orders yet.</p>}
        {orders.data?.map((o) => (
          <li key={o.id} className="rounded-xl border border-border p-5">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="font-semibold">#{o.number}</span>
              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusChip(o.status)}`}>{STATUS_LABEL[o.status]}</span>
              <span className="text-muted-foreground">{who(o.user_id)} · {formatPrice(Number(o.total))} · {new Date(o.created_at).toLocaleDateString("en-IN")}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{(o.items as OrderItem[]).map((i) => `${i.name} × ${i.qty}`).join(", ")}</p>
            <form onSubmit={(e) => update(o.id, e)} className="mt-4 grid gap-3 sm:grid-cols-6">
              <label className={label}>Status<select name="status" defaultValue={o.status} className={input}>{ALL_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}</select></label>
              <label className={label}>Courier<input name="courier" defaultValue={o.courier ?? ""} className={input} /></label>
              <label className={label}>AWB<input name="awb" defaultValue={o.awb ?? ""} className={input} /></label>
              <label className={`${label} sm:col-span-2`}>Invoice link<input name="invoice_url" type="url" defaultValue={o.invoice_url ?? ""} className={input} /></label>
              <button className="self-end rounded-full border border-foreground py-2 text-sm">Save</button>
              <label className={`${label} sm:col-span-6`}>Note to customer<input name="note" defaultValue={o.note ?? ""} className={input} /></label>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
