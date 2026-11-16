import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { matchesSavedDesign } from "@/lib/account";
import { myRequestsQuery } from "@/lib/account-requests";
import { CustomProgress } from "@/components/account/custom-progress";

export const Route = createFileRoute("/_authenticated/account/designs")({ component: Designs, head: () => ({ meta: [{ title: "My saved designs | Layer & Loop" }, { name: "description", content: "Revisit your saved Layer & Loop designs and track advance-paid requests and final prices." }, { property: "og:title", content: "My saved designs | Layer & Loop" }, { property: "og:description", content: "Your saved designs and studio request progress." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }) });

function Designs() {
  const qc = useQueryClient();
  const requests = useQuery(myRequestsQuery);
  const q = useQuery({ queryKey: ["my-designs"], queryFn: async () => {
    const { data, error } = await supabase.from("saved_designs").select("id, name, design, thumbnail, updated_at").order("updated_at", { ascending: false });
    if (error) throw error;
    const paths = data.map((d) => d.thumbnail).filter((t): t is string => !!t);
    const signed = paths.length ? (await supabase.storage.from("design-thumbs").createSignedUrls(paths, 3600)).data ?? [] : [];
    return data.map((d) => ({ ...d, thumbUrl: signed.find((s) => s.path === d.thumbnail)?.signedUrl }));
  } });
  const rename = async (id: string, current: string) => {
    const name = window.prompt("Rename design", current)?.trim();
    if (!name) return;
    await supabase.from("saved_designs").update({ name: name.slice(0, 60) }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["my-designs"] });
  };
  const remove = async (id: string) => {
    if (!window.confirm("Delete this design?")) return;
    const { error } = await supabase.from("saved_designs").delete().eq("id", id);
    if (error) toast.error("Couldn't delete"); else qc.invalidateQueries({ queryKey: ["my-designs"] });
  };
  return (
    <div>
      <h2 className="font-display text-xl font-bold">My designs</h2>
      <p className="mt-1 text-sm text-muted-foreground">Designs you saved in the Custom studio. Open one to keep tweaking or request it.</p>
      {q.data?.length === 0 && <p className="mt-6 rounded-xl bg-card p-6 text-sm text-muted-foreground">No saved designs yet. <Link to="/custom" hash="sandbox" className="underline">Start designing</Link></p>}
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {q.data?.map((d) => (
          <li key={d.id} className="overflow-hidden rounded-xl border border-border" onContextMenu={(e) => e.preventDefault()}>
            <Link to="/custom" search={{ design: d.id }} hash="sandbox" className="block aspect-square bg-ink">
              {d.thumbUrl && <img src={d.thumbUrl} alt={d.name} draggable={false} className="pointer-events-none h-full w-full select-none object-contain" />}
            </Link>
            <div className="p-4">
              <p className="truncate font-semibold">{d.name}</p>
              <p className="text-xs text-muted-foreground">{new Date(d.updated_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}</p>
              {(() => {
                const request = requests.data?.find((r) => r.deposit_status === "paid" && matchesSavedDesign(d, r));
                return request ? <><CustomProgress request={request} compact /><Link to="/account/orders" className="mt-3 inline-block text-xs underline">View request & quote</Link></> : null;
              })()}
              <div className="mt-3 flex gap-4 text-xs underline">
                <Link to="/custom" search={{ design: d.id }} hash="sandbox">Open</Link>
                <button onClick={() => rename(d.id, d.name)}>Rename</button>
                <button onClick={() => remove(d.id)} className="text-destructive">Delete</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
