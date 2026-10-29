import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, FileText, Inbox, LayoutDashboard, Loader2, LogOut, Package, Settings, Tags } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { sections, type ContentKey } from "@/lib/cms-schema";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Layer & Loop" },
      { name: "description", content: "Manage the Layer & Loop website." },
      { property: "og:title", content: "Admin — Layer & Loop" },
      { property: "og:description", content: "Manage the Layer & Loop website." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

const pages: ContentKey[] = ["home", "catalog", "about", "trade", "contact", "instagram", "terms", "returns"];
const item = "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink-muted transition-colors hover:bg-ink-soft hover:text-ink-foreground";
const active = { className: "!bg-ink-soft !text-ink-foreground" };

function AdminLayout() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const role = useQuery({
    queryKey: ["is-admin", user.id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
      if (error) throw error;
      return data;
    },
  });

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  if (role.isPending) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (!role.data) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold">No admin access</h1>
          <p className="mt-3 text-muted-foreground">You're signed in as {user.email}, but this account isn't an admin. Ask the site owner to grant access.</p>
          <button onClick={signOut} className="mt-6 rounded-full border border-foreground px-5 py-2 text-sm">Sign out</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col overflow-y-auto bg-ink p-4 text-ink-foreground">
        <Link to="/admin" className="px-3 py-2 font-display text-lg font-bold">L&amp;L Studio</Link>
        <nav className="mt-4 space-y-0.5">
          <Link to="/admin" activeOptions={{ exact: true }} className={item} activeProps={active}><LayoutDashboard className="h-4 w-4" /> Overview</Link>
          <Link to="/admin/products" className={item} activeProps={active}><Package className="h-4 w-4" /> Products</Link>
          <Link to="/admin/taxonomy" className={item} activeProps={active}><Tags className="h-4 w-4" /> Categories &amp; spaces</Link>
          <Link to="/admin/inbox" className={item} activeProps={active}><Inbox className="h-4 w-4" /> Inbox</Link>
          <Link to="/admin/content/$key" params={{ key: "settings" }} className={item} activeProps={active}><Settings className="h-4 w-4" /> Site settings</Link>
        </nav>
        <p className="mt-6 px-3 text-[10px] font-bold uppercase tracking-widest text-ink-muted">Pages</p>
        <nav className="mt-2 space-y-0.5">
          {pages.map((k) => (
            <Link key={k} to="/admin/content/$key" params={{ key: k }} className={item} activeProps={active}><FileText className="h-4 w-4" /> {sections[k].title}</Link>
          ))}
        </nav>
        <div className="mt-auto space-y-0.5 pt-6">
          <a href="/" target="_blank" rel="noreferrer" className={item}><ExternalLink className="h-4 w-4" /> View website</a>
          <button onClick={signOut} className={`${item} w-full`}><LogOut className="h-4 w-4" /> Sign out</button>
          <p className="truncate px-3 pt-2 text-[11px] text-ink-muted">{user.email}</p>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
