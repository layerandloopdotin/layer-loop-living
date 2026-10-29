import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ImageInput, inputCls, RowTools } from "@/components/admin/fields";

export const Route = createFileRoute("/_authenticated/admin/taxonomy")({
  component: Taxonomy,
});

type Row = { id: string; name: string; sort: number; image?: string };

function Taxonomy() {
  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="text-3xl font-bold">Categories &amp; spaces</h1>
        <p className="mt-1 text-sm text-muted-foreground">These drive the filters on the products page, the footer links and the homepage category tiles. Categories without a photo don't appear as homepage tiles.</p>
      </div>
      <Editor table="categories" title="Categories" withImage />
      <Editor table="spaces" title="Spaces" />
    </div>
  );
}

function Editor({ table, title, withImage }: { table: "categories" | "spaces"; title: string; withImage?: boolean }) {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["admin", table],
    queryFn: async () => ((await supabase.from(table).select("*").order("sort")).data ?? []) as Row[],
  });
  const [name, setName] = useState("");
  const refresh = () => { qc.invalidateQueries({ queryKey: ["admin"] }); qc.invalidateQueries({ queryKey: ["site"] }); };
  const patch = async (id: string, p: Partial<Row>) => {
    const { error } = await supabase.from(table).update(p).eq("id", id);
    if (error) toast.error(error.message); else refresh();
  };
  const add = async () => {
    if (!name.trim()) return;
    const { error } = await supabase.from(table).insert({ name: name.trim(), sort: (q.data?.length ?? 0) + 1 });
    if (error) return toast.error(error.message);
    setName(""); refresh();
  };
  const remove = async (r: Row) => {
    if (!confirm(`Delete “${r.name}”? Products keep their other ${table}.`)) return;
    const { error } = await supabase.from(table).delete().eq("id", r.id);
    if (error) toast.error(error.message); else refresh();
  };
  const move = async (i: number, d: number) => {
    const rows = q.data ?? [];
    const a = rows[i], b = rows[i + d];
    if (!a || !b) return;
    await Promise.all([supabase.from(table).update({ sort: i + d }).eq("id", a.id), supabase.from(table).update({ sort: i }).eq("id", b.id)]);
    refresh();
  };
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      <div className="mt-5 space-y-3">
        {q.data?.map((r, i) => (
          <div key={r.id} className="flex items-center gap-3 rounded-xl border border-border bg-background p-3">
            {withImage && <ImageInput value={r.image ?? ""} onChange={(v) => patch(r.id, { image: v })} />}
            <input defaultValue={r.name} onBlur={(e) => e.target.value.trim() && e.target.value !== r.name && patch(r.id, { name: e.target.value.trim() })} className={inputCls} aria-label="Name" />
            <RowTools onUp={() => move(i, -1)} onDown={() => move(i, 1)} onRemove={() => remove(r)} />
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder={`New ${title.toLowerCase().slice(0, -1)}`} className={inputCls} />
        <button onClick={add} className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground"><Plus className="h-4 w-4" /> Add</button>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Rename by editing the name and clicking away.</p>
    </section>
  );
}
