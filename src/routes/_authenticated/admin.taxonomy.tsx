import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { normalizeCultureFilters, slugify, type CultureFilterOption } from "@/lib/catalog";
import { ImageInput, inputCls, RowTools } from "@/components/admin/fields";

export const Route = createFileRoute("/_authenticated/admin/taxonomy")({
  head: () => ({
    meta: [
      { title: "Categories, Spaces & Filters — Layer & Loop CMS" },
      {
        name: "description",
        content:
          "Manage Layer & Loop Space categories, Culture categories, living spaces and Culture setup filters.",
      },
      { property: "og:title", content: "Categories, Spaces & Filters — Layer & Loop CMS" },
      {
        property: "og:description",
        content:
          "Manage Layer & Loop Space categories, Culture categories, living spaces and Culture setup filters.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),

  component: Taxonomy,
});

type Row = { id: string; name: string; sort: number; image?: string; world?: string };

function Taxonomy() {
  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="text-3xl font-bold">Categories, spaces &amp; filters</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Categories and secondary filters are separated by world so Space and Culture stay distinct
          on the homepage and all-objects pages. Categories without a photo don't appear as homepage
          tiles.
        </p>
      </div>
      <Editor
        table="categories"
        title="Space categories"
        subtitle="Shown on the Space homepage and Space all-objects page."
        worldFilter="space"
        withImage
      />
      <Editor
        table="categories"
        title="Culture categories"
        subtitle="Shown on the Culture homepage and Culture all-objects page."
        worldFilter="culture"
        withImage
      />
      <Editor
        table="spaces"
        title="Living spaces (Space world)"
        subtitle="Drives the Filter by Space sidebar on Space products."
      />
      <CultureFiltersEditor />
    </div>
  );
}

function CultureFiltersEditor() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["admin", "cultureFilters"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_content")
        .select("data")
        .eq("key", "cultureFilters")
        .maybeSingle();
      if (error) throw error;
      return normalizeCultureFilters(data?.data);
    },
  });
  const [name, setName] = useState("");
  const rows = q.data ?? [];

  const persist = async (next: CultureFilterOption[]) => {
    const { error } = await supabase
      .from("site_content")
      .upsert({ key: "cultureFilters", data: { items: next } as unknown as Json });
    if (error) {
      toast.error(error.message);
      return;
    }
    qc.invalidateQueries({ queryKey: ["admin"] });
    qc.invalidateQueries({ queryKey: ["site"] });
  };

  const add = async () => {
    const clean = name.trim();
    if (!clean) return;
    const baseId = slugify(clean) || "culture-filter";
    let id = baseId;
    let suffix = 2;
    while (rows.some((r) => r.id === id)) {
      id = `${baseId}-${suffix++}`;
    }
    await persist([...rows, { id, name: clean, productIds: [], productSlugs: [] }]);
    setName("");
  };

  const rename = async (id: string, nextName: string) => {
    const clean = nextName.trim();
    if (!clean) return;
    await persist(rows.map((r) => (r.id === id ? { ...r, name: clean } : r)));
  };

  const move = async (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= rows.length) return;
    const next = [...rows];
    [next[i], next[j]] = [next[j]!, next[i]!];
    await persist(next);
  };

  const remove = async (r: CultureFilterOption) => {
    if (!confirm(`Delete “${r.name}”? Products keep their Culture categories.`)) return;
    await persist(rows.filter((x) => x.id !== r.id));
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h2 className="font-display text-lg font-semibold">
        Culture setups &amp; filters (Culture world)
      </h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Drives the separate Filter by Setup section on Culture products (/products?world=culture).
      </p>
      <div className="mt-5 space-y-3">
        {rows.map((r, i) => (
          <div
            key={r.id}
            className="flex items-center gap-3 rounded-xl border border-border bg-background p-3"
          >
            <input
              defaultValue={r.name}
              onBlur={(e) =>
                e.target.value.trim() && e.target.value !== r.name && rename(r.id, e.target.value)
              }
              className={inputCls}
              aria-label="Filter name"
            />
            <RowTools
              onUp={() => move(i, -1)}
              onDown={() => move(i, 1)}
              onRemove={() => remove(r)}
            />
          </div>
        ))}
        {q.isSuccess && !rows.length && (
          <p className="text-sm text-muted-foreground">None added yet.</p>
        )}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="New culture setup or theme (e.g. Gaming Corner)"
          className={`${inputCls} flex-1`}
        />
        <button
          onClick={add}
          className="inline-flex shrink-0 items-center gap-1 rounded-full bg-pop-blue px-4 py-2 text-sm font-semibold text-pop-blue-foreground"
        >
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Assign these filters to Culture products inside the product editor, alongside categories.
      </p>
    </section>
  );
}

