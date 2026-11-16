import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { OrderItem } from "@/lib/account";
import { profileQuery } from "@/lib/use-account";
import { ReviewDialog, Stars } from "@/components/account/review-dialog";

export const Route = createFileRoute("/_authenticated/account/reviews")({ component: MyReviews });

function MyReviews() {
  const { user } = Route.useRouteContext();
  const profile = useQuery(profileQuery(user.id));
  const delivered = useQuery({ queryKey: ["delivered-items"], queryFn: async () => {
    const { data, error } = await supabase.from("orders").select("items").eq("status", "delivered");
    if (error) throw error;
    const seen = new Map<string, OrderItem>();
    for (const o of data) for (const it of o.items as OrderItem[]) if (it.slug !== "custom" && !seen.has(it.slug)) seen.set(it.slug, it);
    return [...seen.values()];
  } });
  const mine = useQuery({ queryKey: ["my-reviews"], queryFn: async () => {
    const { data, error } = await supabase.from("reviews").select("product_slug, rating, status").eq("user_id", user.id);
    if (error) throw error; return data;
  } });
  return (
    <div>
      <h2 className="font-display text-xl font-bold">Rate & review</h2>
      <p className="mt-1 text-sm text-muted-foreground">Share stars, a few words and photos for anything delivered to you.</p>
      {delivered.data?.length === 0 && <p className="mt-6 rounded-xl bg-card p-6 text-sm text-muted-foreground">Once an order is delivered, you can review it here.</p>}
      <ul className="mt-6 space-y-3">
        {delivered.data?.map((it) => { const r = mine.data?.find((m) => m.product_slug === it.slug); return (
          <li key={it.slug} className="flex items-center gap-4 rounded-xl border border-border p-4">
            {it.image ? <img src={it.image} alt="" className="h-14 w-14 rounded-lg object-cover" /> : <span className="h-14 w-14 rounded-lg bg-muted" />}
            <div className="min-w-0 flex-1">
              <Link to="/product/$slug" params={{ slug: it.slug }} className="text-sm font-semibold hover:underline">{it.name}</Link>
              {r && <div className="mt-1"><Stars value={r.rating} size="h-3.5 w-3.5" /></div>}
            </div>
            <ReviewDialog userId={user.id} slug={it.slug} name={it.name} authorName={profile.data?.full_name?.split(" ")[0] || "Customer"} existing={r} />
          </li>
        ); })}
      </ul>
    </div>
  );
}
