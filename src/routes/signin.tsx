import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Mail, Smartphone } from "lucide-react";
import { Page } from "@/components/site";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { fieldValue, phoneSchema, toE164 } from "@/lib/account";

export const Route = createFileRoute("/signin")({
  head: () => ({
    meta: [
      { title: "Sign in — Layer & Loop" },
      { name: "description", content: "Sign in or create your Layer & Loop account to track orders and save addresses." },
      { property: "og:title", content: "Sign in — Layer & Loop" },
      { property: "og:description", content: "Your Layer & Loop account: orders, addresses and favourites." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Login,
});

const GoogleG = () => (
  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/><path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>
);

const input = "mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm";
const label = "block text-xs uppercase tracking-widest text-muted-foreground";

function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"phone" | "email">("phone");
  const [emailMode, setEmailMode] = useState<"in" | "up" | "forgot">("in");
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { if (data.user) navigate({ to: "/account", replace: true }); });
    const { data } = supabase.auth.onAuthStateChange((e) => { if (e === "SIGNED_IN") navigate({ to: "/account", replace: true }); });
    return () => data.subscription.unsubscribe();
  }, [navigate]);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try { await fn(); } catch (e) { toast.error(e instanceof Error ? e.message : "Something went wrong"); } finally { setBusy(false); }
  };

  const social = (p: "google" | "apple") => run(async () => {
    const r = await lovable.auth.signInWithOAuth(p, { redirect_uri: window.location.origin + "/signin" });
    if (r.error) throw new Error(r.error.message ?? "Sign in failed");
  });

  const sendOtp = (e: React.FormEvent) => { e.preventDefault(); run(async () => {
    const v = phoneSchema.safeParse(phone);
    if (!v.success) throw new Error(v.error.issues[0]?.message);
    const { error } = await supabase.auth.signInWithOtp({ phone: toE164(phone) });
    if (error) throw new Error(/provider|sms|phone/i.test(error.message) ? "Mobile OTP isn't switched on yet — please use Google, Apple or email for now." : error.message);
    setOtpSent(true); toast.success("Code sent to +91 " + phone);
  }); };

  const verifyOtp = (e: React.FormEvent<HTMLFormElement>) => { e.preventDefault(); const token = fieldValue(new FormData(e.currentTarget), "otp"); run(async () => {
    const { error } = await supabase.auth.verifyOtp({ phone: toE164(phone), token, type: "sms" });
    if (error) throw new Error("That code didn't work. Try again.");
  }); };

  const emailSubmit = (e: React.FormEvent<HTMLFormElement>) => { e.preventDefault(); const fd = new FormData(e.currentTarget); run(async () => {
    const email = fieldValue(fd, "email"), password = fieldValue(fd, "password");
    if (emailMode === "forgot") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
      if (error) throw error; toast.success("Check your email for a reset link."); setEmailMode("in"); return;
    }
    if (emailMode === "up") {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + "/account", data: { full_name: fieldValue(fd, "name") } } });
      if (error) throw error;
      if (!data.session) toast.success("Check your email to confirm your account.");
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error("Wrong email or password");
  }); };

  const tab = (m: "phone" | "email", text: string, Icon: typeof Mail) => (
    <button type="button" onClick={() => setMode(m)} className={`flex flex-1 items-center justify-center gap-2 rounded-full py-2 text-sm ${mode === m ? "bg-foreground text-background" : "text-muted-foreground"}`}><Icon className="h-4 w-4" />{text}</button>
  );

  return (
    <Page>
      <section className="bg-ink px-4 py-16 text-ink-foreground md:py-24">
        <div className="mx-auto w-full max-w-md rounded-2xl bg-background p-6 text-foreground md:p-8">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Your account</p>
          <h1 className="mt-2 font-display text-3xl font-bold">Sign in or sign up</h1>
          <p className="mt-2 text-sm text-muted-foreground">Track orders, save addresses and check out faster.</p>

          <div className="mt-6 grid gap-3">
            <button type="button" disabled={busy} onClick={() => social("google")} className="flex h-11 items-center justify-center gap-2.5 rounded-full border border-[#747775] bg-[#FFFFFF] px-3 text-sm font-medium text-[#1F1F1F]"><GoogleG /> Continue with Google</button>
            <button type="button" disabled={busy} onClick={() => social("apple")} className="flex h-11 items-center justify-center rounded-full bg-[#000000] px-3 text-[15px] font-medium text-[#FFFFFF]" style={{ fontFamily: "-apple-system, system-ui, sans-serif" }}>Continue with Apple</button>
          </div>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div>

          <div className="flex rounded-full border border-border p-1">{tab("phone", "Mobile OTP", Smartphone)}{tab("email", "Email", Mail)}</div>

          {mode === "phone" ? (!otpSent ? (
            <form onSubmit={sendOtp} className="mt-5">
              <label className={label}>Mobile number
                <div className="mt-1.5 flex"><span className="rounded-l-md border border-r-0 border-border bg-muted px-3 py-2.5 text-sm">+91</span>
                <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} inputMode="numeric" autoComplete="tel-national" className="w-full rounded-r-md border border-border bg-background px-3 py-2.5 text-sm" placeholder="98765 43210" /></div>
              </label>
              <button disabled={busy} className="mt-4 w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60">Send OTP</button>
            </form>
          ) : (
            <form onSubmit={verifyOtp} className="mt-5">
              <label className={label}>Enter the 6-digit code sent to +91 {phone}
                <input name="otp" required inputMode="numeric" maxLength={6} autoComplete="one-time-code" className={`${input} tracking-[0.5em]`} />
              </label>
              <button disabled={busy} className="mt-4 w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60">Verify & continue</button>
              <button type="button" onClick={() => setOtpSent(false)} className="mt-3 w-full text-xs text-muted-foreground underline">Change number</button>
            </form>
          )) : (
            <form onSubmit={emailSubmit} className="mt-5 space-y-4">
              {emailMode === "up" && <label className={label}>Name<input name="name" className={input} autoComplete="name" /></label>}
              <label className={label}>Email<input name="email" type="email" required className={input} autoComplete="email" /></label>
              {emailMode !== "forgot" && <label className={label}>Password<input name="password" type="password" required minLength={emailMode === "up" ? 8 : 1} className={input} autoComplete={emailMode === "up" ? "new-password" : "current-password"} /></label>}
              <button disabled={busy} className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60">
                {emailMode === "in" ? "Sign in" : emailMode === "up" ? "Create account" : "Send reset link"}
              </button>
              <div className="flex justify-between text-xs text-muted-foreground">
                <button type="button" className="underline" onClick={() => setEmailMode(emailMode === "up" ? "in" : "up")}>{emailMode === "up" ? "Have an account? Sign in" : "New here? Create account"}</button>
                {emailMode === "in" && <button type="button" className="underline" onClick={() => setEmailMode("forgot")}>Forgot password?</button>}
              </div>
            </form>
          )}

          <Link to="/products" className="mt-6 block rounded-full border border-foreground py-3 text-center text-sm font-semibold">Continue as guest</Link>
          <p className="mt-3 text-center text-[11px] text-muted-foreground">Guests can shop, save favourites and use the cart on this device.</p>
        </div>
      </section>
    </Page>
  );
}
