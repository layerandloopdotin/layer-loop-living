import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { fieldValue } from "@/lib/account";
import { formatPrice } from "@/lib/currency";

export const Route = createFileRoute("/_authenticated/admin/coupons")({ component: Coupons });
const input = "mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm";
const label = "block text-[11px] uppercase tracking-widest text-muted-foreground";

function Coupons() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin-coupons"], queryFn: async () => {
    const { data, error } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    if (error) throw error; return data;
  } });
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-coupons"] });
  const create = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget, fd = new FormData(form);
    const code = fieldValue(fd, "code").toUpperCase().replace(/\s/g, "");
    const amount = Number(fieldValue(fd, "amount"));
    if (!/^[A-Z0-9_-]{3,24}$/.test(code)) { toast.error("Code: 3–24 letters or numbers"); return; }
    if (!(amount > 0)) { toast.error("Enter the discount amount"); return; }
    const kind = fieldValue(fd, "kind") === "fixed" ? "fixed" : "percent";
    const date = (k: string) => (fieldValue(fd, k) ? new Date(fieldValue(fd, k)).toISOString() : null);
    const { error } = await supabase.from("coupons").insert({
      code, kind, amount, label: fieldValue(fd, "label") || (kind === "percent" ? `${amount}% off` : `₹${amount} off`),
      min_order: Number(fieldValue(fd, "min")) || 0, starts_at: date("starts"), ends_at: date("ends"),
      usage_limit: fieldValue(fd, "limit") ? Number(fieldValue(fd, "limit")) : null,
    });
    if (error) { toast.error(error.message.includes("duplicate") ? "That code already exists" : "Couldn't save coupon"); return; }
    form.reset(); refresh(); toast.success("Coupon is live");
  };
  const toggle = async (id: string, active: boolean) => { await supabase.from("coupons").update({ active }).eq("id", id); refresh(); };
  const remove = async (id: string) => { if (window.confirm("Delete coupon?")) { await supabase.from("coupons").delete().eq("id", id); refresh(); } };

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold">Coupons</h1>
      <p className="mt-1 text-sm text-muted-foreground">Only active coupons listed here work at cart and checkout.</p>
      <form onSubmit={create} className="mt-6 grid gap-3 rounded-xl bg-card p-5 sm:grid-cols-4">
        <label className={label}>Code<input name="code" required className={`${input} uppercase`} placeholder="DIWALI15" /></label>
        <label className={label}>Type<select name="kind" className={input}><option value="percent">% off</option><option value="fixed">₹ off</option></select></label>
        <label className={label}>Amount<input name="amount" type="number" min={1} required className={input} /></label>
        <label className={label}>Min order (₹)<input name="min" type="number" min={0} className={input} /></label>
        <label className={label}>Starts<input name="starts" type="datetime-local" className={input} /></label>
        <label className={label}>Ends<input name="ends" type="datetime-local" className={input} /></label>
        <label className={label}>Usage limit<input name="limit" type="number" min={1} className={input} placeholder="Unlimited" /></label>
        <label className={label}>Label (shown to shoppers)<input name="label" className={input} placeholder="15% off for Diwali" /></label>
        <button className="rounded-full bg-primary py-2 text-sm font-semibold text-primary-foreground sm:col-span-4">Add coupon</button>
      </form>
      <ul className="mt-6 divide-y divide-border rounded-xl border border-border">
        {q.data?.length === 0 && <li className="p-4 text-sm text-muted-foreground">No coupons yet — shoppers can't use any code until you add one.</li>}
        {q.data?.map((c) => (
          <li key={c.id} className="flex flex-wrap items-center gap-3 p-4 text-sm">
            <span className="font-mono font-semibold">{c.code}</span>
            <span>{c.kind === "percent" ? `${c.amount}%` : formatPrice(Number(c.amount))} off{Number(c.min_order) > 0 && ` · min ${formatPrice(Number(c.min_order))}`}</span>
            <span className="text-xs text-muted-foreground">{c.starts_at ? new Date(c.starts_at).toLocaleDateString("en-IN") : "Now"} → {c.ends_at ? new Date(c.ends_at).toLocaleDateString("en-IN") : "No end"}{c.usage_limit ? ` · limit ${c.usage_limit}` : ""}</span>
            <span className="ml-auto flex items-center gap-3">
              <button onClick={() => toggle(c.id, !c.active)} className={`rounded-full px-3 py-1 text-xs ${c.active ? "bg-primary text-primary-foreground" : "border border-border"}`}>{c.active ? "Live" : "Paused"}</button>
              <button onClick={() => remove(c.id)} className="text-xs text-destructive underline">Delete</button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