function Editor({
  table,
  title,
  subtitle,
  worldFilter,
  withImage,
}: {
  table: "categories" | "spaces";
  title: string;
  subtitle?: string;
  worldFilter?: "space" | "culture";
  withImage?: boolean;
}) {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["admin", table],
    queryFn: async () =>
      ((await supabase.from(table).select("*").order("sort")).data ?? []) as Row[],
  });
  const [name, setName] = useState("");
  const allRows = q.data ?? [];
  const rows = worldFilter
    ? allRows.filter((r) => (r.world === "culture" ? "culture" : "space") === worldFilter)
    : allRows;

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin"] });
    qc.invalidateQueries({ queryKey: ["site"] });
  };
  const patch = async (id: string, p: Partial<Row>) => {
    const { error } = await supabase
      .from(table)
      .update(p as never)
      .eq("id", id);
    if (error) toast.error(error.message);
    else refresh();
  };
  const add = async () => {
    if (!name.trim()) return;
    const base = worldFilter === "culture" ? 100 : 0;
    const row = withImage
      ? { name: name.trim(), sort: base + rows.length + 1, world: worldFilter ?? "space" }
      : { name: name.trim(), sort: rows.length + 1 };
    const { error } = await supabase.from(table).insert(row as never);
    if (error) {
      toast.error(error.message);
      return;
    }
    setName("");
    refresh();
  };
  const remove = async (r: Row) => {
    if (!confirm(`Delete “${r.name}”? Products keep their other ${table}.`)) return;
    const { error } = await supabase.from(table).delete().eq("id", r.id);
    if (error) toast.error(error.message);
    else refresh();
  };
  const move = async (i: number, d: number) => {
    const a = rows[i],
      b = rows[i + d];
    if (!a || !b) return;
    const base = worldFilter === "culture" ? 100 : 0;
    await Promise.all(
      rows.map((r, n) =>
        supabase
          .from(table)
          .update({ sort: base + (n === i ? i + d : n === i + d ? i : n) })
          .eq("id", r.id),
      ),
    );
    refresh();
  };
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
      <div className="mt-5 space-y-3">
        {rows.map((r, i) => (
          <div
            key={r.id}
            className="flex items-center gap-3 rounded-xl border border-border bg-background p-3"
          >
            {withImage && (
              <ImageInput value={r.image ?? ""} onChange={(v) => patch(r.id, { image: v })} />
            )}
            {withImage && (
              <select
                aria-label="World"
                value={r.world === "culture" ? "culture" : "space"}
                onChange={(e) => patch(r.id, { world: e.target.value })}
                className="rounded-md border border-border bg-background px-2 py-2 text-sm"
              >
                <option value="space">Space</option>
                <option value="culture">Culture</option>
              </select>
            )}
            <input
              defaultValue={r.name}
              onBlur={(e) =>
                e.target.value.trim() &&
                e.target.value !== r.name &&
                patch(r.id, { name: e.target.value.trim() })
              }
              className={inputCls}
              aria-label="Name"
            />
            <RowTools
              onUp={() => move(i, -1)}
              onDown={() => move(i, 1)}
              onRemove={() => remove(r)}
            />
          </div>
        ))}
        {q.isSuccess && !rows.length && (
          <p className="text-sm text-muted-foreground">None added yet.</p>
        )}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder={`New ${title.toLowerCase().replace(/ies$/, "y").replace(/s$/, "")}`}
          className={`${inputCls} flex-1`}
        />
        <button
          onClick={add}
          className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Rename by editing the name and clicking away.
      </p>
    </section>
  );
}
