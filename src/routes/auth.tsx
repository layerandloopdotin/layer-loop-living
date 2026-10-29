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

const field = "mt-2 w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up" | "reset">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { if (data.user) navigate({ to: "/admin", replace: true }); });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setNote("");
    try {
      if (mode === "in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/admin", replace: true });
      } else if (mode === "up") {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/admin` } });
        if (error) throw error;
        if (data.session) navigate({ to: "/admin", replace: true });
        else setNote("Check your email and click the confirmation link, then sign in here.");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
        if (error) throw error;
        setNote("If that email has an account, a reset link is on its way.");
      }
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
        <h1 className="mt-6 text-2xl font-bold">{mode === "in" ? "Admin sign in" : mode === "up" ? "Create admin account" : "Reset password"}</h1>
        <label className="mt-6 block text-xs uppercase tracking-widest text-muted-foreground">Email
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={field} autoComplete="email" />
        </label>
        {mode !== "reset" && (
          <label className="mt-4 block text-xs uppercase tracking-widest text-muted-foreground">Password
            <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className={field} autoComplete={mode === "in" ? "current-password" : "new-password"} />
          </label>
        )}
        <button disabled={busy} className="mt-6 w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60">
          {busy ? "Please wait…" : mode === "in" ? "Sign in" : mode === "up" ? "Create account" : "Send reset link"}
        </button>
        {note && <p className="mt-4 rounded-lg bg-card p-3 text-sm">{note}</p>}
        <div className="mt-6 flex justify-between text-xs text-muted-foreground">
          {mode === "in" ? <>
            <button type="button" onClick={() => setMode("up")} className="hover:text-foreground">Create an account</button>
            <button type="button" onClick={() => setMode("reset")} className="hover:text-foreground">Forgot password?</button>
          </> : <button type="button" onClick={() => setMode("in")} className="hover:text-foreground">← Back to sign in</button>}
        </div>
      </form>
    </div>
  );
}
