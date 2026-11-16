import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a new password — Layer & Loop" },
      { name: "description", content: "Choose a new password for your Layer & Loop admin account." },
      { property: "og:title", content: "Set a new password — Layer & Loop" },
      { property: "og:description", content: "Choose a new password for your Layer & Loop admin account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Reset,
});

function Reset() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Password updated");
    navigate({ to: "/admin", replace: true });
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-6">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl bg-background p-8">
        <h1 className="text-2xl font-bold">Set a new password</h1>
        <span className="relative mt-6 block"><input type={show ? "text" : "password"} required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" className="w-full rounded-md border border-border bg-background px-3 py-2.5 pr-10 text-sm" /><button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground">{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></span>
        <button disabled={busy} className="mt-6 w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60">Save password</button>
      </form>
    </div>
  );
}
