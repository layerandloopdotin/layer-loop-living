import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { addressSchema, fieldValue } from "@/lib/account";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_authenticated/account/addresses")({ component: Addresses });

type Address = Tables<"addresses">;
const input = "mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm";
const label = "block text-xs uppercase tracking-widest text-muted-foreground";
const KEYS = ["label", "name", "phone", "line1", "line2", "city", "state", "pin"] as const;

const addressesQuery = { queryKey: ["addresses"], queryFn: async () => {
  const { data, error } = await supabase.from("addresses").select("*").order("is_default", { ascending: false }).order("created_at");
  if (error) throw error; return data;
} };

function Addresses() {
  const qc = useQueryClient();
  const q = useQuery(addressesQuery);
  const [editing, setEditing] = useState<Address | "new" | null>(null);
  const refresh = () => qc.invalidateQueries({ queryKey: ["addresses"] });

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const v = addressSchema.safeParse(Object.fromEntries(KEYS.map((k) => [k, fieldValue(fd, k)])));
    if (!v.success) { toast.error(v.error.issues[0]?.message); return; }
    const first = (q.data?.length ?? 0) === 0;
    const { error } = editing && editing !== "new"
      ? await supabase.from("addresses").update(v.data).eq("id", editing.id)
      : await supabase.from("addresses").insert({ ...v.data, is_default: first });
    if (error) { toast.error("Couldn't save address"); return; }
    setEditing(null); refresh(); toast.success("Address saved");
  };

  const makeDefault = async (id: string) => {
    await supabase.from("addresses").update({ is_default: false }).neq("id", id);
    await supabase.from("addresses").update({ is_default: true }).eq("id", id);
    refresh();
  };
  const remove = async (id: string) => { await supabase.from("addresses").delete().eq("id", id); refresh(); };

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-xl font-bold">Saved addresses</h2>
        {!editing && <button onClick={() => setEditing("new")} className="inline-flex items-center gap-1.5 rounded-full border border-foreground px-4 py-2 text-sm"><Plus className="h-4 w-4" /> Add address</button>}
      </div>

      {editing && (
        <form onSubmit={submit} className="mt-6 grid gap-4 rounded-xl bg-card p-5 sm:grid-cols-2">
          {([["label", "Label (Home, Work…)"], ["name", "Full name"], ["phone", "Mobile number"], ["pin", "PIN code"], ["line1", "Address line 1"], ["line2", "Address line 2 (optional)"], ["city", "City"], ["state", "State"]] as const).map(([k, l]) => (
            <label key={k} className={`${label} ${k.startsWith("line") ? "sm:col-span-2" : ""}`}>{l}
              <input name={k} defaultValue={editing !== "new" ? (editing[k] ?? "") : k === "label" ? "Home" : ""} className={input} inputMode={k === "phone" || k === "pin" ? "numeric" : undefined} />
            </label>
          ))}
          <div className="flex gap-3 sm:col-span-2">
            <button className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground">Save</button>
            <button type="button" onClick={() => setEditing(null)} className="rounded-full border border-border px-6 py-2.5 text-sm">Cancel</button>
          </div>
        </form>
      )}

      {q.data?.length === 0 && !editing && <p className="mt-6 text-sm text-muted-foreground">No saved addresses yet.</p>}
      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {q.data?.map((a) => (
          <li key={a.id} className="rounded-xl border border-border p-5 text-sm">
            <p className="flex items-center gap-2 font-semibold">{a.label}{a.is_default && <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] uppercase text-primary-foreground">Default</span>}</p>
            <p className="mt-2">{a.name} · {a.phone}</p>
            <p className="text-muted-foreground">{a.line1}{a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} {a.pin}</p>
            <div className="mt-4 flex gap-4 text-xs underline">
              <button onClick={() => setEditing(a)}>Edit</button>
              {!a.is_default && <button onClick={() => makeDefault(a.id)}>Set default</button>}
              <button onClick={() => remove(a.id)} className="text-destructive">Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
