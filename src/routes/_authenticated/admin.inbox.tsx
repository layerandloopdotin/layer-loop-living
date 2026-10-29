import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Download, Mail, MessageCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { waHref } from "@/lib/site";

export const Route = createFileRoute("/_authenticated/admin/inbox")({
  component: InboxPage,
});

const kinds = { catalogue: "Catalogue request", career: "Job application" } as const;
type Data = Record<string, unknown>;
const str = (v: unknown) => (Array.isArray(v) ? v.join(", ") : v == null ? "" : String(v));

function toCsv(rows: { kind: string; status: string; created_at: string; data: Data }[]) {
  const keys = Array.from(new Set(rows.flatMap((r) => Object.keys(r.data))));
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const head = ["type", "status", "received", ...keys].map(esc).join(",");
  return [head, ...rows.map((r) => [r.kind, r.status, r.created_at, ...keys.map((k) => str(r.data[k]))].map(esc).join(","))].join("\n");
}

function InboxPage() {
  const qc = useQueryClient();
  const [kind, setKind] = useState<"all" | keyof typeof kinds>("all");
  const [status, setStatus] = useState<"all" | "new" | "read" | "replied">("all");
  const q = useQuery({
    queryKey: ["admin", "inbox"],
    queryFn: async () => {
      const { data, error } = await supabase.from("submissions").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data.map((r) => ({ ...r, data: (r.data ?? {}) as Data }));
    },
  });
  const rows = (q.data ?? []).filter((r) => (kind === "all" || r.kind === kind) && (status === "all" || r.status === status));
  const setStatusOf = async (id: string, s: "new" | "read" | "replied") => {
    const { error } = await supabase.from("submissions").update({ status: s }).eq("id", id);
    if (error) toast.error(error.message); else qc.invalidateQueries({ queryKey: ["admin"] });
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this enquiry?")) return;
    const { error } = await supabase.from("submissions").delete().eq("id", id);
    if (error) toast.error(error.message); else qc.invalidateQueries({ queryKey: ["admin"] });
  };
  const exportCsv = () => {
    const blob = new Blob([toCsv(rows)], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `layer-loop-enquiries-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };
  const sel = "rounded-md border border-border bg-background px-3 py-2 text-sm";

  return (
    <div className="max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Inbox</h1>
          <p className="mt-1 text-sm text-muted-foreground">Catalogue requests from the Trade page and job applications from Contact us.</p>
        </div>
        <button onClick={exportCsv} disabled={!rows.length} className="inline-flex items-center gap-2 rounded-full border border-foreground px-4 py-2 text-sm disabled:opacity-40"><Download className="h-4 w-4" /> Export spreadsheet</button>
      </div>
      <div className="mt-6 flex gap-3">
        <select value={kind} onChange={(e) => setKind(e.target.value as typeof kind)} className={sel} aria-label="Type">
          <option value="all">All types</option><option value="catalogue">Catalogue requests</option><option value="career">Job applications</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className={sel} aria-label="Status">
          <option value="all">Any status</option><option value="new">New</option><option value="read">Read</option><option value="replied">Replied</option>
        </select>
      </div>
      <div className="mt-6 space-y-4">
        {rows.map((r) => {
          const d = r.data;
          const phone = str(d["phone"]);
          const email = str(d["email"]);
          return (
            <article key={r.id} className={`rounded-2xl border bg-card p-5 ${r.status === "new" ? "border-primary" : "border-border"}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-primary">{kinds[r.kind as keyof typeof kinds] ?? r.kind}</p>
                  <h2 className="mt-1 text-lg font-semibold">{str(d["name"])}{d["company"] ? ` · ${str(d["company"])}` : ""}</h2>
                  <p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString("en-IN")}</p>
                </div>
                <select value={r.status} onChange={(e) => setStatusOf(r.id, e.target.value as "new")} className={sel} aria-label="Status">
                  <option value="new">New</option><option value="read">Read</option><option value="replied">Replied</option>
                </select>
              </div>
              <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                {Object.entries(d).filter(([k]) => !["name", "company"].includes(k)).map(([k, v]) => (
                  <div key={k} className={k === "message" || k === "offer" ? "sm:col-span-2" : ""}>
                    <dt className="text-xs capitalize text-muted-foreground">{k}</dt>
                    <dd className="whitespace-pre-line">{str(v)}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-4 flex flex-wrap gap-2">
                {phone && <a href={waHref(phone.replace(/^0/, "91"), `Hi ${str(d["name"])}, thanks for reaching out to Layer & Loop.`)} target="_blank" rel="noreferrer" onClick={() => setStatusOf(r.id, "replied")} className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground"><MessageCircle className="h-3.5 w-3.5" /> Reply on WhatsApp</a>}
                {email && <a href={`mailto:${email}`} className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-1.5 text-xs font-semibold"><Mail className="h-3.5 w-3.5" /> Email</a>}
                <button onClick={() => remove(r.id)} className="ml-auto inline-flex items-center gap-1 text-xs text-destructive"><Trash2 className="h-3.5 w-3.5" /> Delete</button>
              </div>
            </article>
          );
        })}
        {q.isSuccess && !rows.length && <p className="text-sm text-muted-foreground">Nothing here yet.</p>}
      </div>
    </div>
  );
}
