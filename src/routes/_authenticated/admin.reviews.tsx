import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Stars } from "@/components/account/review-dialog";

export const Route = createFileRoute("/_authenticated/admin/reviews")({ component: Reviews });

function Reviews() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin-reviews"], queryFn: async () => {
    const { data, error } = await supabase.from("reviews").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    const paths = data.flatMap((r) => r.images);
    const signed = paths.length ? (await supabase.storage.from("review-media").createSignedUrls(paths, 3600)).data ?? [] : [];
    return data.map((r) => ({ ...r, urls: r.images.map((p) => signed.find((s) => s.path === p)?.signedUrl ?? "") }));
  } });
  const set = async (id: string, status: string) => { await supabase.from("reviews").update({ status }).eq("id", id); qc.invalidateQueries({ queryKey: ["admin-reviews"] }); };
  const remove = async (id: string) => { if (window.confirm("Delete review?")) { await supabase.from("reviews").delete().eq("id", id); qc.invalidateQueries({ queryKey: ["admin-reviews"] }); } };
  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold">Reviews</h1>
      <p className="mt-1 text-sm text-muted-foreground">New reviews wait here until you approve them.</p>
      {q.data?.length === 0 && <p className="mt-6 text-sm text-muted-foreground">No reviews yet.</p>}
      <ul className="mt-6 space-y-3">
        {q.data?.map((r) => (
          <li key={r.id} className="rounded-xl border border-border p-4 text-sm">
            <div className="flex flex-wrap items-center gap-3">
              <Stars value={r.rating} size="h-4 w-4" /><span className="font-semibold">{r.product_slug}</span><span className="text-muted-foreground">by {r.author_name || "Customer"}</span>
              <span className={`rounded-full px-2.5 py-0.5 text-[11px] ${r.status === "approved" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{r.status}</span>
            </div>
            {r.comment && <p className="mt-2 text-muted-foreground">{r.comment}</p>}
            {r.urls.length > 0 && <div className="mt-2 flex gap-2">{r.urls.map((u, i) => u && <img key={i} src={u} alt="" className="h-16 w-16 rounded-lg object-cover" />)}</div>}
            <div className="mt-3 flex gap-4 text-xs underline">
              {r.status !== "approved" && <button onClick={() => set(r.id, "approved")}>Approve</button>}
              {r.status !== "hidden" && <button onClick={() => set(r.id, "hidden")}>Hide</button>}
              <button onClick={() => remove(r.id)} className="text-destructive">Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
