import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowDown, ArrowUp, Copy, Eye, EyeOff, Plus, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/currency";
import { img } from "@/lib/media";

export const Route = createFileRoute("/_authenticated/admin/products/")({
  component: ProductsAdmin,
});

function ProductsAdmin() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const list = useQuery({
    queryKey: ["admin", "products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("sort").order("created_at");
      if (error) throw error;
      return data;
    },
  });
  const refresh = () => { qc.invalidateQueries({ queryKey: ["admin"] }); qc.invalidateQueries({ queryKey: ["site"] }); };
  const update = async (id: string, patch: { featured?: boolean; published?: boolean; sort?: number }) => {
    const { error } = await supabase.from("products").update(patch).eq("id", id);
    if (error) toast.error(error.message); else refresh();
  };
  const rows = (list.data ?? []).filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));

  const reorder = async (i: number, d: number) => {
    const all = list.data ?? [];
    const a = all[i], b = all[i + d];
    if (!a || !b) return;
    await Promise.all(all.map((p, n) => supabase.from("products").update({ sort: n === i ? i + d : n === i + d ? i : n }).eq("id", p.id)));
    refresh();
  };
  const duplicate = async (id: string) => {
    const src = list.data?.find((p) => p.id === id);
    if (!src) return;
    const { id: _id, created_at: _c, updated_at: _u, ...rest } = src;
    const { error } = await supabase.from("products").insert({ ...rest, name: `${src.name} (copy)`, slug: `${src.slug}-copy-${Date.now().toString(36)}`, published: false });
    if (error) toast.error(error.message); else { toast.success("Copy created (hidden until you publish it)"); refresh(); }
  };
  const remove = async (id: string, name: string) => {
    if (!confirm(`Delete “${name}” for good?`)) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error(error.message); else refresh();
  };

  return (
    <div className="max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">Star a product to feature it in The Edit on the homepage.</p>
        </div>
        <Link to="/admin/products/$id" params={{ id: "new" }} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"><Plus className="h-4 w-4" /> Add product</Link>
      </div>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products" className="mt-6 w-full max-w-sm rounded-md border border-border bg-background px-3 py-2 text-sm" />
      <div className="mt-6 divide-y divide-border rounded-2xl border border-border bg-card">
        {rows.map((p) => {
          const i = (list.data ?? []).indexOf(p);
          return (
            <div key={p.id} className="flex items-center gap-4 p-3">
              <img src={img(p.images[0])} alt="" className="h-14 w-14 rounded-lg bg-muted object-cover" />
              <Link to="/admin/products/$id" params={{ id: p.id }} className="min-w-0 flex-1">
                <p className="font-semibold">{p.name} {!p.published && <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase">Hidden</span>}</p>
                <p className="truncate text-xs text-muted-foreground">{p.tagline} · {formatPrice(Number(p.price))}</p>
              </Link>
              <div className="flex items-center gap-0.5">
                <button title={p.featured ? "Remove from The Edit" : "Feature in The Edit"} onClick={() => update(p.id, { featured: !p.featured })} className="rounded p-2 hover:bg-muted"><Star className={`h-4 w-4 ${p.featured ? "fill-primary text-primary" : ""}`} /></button>
                <button title={p.published ? "Hide from site" : "Show on site"} onClick={() => update(p.id, { published: !p.published })} className="rounded p-2 hover:bg-muted">{p.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}</button>
                {!q && <><button title="Move up" onClick={() => reorder(i, -1)} className="rounded p-2 hover:bg-muted"><ArrowUp className="h-4 w-4" /></button>
                <button title="Move down" onClick={() => reorder(i, 1)} className="rounded p-2 hover:bg-muted"><ArrowDown className="h-4 w-4" /></button></>}
                <button title="Duplicate" onClick={() => duplicate(p.id)} className="rounded p-2 hover:bg-muted"><Copy className="h-4 w-4" /></button>
                <button title="Delete" onClick={() => remove(p.id, p.name)} className="rounded p-2 text-destructive hover:bg-muted"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          );
        })}
        {list.isSuccess && !rows.length && <p className="p-6 text-sm text-muted-foreground">No products yet.</p>}
      </div>
    </div>
  );
}
