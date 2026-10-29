import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Inbox, Package, Plus, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Overview,
});

function Overview() {
  const stats = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const [products, featured, unread] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("products").select("id", { count: "exact", head: true }).eq("featured", true),
        supabase.from("submissions").select("id", { count: "exact", head: true }).eq("status", "new"),
      ]);
      return { products: products.count ?? 0, featured: featured.count ?? 0, unread: unread.count ?? 0 };
    },
  });
  const card = "rounded-2xl border border-border bg-card p-6";
  return (
    <div className="max-w-5xl">
      <h1 className="text-3xl font-bold">Welcome back</h1>
      <p className="mt-2 text-muted-foreground">Edit any page from the left. Changes go live as soon as you save.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Link to="/admin/products" className={card}><Package className="h-5 w-5 text-primary" /><p className="mt-4 text-3xl font-bold">{stats.data?.products ?? "–"}</p><p className="text-sm text-muted-foreground">Products</p></Link>
        <Link to="/admin/products" className={card}><Star className="h-5 w-5 text-primary" /><p className="mt-4 text-3xl font-bold">{stats.data?.featured ?? "–"}</p><p className="text-sm text-muted-foreground">Featured in The Edit</p></Link>
        <Link to="/admin/inbox" className={card}><Inbox className="h-5 w-5 text-primary" /><p className="mt-4 text-3xl font-bold">{stats.data?.unread ?? "–"}</p><p className="text-sm text-muted-foreground">New enquiries</p></Link>
      </div>
      <Link to="/admin/products/$id" params={{ id: "new" }} className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"><Plus className="h-4 w-4" /> Add a product</Link>
    </div>
  );
}
