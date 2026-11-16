import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { fieldValue } from "@/lib/account";
import { formatPrice } from "@/lib/currency";
import { waHref } from "@/lib/site";

export const Route = createFileRoute("/_authenticated/admin/custom")({ component: CustomOrders });

const STATUS: Record<string, string> = { requested: "Awaiting quote", quoted: "Quoted", accepted: "Accepted", declined: "Declined" };
const input = "mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm";
type Contact = { name?: string; phone?: string; email?: string; note?: string; address?: { pin?: string } };

function CustomOrders() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin-requests-all"], queryFn: async () => {
    const { data, error } = await supabase.from("custom_requests").select("*").order("created_at", { ascending: false });
    if (error) throw error; return data;
  } });
  const refresh = () => { qc.invalidateQueries({ queryKey: ["admin-requests-all"] }); qc.invalidateQueries({ queryKey: ["admin-requests"] }); };

  const quote = async (id: string, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const price = Number(fieldValue(fd, "quote"));
    if (!(price > 0)) { toast.error("Enter the exact price"); return; }
    const { error } = await supabase.from("custom_requests").update({ quote: price, quote_note: fieldValue(fd, "note") || null, status: "quoted" }).eq("id", id);
    if (error) { toast.error("Couldn't send quote"); return; }
    toast.success("Quote sent"); refresh();
  };
  const decline = async (id: string) => { await supabase.from("custom_requests").update({ status: "declined" }).eq("id", id); refresh(); };

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold">Custom orders</h1>
      <p className="mt-1 text-sm text-muted-foreground">Designs requested from the Custom studio. Set the exact price — signed-in customers accept it from their account; for guests, share it on WhatsApp.</p>
      {q.data?.length === 0 && <p className="mt-6 text-sm text-muted-foreground">No requests yet.</p>}
      <ul className="mt-6 space-y-4">
        {q.data?.map((r) => { const c = r.contact as Contact; return (
          <li key={r.id} className="rounded-xl border border-border p-5 text-sm">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-semibold">{c.name || "Customer"}</span>
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold">{STATUS[r.status] ?? r.status}</span>
              <span className="text-muted-foreground">{c.phone} {c.email && `· ${c.email}`} · PIN {c.address?.pin} · {new Date(r.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
              {!r.user_id && <span className="text-[11px] text-muted-foreground">Guest</span>}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{r.summary}</p>
            {c.note && <p className="mt-1 text-xs">Note: {c.note}</p>}
            <p className="mt-2">Estimate {formatPrice(Number(r.estimate_low))} – {formatPrice(Number(r.estimate_high))}{r.quote != null && <> · <b>Quoted {formatPrice(Number(r.quote))}</b></>}</p>
            {(r.status === "requested" || r.status === "quoted") && (
              <form onSubmit={(e) => quote(r.id, e)} className="mt-4 grid gap-3 sm:grid-cols-[160px_1fr_auto_auto]">
                <label className="text-[11px] uppercase tracking-widest text-muted-foreground">Exact price (₹)<input name="quote" type="number" min={1} defaultValue={r.quote ?? Math.round((Number(r.estimate_low) + Number(r.estimate_high)) / 2)} className={input} /></label>
                <label className="text-[11px] uppercase tracking-widest text-muted-foreground">Note to customer<input name="note" defaultValue={r.quote_note ?? ""} placeholder="e.g. includes warm LED kit, ships in 7 days" className={input} /></label>
                <button className="self-end rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">{r.status === "quoted" ? "Update quote" : "Send quote"}</button>
                <button type="button" onClick={() => decline(r.id)} className="self-end rounded-full border border-border px-4 py-2 text-sm">Decline</button>
              </form>
            )}
            {c.phone && r.quote != null && !r.user_id && <a href={waHref(`91${c.phone}`, `Hi ${c.name ?? ""}, your Layer & Loop custom design is ${formatPrice(Number(r.quote))}. ${r.quote_note ?? ""} Reply to confirm!`)} target="_blank" rel="noreferrer" className="mt-3 inline-flex text-xs underline">Send quote on WhatsApp</a>}
          </li>
        ); })}
      </ul>
    </div>
  );
}
