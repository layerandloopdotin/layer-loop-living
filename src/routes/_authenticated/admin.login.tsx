import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { adminLoginSchema } from "@/lib/admin-login";
import { getAdminLogin, setAdminLogin } from "@/lib/admin-login.functions";
import { fieldValue } from "@/lib/account";

export const Route = createFileRoute("/_authenticated/admin/login")({ component: AdminLogin });

const input = "mt-1 w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm";

function AdminLogin() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin-login"], queryFn: () => getAdminLogin() });
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    if (fieldValue(fd, "password") !== fieldValue(fd, "confirm")) { toast.error("Passwords don't match"); return; }
    const parsed = adminLoginSchema.safeParse({ username: fieldValue(fd, "username"), password: fieldValue(fd, "password") });
    if (!parsed.success) { toast.error(parsed.error.issues[0]?.message ?? "Check the form"); return; }
    setBusy(true);
    try {
      await setAdminLogin({ data: parsed.data });
      toast.success("Admin login updated");
      form.reset();
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
          <input name="username" required defaultValue={q.data?.username ?? ""} key={q.data?.username ?? ""} autoComplete="off" className={input} />
        </label>
        <label className="block text-xs uppercase tracking-widest text-muted-foreground">New password
          <span className="relative block">
            <input name="password" type={show ? "text" : "password"} required minLength={10} autoComplete="new-password" className={`${input} pr-10`} />
            <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-2 top-1/2 mt-0.5 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground">{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
          </span>
        </label>
        <label className="block text-xs uppercase tracking-widest text-muted-foreground">Confirm password
          <input name="confirm" type={show ? "text" : "password"} required autoComplete="new-password" className={input} />
        </label>
        <p className="text-xs text-muted-foreground">At least 10 characters with a letter and a number. Common words like “admin” or “password” aren't allowed.</p>
        <button disabled={busy} className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60">{busy ? "Saving…" : "Save admin login"}</button>
      </form>
    </div>
  );
}
