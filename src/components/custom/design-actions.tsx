import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Bookmark, Send } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { designRequestContactSchema, fieldValue } from "@/lib/account";
import type { Design, Rates } from "@/lib/custom";
import { depositFor, estimate } from "@/lib/custom";
import { formatPrice } from "@/lib/currency";
import { notifyNewRequest } from "@/lib/notify.functions";

/** Captures the sandbox's 3D view as a small JPEG for the saved-design card. */
async function snapshot(): Promise<Blob | null> {
  // Saved/requested thumbnails always show the complete lamp, not its inspection view.
  window.dispatchEvent(new Event("custom:assemble-preview"));
  await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  const canvas = document.querySelector<HTMLCanvasElement>("#sandbox canvas");
  if (!canvas) return null;
  const out = document.createElement("canvas");
  const k = Math.min(1, 480 / Math.max(canvas.width, canvas.height));
  out.width = Math.round(canvas.width * k); out.height = Math.round(canvas.height * k);
  const ctx = out.getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(0, 0, out.width, out.height);
  ctx.drawImage(canvas, 0, 0, out.width, out.height);
  return new Promise((r) => out.toBlob((b) => r(b), "image/jpeg", 0.8));
}

export function DesignActions({ design, rates, summary, loadedId }: { design: Design; rates: Rates; summary: string; loadedId?: string | undefined }) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const user = useQuery({ queryKey: ["custom-user"], queryFn: async () => (await supabase.auth.getUser()).data.user });
  const [saving, setSaving] = useState(false);
  const [asking, setAsking] = useState(false);
  const [sent, setSent] = useState(false);
  const uid = user.data?.id;
  const est = estimate(design, rates);
  const dep = depositFor(est.low, est.high);

  const save = async () => {
    if (!uid) { toast("Sign in to save designs to your profile", { action: { label: "Sign in", onClick: () => navigate({ to: "/signin" }) } }); return; }
    const name = window.prompt("Name your design", "My design")?.trim();
    if (!name) return;
    setSaving(true);
    try {
      let thumbnail: string | null = null;
      const blob = await snapshot();
      if (blob) {
        const path = `${uid}/${crypto.randomUUID()}.jpg`;
        const { error } = await supabase.storage.from("design-thumbs").upload(path, blob, { contentType: "image/jpeg" });
        if (!error) thumbnail = path;
      }
      const row = { name: name.slice(0, 60), design: design as never, ...(thumbnail ? { thumbnail } : {}) };
      const { error } = loadedId && window.confirm("Update the design you opened? Cancel saves a new copy.")
        ? await supabase.from("saved_designs").update(row).eq("id", loadedId)
        : await supabase.from("saved_designs").insert(row);
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["my-designs"] });
      toast.success("Saved to My designs", { action: { label: "View", onClick: () => navigate({ to: "/account/designs" }) } });
    } catch { toast.error("Couldn't save the design"); } finally { setSaving(false); }
  };

  const request = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = designRequestContactSchema.safeParse(Object.fromEntries(["name", "email", "phone", "pin"].map((k) => [k, fieldValue(fd, k)])));
    if (!parsed.success) { toast.error(parsed.error.issues[0]?.message ?? "Check your contact details"); return; }
    const { name, email, phone, pin } = parsed.data;
    if (!uid) return;
    const s = estimate(design, rates);
    const id = crypto.randomUUID();
    let thumbnail: string | null = null;
    const blob = await snapshot();
    if (blob) {
      const path = `${uid}/${crypto.randomUUID()}.jpg`;
      const up = await supabase.storage.from("design-thumbs").upload(path, blob, { contentType: "image/jpeg" });
      if (!up.error) thumbnail = path;
    }
    let savedId = loadedId;
    if (!savedId) {
      const saved = await supabase.from("saved_designs").insert({ name: `Requested design ${new Date().toLocaleDateString("en-IN")}`, design: design as never, ...(thumbnail ? { thumbnail } : {}) }).select("id").single();
      if (saved.error) { toast.error("Couldn't save your design"); return; }
      savedId = saved.data.id;
    }
    const { error } = await supabase.from("custom_requests").insert({
      id, user_id: uid, thumbnail, design: design as never, summary, estimate_low: s.low, estimate_high: s.high,
      contact: { saved_design_id: savedId, name, phone, email, note: fieldValue(fd, "note"), address: { name, phone, pin } },
    });
    if (error) { toast.error("Couldn't send your request"); return; }
    qc.invalidateQueries({ queryKey: ["my-designs"] }); qc.invalidateQueries({ queryKey: ["my-requests"] });
    notifyNewRequest({ data: { kind: "custom", id } }).catch(() => {});
    setSent(true);
  };

  return (
    <>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => {
          if (!uid) { toast("Sign in to request this design", { action: { label: "Sign in", onClick: () => navigate({ to: "/signin" }) } }); return; }
          setSent(false); setAsking(true); }} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-ink-foreground"><Send className="h-4 w-4" /> Request this design</button>
        <button type="button" disabled={saving} onClick={save} className="inline-flex items-center justify-center gap-2 rounded-full border border-ink/30 px-4 py-2.5 text-sm font-semibold disabled:opacity-60"><Bookmark className="h-4 w-4" /> {saving ? "Saving…" : "Save design"}</button>
      </div>
      <Dialog open={asking} onOpenChange={setAsking}>
        <DialogContent className="max-w-md">
          <DialogTitle className="font-display">{sent ? "Request sent" : "Request this design"}</DialogTitle>
          {sent ? <div className="space-y-3 text-sm">
            <p>Your design is saved. Pay the 20% advance of <b>{formatPrice(dep)}</b> from your account — once it's received, our studio sends your exact final price there.</p>
            <Link to="/account/orders" className="inline-flex rounded-full bg-primary px-5 py-2.5 font-semibold text-primary-foreground">Pay advance & track</Link>
          </div> : (
            <form onSubmit={request} className="space-y-3">
              <p className="text-xs text-muted-foreground">To keep our studio queue for serious makers, we ask a 20% advance of the estimate — <b>{formatPrice(dep)}</b> — before we work out your exact price. It's adjusted in your final bill.</p>
              <input name="name" required placeholder="Your name" className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm" />
              <input name="phone" required inputMode="numeric" maxLength={10} placeholder="Mobile number" className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm" />
              <input name="email" required type="email" defaultValue={user.data?.email ?? ""} placeholder="Email" className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm" />
              <input name="pin" required inputMode="numeric" maxLength={6} placeholder="Delivery PIN code" className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm" />
              <textarea name="note" rows={2} placeholder="Anything else? (optional)" className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
              <button className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground">Request exact price</button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
