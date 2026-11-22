import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import {
  ExternalLink,
  FileText,
  Home,
  Inbox,
  LayoutDashboard,
  Loader2,
  LogOut,
  Package,
  ShoppingCart,
  Bell,
  Sparkles,
  TicketPercent,
  MessageSquareQuote,
  Settings,
  KeyRound,
  Tags,
} from "lucide-react";
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

const homepages: ContentKey[] = ["home", "space", "culture"];
const pages: ContentKey[] = [
  "catalogSpace",
  "catalogCulture",
  "catalog",
  "about",
  "trade",
  "custom",
  "contact",
  "instagram",
  "terms",
  "returns",
];
const item =
  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink-muted transition-colors hover:bg-ink-soft hover:text-ink-foreground";
const activeCls = "!bg-ink-soft !text-ink-foreground";
const active = { className: activeCls };

function AdminLayout() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const location = useRouterState({ select: (s) => s.location });
  const isProductsRoute = location.pathname.startsWith("/admin/products");
  const isCultureProducts = isProductsRoute && location.searchStr.includes("world=culture");
  const isSpaceProducts = isProductsRoute && !isCultureProducts;
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

  if (role.isPending)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  if (!role.data) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold">No admin access</h1>
          <p className="mt-3 text-muted-foreground">
            You're signed in as {user.email}, but this account isn't an admin. Ask the site owner to
            grant access.
          </p>
          <button
            onClick={signOut}
            className="mt-6 rounded-full border border-foreground px-5 py-2 text-sm"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col overflow-y-auto bg-ink p-4 text-ink-foreground">
        <Link to="/admin" className="px-3 py-2 font-display text-lg font-bold">
          L&amp;L Studio
        </Link>
        <nav className="mt-4 space-y-0.5">
          <Link to="/admin" activeOptions={{ exact: true }} className={item} activeProps={active}>
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </Link>
          <Link to="/admin/orders" className={item} activeProps={active}>
            <ShoppingCart className="h-4 w-4" /> Orders
          </Link>
          <Link to="/admin/custom" className={item} activeProps={active}>
            <Sparkles className="h-4 w-4" /> Custom orders
          </Link>
          <Link to="/admin/coupons" className={item} activeProps={active}>
            <TicketPercent className="h-4 w-4" /> Coupons
          </Link>
          <Link to="/admin/reviews" className={item} activeProps={active}>
            <MessageSquareQuote className="h-4 w-4" /> Reviews
          </Link>
          <AlertsLink />
          <Link to="/admin/inbox" className={item} activeProps={active}>
            <Inbox className="h-4 w-4" /> Inbox
          </Link>
          <Link
            to="/admin/content/$key"
            params={{ key: "settings" }}
            className={item}
            activeProps={active}
          >
            <Settings className="h-4 w-4" /> Site settings
          </Link>
          <Link to="/admin/login" className={item} activeProps={active}>
            <KeyRound className="h-4 w-4" /> Admin login
          </Link>
        </nav>
        <p className="mt-6 px-3 text-[10px] font-bold uppercase tracking-widest text-ink-muted">
          Products
        </p>
        <nav className="mt-2 space-y-0.5">
          <Link
            to="/admin/products"
            search={{ world: "space" }}
            className={`${item} ${isSpaceProducts ? activeCls : ""}`}
          >
            <Package className="h-4 w-4" /> Space products
          </Link>
          <Link
            to="/admin/products"
            search={{ world: "culture" }}
            className={`${item} ${isCultureProducts ? activeCls : ""}`}
          >
            <Package className="h-4 w-4 text-pop-orange" /> Culture products
          </Link>
          <Link to="/admin/taxonomy" className={item} activeProps={active}>
            <Tags className="h-4 w-4" /> Categories &amp; filters
          </Link>
        </nav>
        <p className="mt-6 px-3 text-[10px] font-bold uppercase tracking-widest text-ink-muted">
          Homepages
        </p>
        <nav className="mt-2 space-y-0.5">
          {homepages.map((k) => (
            <Link
              key={k}
              to="/admin/content/$key"
              params={{ key: k }}
              className={item}
              activeProps={active}
            >
              <Home className="h-4 w-4" /> {sections[k].title}
            </Link>
          ))}
        </nav>
        <p className="mt-6 px-3 text-[10px] font-bold uppercase tracking-widest text-ink-muted">
          Pages
        </p>
        <nav className="mt-2 space-y-0.5">
          {pages.map((k) => (
            <Link
              key={k}
              to="/admin/content/$key"
              params={{ key: k }}
              className={item}
              activeProps={active}
            >
              <FileText className="h-4 w-4" /> {sections[k].title}
            </Link>
          ))}
        </nav>
        <div className="mt-auto space-y-0.5 pt-6">
          <a href="/" target="_blank" rel="noreferrer" className={item}>
            <ExternalLink className="h-4 w-4" /> View website
          </a>
          <button onClick={signOut} className={`${item} w-full`}>
            <LogOut className="h-4 w-4" /> Sign out
          </button>
          <p className="truncate px-3 pt-2 text-[11px] text-ink-muted">{user.email}</p>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}

function AlertsLink() {
  const qc = useQueryClient();
  const unread = useQuery({
    queryKey: ["admin-unread"],
    queryFn: async () =>
      (
        await supabase
          .from("admin_notifications")
          .select("id", { count: "exact", head: true })
          .is("read_at", null)
      ).count ?? 0,
  });
  useEffect(() => {
    const channel = supabase
      .channel(`admin-alerts-${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "admin_notifications" },
        (payload) => {
          toast.success(String((payload.new as { title?: string }).title ?? "New order"));
          qc.invalidateQueries({ queryKey: ["admin-unread"] });
          qc.invalidateQueries({ queryKey: ["admin-notifications"] });
          qc.invalidateQueries({ queryKey: ["admin-orders"] });
          qc.invalidateQueries({ queryKey: ["admin-requests"] });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);
  return (
    <Link to="/admin/alerts" className={item} activeProps={active}>
      <Bell className="h-4 w-4" /> Alerts
      {!!unread.data && (
        <span className="ml-auto rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
          {unread.data}
        </span>
      )}
    </Link>
  );
}
