import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { adminLoginSchema, passwordStrength } from "@/lib/admin-login";
import { getAdminLogin, setAdminLogin } from "@/lib/admin-login.functions";
import { fieldValue } from "@/lib/account";

export const Route = createFileRoute("/_authenticated/admin/login")({ component: AdminLogin });

const input = "mt-1 w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm";

function AdminLogin() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin-login"], queryFn: () => getAdminLogin() });
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pw, setPw] = useState("");
  const [uname, setUname] = useState<string | null>(null);
  const [okWeak, setOkWeak] = useState(false);
  const strength = passwordStrength(pw, uname ?? q.data?.username ?? "");
  const weak = pw.length > 0 && (strength.level === "weak" || strength.level === "fair");

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    if (fieldValue(fd, "password") !== fieldValue(fd, "confirm")) { toast.error("Passwords don't match"); return; }
    const parsed = adminLoginSchema.safeParse({ username: fieldValue(fd, "username"), password: fieldValue(fd, "password") });
    if (!parsed.success) { toast.error(parsed.error.issues[0]?.message ?? "Check the form"); return; }
    if (weak && !okWeak) { toast.error("Tick the box to confirm you want this weaker password"); return; }
    setBusy(true);
    try {
      await setAdminLogin({ data: parsed.data });
      toast.success("Admin login updated");
      form.reset(); setPw(""); setOkWeak(false);
      qc.invalidateQueries({ queryKey: ["admin-login"] });
    } catch (err) { toast.error(err instanceof Error ? err.message : "Couldn't update"); } finally { setBusy(false); }
  };

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold">Admin login</h1>
      <p className="mt-1 text-sm text-muted-foreground">Set a new login ID and password for the separate admin sign-in page. Only the owner account (signed in with the owner email) can save changes. Anyone signed in with the old details is signed out.</p>
      {q.data?.username && <p className="mt-4 text-sm">Current login ID: <b>{q.data.username}</b></p>}
      <form onSubmit={submit} className="mt-6 space-y-4">
        <label className="block text-xs uppercase tracking-widest text-muted-foreground">Login ID
          <input name="username" required defaultValue={q.data?.username ?? ""} key={q.data?.username ?? ""} onChange={(e) => setUname(e.target.value)} autoComplete="off" className={input} />
        </label>
        <label className="block text-xs uppercase tracking-widest text-muted-foreground">New password
          <span className="relative block">
            <input name="password" type={show ? "text" : "password"} required value={pw} onChange={(e) => { setPw(e.target.value); setOkWeak(false); }} autoComplete="new-password" className={`${input} pr-10`} />
            <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-2 top-1/2 mt-0.5 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground">{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
          </span>
        </label>
        <label className="block text-xs uppercase tracking-widest text-muted-foreground">Confirm password
          <input name="confirm" type={show ? "text" : "password"} required autoComplete="new-password" className={input} />
        </label>
        {pw && (
          <div className="text-xs">
            <div className="flex gap-1">{[0, 1, 2, 3].map((i) => <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= ["weak", "fair", "good", "strong"].indexOf(strength.level) ? (weak ? "bg-destructive" : "bg-primary") : "bg-muted"}`} />)}</div>
            <p className="mt-1.5 font-semibold capitalize">{strength.level}</p>
            {strength.tips.length > 0 && <ul className="mt-1 list-disc pl-4 text-muted-foreground">{strength.tips.map((t) => <li key={t}>{t}</li>)}</ul>}
          </div>
        )}
        {weak && (
          <label className="flex items-start gap-2 rounded-lg border border-destructive/40 p-3 text-xs">
            <input type="checkbox" checked={okWeak} onChange={(e) => setOkWeak(e.target.checked)} className="mt-0.5" />
            <span>I understand this password is easy to guess and could let someone see customer details and change orders. Use it anyway.</span>
          </label>
        )}
        <button disabled={busy} className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60">{busy ? "Saving…" : "Save admin login"}</button>
      </form>
    </div>
  );
}
