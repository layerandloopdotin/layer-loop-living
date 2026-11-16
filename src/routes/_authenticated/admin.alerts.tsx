import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { fieldValue } from "@/lib/account";

export const Route = createFileRoute("/_authenticated/admin/alerts")({ component: Alerts });
const input = "mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm";

function Alerts() {
  const qc = useQueryClient();
  const settings = useQuery({ queryKey: ["admin-settings"], queryFn: async () => (await supabase.from("admin_settings").select("*").maybeSingle()).data });
  const list = useQuery({ queryKey: ["admin-notifications"], queryFn: async () => (await supabase.from("admin_notifications").select("*").order("created_at", { ascending: false }).limit(50)).data ?? [] });
  const save = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const { error } = await supabase.from("admin_settings").upsert({ id: true, notify_email: fieldValue(fd, "email") || null, notify_whatsapp: fieldValue(fd, "whatsapp").replace(/\D/g, "") || null, email_on: fd.get("email_on") === "on", whatsapp_on: fd.get("whatsapp_on") === "on" });
    if (error) toast.error("Couldn't save"); else { toast.success("Alert settings saved"); qc.invalidateQueries({ queryKey: ["admin-settings"] }); }
  };
  const readAll = async () => { await supabase.from("admin_notifications").update({ read_at: new Date().toISOString() }).is("read_at", null); qc.invalidateQueries({ queryKey: ["admin-notifications"] }); };
  const s = settings.data;
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold">Alerts</h1>
      {s && <form onSubmit={save} className="mt-6 grid gap-4 rounded-xl bg-card p-5 sm:grid-cols-2">
        <label className="text-[11px] uppercase tracking-widest text-muted-foreground">Email for new orders<input name="email" type="email" defaultValue={s.notify_email ?? ""} className={input} /></label>
        <label className="text-[11px] uppercase tracking-widest text-muted-foreground">WhatsApp number for new orders<input name="whatsapp" inputMode="numeric" defaultValue={s.notify_whatsapp ?? ""} placeholder="9876543210" className={input} /></label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="email_on" defaultChecked={s.email_on} /> Email alerts</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="whatsapp_on" defaultChecked={s.whatsapp_on} /> WhatsApp alerts</label>
        <button className="rounded-full bg-primary py-2 text-sm font-semibold text-primary-foreground sm:col-span-2">Save</button>
      </form>}
      <div className="mt-8 flex items-center justify-between"><h2 className="font-semibold">Recent</h2><button onClick={readAll} className="text-xs underline">Mark all read</button></div>
      <ul className="mt-3 divide-y divide-border rounded-xl border border-border">
        {list.data?.length === 0 && <li className="p-4 text-sm text-muted-foreground">No alerts yet.</li>}
        {list.data?.map((n) => (
          <li key={n.id} className={`flex items-center justify-between gap-3 p-3 text-sm ${n.read_at ? "text-muted-foreground" : "font-medium"}`}>
            <Link to={n.kind === "custom" ? "/admin/custom" : "/admin/orders"}>{n.title}</Link>
            <span className="shrink-0 text-xs">{new Date(n.created_at).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
