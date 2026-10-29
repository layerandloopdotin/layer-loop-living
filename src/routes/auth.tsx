import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Admin sign in — Layer & Loop" },
      { name: "description", content: "Sign in to manage the Layer & Loop website." },
      { property: "og:title", content: "Admin sign in — Layer & Loop" },
      { property: "og:description", content: "Sign in to manage the Layer & Loop website." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

const ADMIN_EMAIL = "admin@layerandloop.in";
const toEmail = (u: string) => (u.trim().toLowerCase() === "admin" ? ADMIN_EMAIL : u.trim());
const field = "mt-2 w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm";

function AuthPage() {
  const navigate = useNavigate();
  const [setup, setSetup] = useState<boolean | null>(null);
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { if (data.user) navigate({ to: "/admin", replace: true }); });
    supabase.rpc("admin_exists").then(({ data }) => setSetup(data === false));
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (setup) {
        const { error } = await supabase.auth.signUp({ email: ADMIN_EMAIL, password });
        if (error) throw error;
      }
      const { error } = await supabase.auth.signInWithPassword({ email: setup ? ADMIN_EMAIL : toEmail(username), password });
      if (error) throw new Error("Wrong username or password");
      navigate({ to: "/admin", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-6 text-ink-foreground">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl bg-background p-8 text-foreground">
        <p className="font-display text-lg font-bold">LAYER &amp; LOOP</p>
        <h1 className="mt-6 text-2xl font-bold">{setup ? "Set admin password" : "Admin sign in"}</h1>
        {setup && <p className="mt-2 text-sm text-muted-foreground">One-time setup. Choose a strong password for the “admin” login.</p>}
        <label className="mt-6 block text-xs uppercase tracking-widest text-muted-foreground">Username
          <input required value={setup ? "admin" : username} readOnly={!!setup} onChange={(e) => setUsername(e.target.value)} className={field} autoComplete="username" />
        </label>
        <label className="mt-4 block text-xs uppercase tracking-widest text-muted-foreground">Password
          <input type="password" required minLength={setup ? 10 : 1} value={password} onChange={(e) => setPassword(e.target.value)} className={field} autoComplete={setup ? "new-password" : "current-password"} />
        </label>
        <button disabled={busy || setup === null} className="mt-6 w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60">
          {busy ? "Please wait…" : setup ? "Save & sign in" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
