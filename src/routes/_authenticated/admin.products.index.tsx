import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowDown, ArrowUp, Copy, Eye, EyeOff, Plus, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { asWorld, type World } from "@/lib/catalog";
import { formatPrice } from "@/lib/currency";
import { img } from "@/lib/media";

export const Route = createFileRoute("/_authenticated/admin/products/")({
  head: () => ({
    meta: [
      { title: "Product Catalog — Layer & Loop CMS" },
      { name: "description", content: "Manage Layer & Loop Space and Culture products." },
      { property: "og:title", content: "Product Catalog — Layer & Loop CMS" },
      { property: "og:description", content: "Manage Layer & Loop Space and Culture products." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): { world?: World } => ({
    ...(s["world"] === "culture" || s["world"] === "space" ? { world: asWorld(s["world"]) } : {}),
  }),
  component: ProductsAdmin,
});

function ProductsAdmin() {
  const qc = useQueryClient();
  const { world: worldParam } = Route.useSearch();
  const activeWorld: World = worldParam === "culture" ? "culture" : "space";
  const [q, setQ] = useState("");
  const list = useQuery({
    queryKey: ["admin", "products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("sort")
        .order("created_at");
      if (error) throw error;
      return data;
    },
  });
  const categories = useQuery({
    queryKey: ["admin", "categories-mini"],
    queryFn: async () => (await supabase.from("categories").select("id, name")).data ?? [],
  });
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin"] });
    qc.invalidateQueries({ queryKey: ["site"] });
  };
  const update = async (
    id: string,
    patch: { featured?: boolean; published?: boolean; sort?: number },
  ) => {
    const { error } = await supabase.from("products").update(patch).eq("id", id);
    if (error) toast.error(error.message);
    else refresh();
  };

  const allProducts = list.data ?? [];
  const spaceProducts = allProducts.filter((p) => (p.world ?? "space") !== "culture");
  const cultureProducts = allProducts.filter((p) => p.world === "culture");
  const worldRows = activeWorld === "culture" ? cultureProducts : spaceProducts;
  const rows = worldRows.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));
  const catNames = (ids: string[]) =>
    (categories.data ?? []).filter((c) => ids.includes(c.id)).map((c) => c.name);

  const reorder = async (i: number, d: number) => {
    const a = worldRows[i],
      b = worldRows[i + d];
    if (!a || !b) return;
    const base = activeWorld === "culture" ? 1000 : 0;
    await Promise.all(
      worldRows.map((p, n) =>
        supabase
          .from("products")
          .update({ sort: base + (n === i ? i + d : n === i + d ? i : n) })
          .eq("id", p.id),
      ),
    );
    refresh();
  };
  const duplicate = async (id: string) => {
    const src = allProducts.find((p) => p.id === id);
    if (!src) return;
    const { id: _id, created_at: _c, updated_at: _u, ...rest } = src;
    const { error } = await supabase.from("products").insert({
      ...rest,
      name: `${src.name} (copy)`,
      slug: `${src.slug}-copy-${Date.now().toString(36)}`,
      published: false,
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Copy created (hidden until you publish it)");
      refresh();
    }
  };
  const remove = async (id: string, name: string) => {
    if (!confirm(`Delete “${name}” for good?`)) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error(error.message);
    else refresh();
  };

  const isCulture = activeWorld === "culture";

  return (
    <div className="max-w-5xl">
      <div
        className="inline-flex rounded-full border border-border bg-card p-1"
        role="tablist"
        aria-label="Product catalog world"
      >
        <Link
          to="/admin/products"
          search={{ world: "space" }}
          role="tab"
          aria-selected={!isCulture}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${!isCulture ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
        >
          Space products ({spaceProducts.length})
        </Link>
        <Link
          to="/admin/products"
          search={{ world: "culture" }}
          role="tab"
          aria-selected={isCulture}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${isCulture ? "bg-pop-blue text-pop-blue-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          Culture products ({cultureProducts.length})
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            {isCulture ? "Culture products" : "Space products"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isCulture
              ? "Pop collectibles, quirky desk pieces and drops. Manage Culture homepage & catalog separately from Space."
              : "Calm sculptural lighting, vases and living objects. Star a product to feature it in The Space Edit."}
          </p>
        </div>
        <Link
          to="/admin/products/$id"
          params={{ id: "new" }}
          search={{ world: activeWorld }}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> Add {isCulture ? "Culture" : "Space"} product
        </Link>
      </div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={`Search ${isCulture ? "Culture" : "Space"} products`}
        className="mt-6 w-full max-w-sm rounded-md border border-border bg-background px-3 py-2 text-sm"
      />

      <div className="mt-6 divide-y divide-border rounded-2xl border border-border bg-card">
        {rows.map((p) => {
          const i = worldRows.indexOf(p);
          const cats = catNames(p.category_ids);
          return (
            <div key={p.id} className="flex items-center gap-4 p-3">
              <img
                src={img(p.images[0])}
                alt=""
                className="h-14 w-14 rounded-lg bg-muted object-cover"
              />
              <Link
                to="/admin/products/$id"
                params={{ id: p.id }}
                search={{ world: activeWorld }}
                className="min-w-0 flex-1"
              >
                <p className="flex flex-wrap items-center gap-2 font-semibold">
                  <span>{p.name}</span>
                  {p.is_drop && (
                    <span className="rounded bg-pop-orange px-1.5 py-0.5 text-[10px] font-bold uppercase text-foreground">
                      Drop
                    </span>
                  )}
                  {!p.published && (
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase">
                      Hidden
                    </span>
                  )}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {p.tagline} · {formatPrice(Number(p.price))}
                  {cats.length > 0 ? ` · ${cats.join(", ")}` : ""}
                </p>
              </Link>
              <div className="flex items-center gap-0.5">
                <button
                  title={
                    p.featured
                      ? `Remove from featured`
                      : `Feature on ${isCulture ? "Culture" : "The Space Edit"}`
                  }
                  onClick={() => update(p.id, { featured: !p.featured })}
                  className="rounded p-2 hover:bg-muted"
                >
                  <Star className={`h-4 w-4 ${p.featured ? "fill-primary text-primary" : ""}`} />
                </button>
                <button
                  title={p.published ? "Hide from site" : "Show on site"}
                  onClick={() => update(p.id, { published: !p.published })}
                  className="rounded p-2 hover:bg-muted"
                >
                  {p.published ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
                {!q && (
                  <>
                    <button
                      title="Move up"
                      onClick={() => reorder(i, -1)}
                      className="rounded p-2 hover:bg-muted"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      title="Move down"
                      onClick={() => reorder(i, 1)}
                      className="rounded p-2 hover:bg-muted"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                  </>
                )}
                <button
                  title="Duplicate"
                  onClick={() => duplicate(p.id)}
                  className="rounded p-2 hover:bg-muted"
                >
                  <Copy className="h-4 w-4" />
                </button>
                <button
                  title="Delete"
                  onClick={() => remove(p.id, p.name)}
                  className="rounded p-2 text-destructive hover:bg-muted"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
        {list.isSuccess && !rows.length && (
          <p className="p-6 text-sm text-muted-foreground">
            No {isCulture ? "Culture" : "Space"} products{q ? ` match “${q}”` : " yet"}.
          </p>
        )}
      </div>
    </div>
  );
}
