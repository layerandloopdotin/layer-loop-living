import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Boxes, CreditCard, Heart, LogOut, MapPin, Package, Star, User } from "lucide-react";
import { Page } from "@/components/site";
import { supabase } from "@/integrations/supabase/client";
import { avatarRef } from "@/lib/account";
import { img } from "@/lib/media";
import { profileQuery, useAvatarUrl } from "@/lib/use-account";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: [
      { title: "My account — Layer & Loop" },
      { name: "description", content: "Your Layer & Loop profile, orders, addresses and payment methods." },
      { property: "og:title", content: "My account — Layer & Loop" },
      { property: "og:description", content: "Manage your Layer & Loop account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AccountLayout,
});

const item = "flex shrink-0 items-center gap-2.5 rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground md:rounded-lg";
const active = { className: "!bg-foreground !text-background" };

export function useSignOut() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  return async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/signin", replace: true });
  };
}

function AccountLayout() {
  const { user } = Route.useRouteContext();
  const profile = useQuery(profileQuery(user.id));
  const avatar = useAvatarUrl(avatarRef(profile.data?.avatar), img);
  const signOut = useSignOut();
  const name = profile.data?.full_name || user.email || user.phone || "Welcome";
  return (
    <Page>
      <section className="bg-ink text-ink-foreground">
        <div className="mx-auto flex max-w-7xl items-center gap-5 px-6 py-10">
          {avatar ? <img src={avatar} alt="" className="h-16 w-16 rounded-full object-cover md:h-20 md:w-20" /> : <span className="h-16 w-16 rounded-full bg-ink-soft" />}
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">My account</p>
            <h1 className="mt-1 truncate font-display text-2xl font-bold md:text-4xl">{name}</h1>
          </div>
        </div>
      </section>
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 md:grid-cols-[220px_1fr]">
        <nav className="-mx-6 flex gap-1 overflow-x-auto px-6 md:mx-0 md:flex-col md:px-0">
          <Link to="/account" activeOptions={{ exact: true }} className={item} activeProps={active}><User className="h-4 w-4" /> Profile</Link>
          <Link to="/account/orders" className={item} activeProps={active}><Package className="h-4 w-4" /> My orders</Link>
          <Link to="/account/designs" className={item} activeProps={active}><Boxes className="h-4 w-4" /> My designs</Link>
          <Link to="/account/reviews" className={item} activeProps={active}><Star className="h-4 w-4" /> Reviews</Link>
          <Link to="/wishlist" className={item}><Heart className="h-4 w-4" /> Wishlist</Link>
          <Link to="/account/addresses" className={item} activeProps={active}><MapPin className="h-4 w-4" /> Addresses</Link>
          <Link to="/account/payments" className={item} activeProps={active}><CreditCard className="h-4 w-4" /> Payments</Link>
          <button onClick={signOut} className={item}><LogOut className="h-4 w-4" /> Logout</button>
        </nav>
        <div className="min-w-0"><Outlet /></div>
      </div>
    </Page>
  );
}
