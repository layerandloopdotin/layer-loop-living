import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Bookmark, Send } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { fieldValue, phoneSchema } from "@/lib/account";
import type { Design, Rates } from "@/lib/custom";
import { estimate } from "@/lib/custom";

/** Captures the sandbox's 3D view as a small JPEG for the saved-design card. */
async function snapshot(): Promise<Blob | null> {
  const canvas = document.querySelector<HTMLCanvasElement>("#sandbox canvas");
  if (!canvas) return null;
  const out = document.createElement("canvas");
  const k = Math.min(1, 480 / Math.max(canvas.width, canvas.height));
  out.width = Math.round(canvas.width * k); out.height = Math.round(canvas.height * k);
  const ctx = out.getContext("2d")!;
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
    const phone = fieldValue(fd, "phone");
    if (!phoneSchema.safeParse(phone).success) { toast.error("Enter a valid 10-digit mobile number"); return; }
    const pin = fieldValue(fd, "pin");
    if (!/^[1-9]\d{5}$/.test(pin)) { toast.error("Enter a 6-digit PIN code"); return; }
    const s = estimate(design, rates);
    const id = crypto.randomUUID();
    const { error } = await supabase.from("custom_requests").insert({
      id, user_id: uid ?? null, design: design as never, summary, estimate_low: s.low, estimate_high: s.high,
      contact: { name: fieldValue(fd, "name"), phone, email: fieldValue(fd, "email"), note: fieldValue(fd, "note"), address: { name: fieldValue(fd, "name"), phone, pin } },
    });
    if (error) { toast.error("Couldn't send your request"); return; }
    import("@/lib/notify.functions").then((m) => m.notifyNewRequest({ data: { kind: "custom", id } })).catch(() => {});
    setSent(true);
  };

  return (
    <>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => { setSent(false); setAsking(true); }} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-ink-foreground"><Send className="h-4 w-4" /> Request this design</button>
        <button type="button" disabled={saving} onClick={save} className="inline-flex items-center justify-center gap-2 rounded-full border border-ink/30 px-4 py-2.5 text-sm font-semibold disabled:opacity-60"><Bookmark className="h-4 w-4" /> {saving ? "Saving…" : "Save design"}</button>
      </div>
      <Dialog open={asking} onOpenChange={setAsking}>
        <DialogContent className="max-w-md">
          <DialogTitle className="font-display">{sent ? "Request sent" : "Request this design"}</DialogTitle>
          {sent ? <div className="space-y-3 text-sm">
            <p>Thanks! Our studio will review your design and send an exact price{uid ? " to your account" : " on WhatsApp or email"} shortly.</p>
            {uid && <Link to="/account/orders" className="inline-flex rounded-full bg-primary px-5 py-2.5 font-semibold text-primary-foreground">See my requests</Link>}
          </div> : (
            <form onSubmit={request} className="space-y-3">
              <p className="text-xs text-muted-foreground">We'll check printability and send you the exact price. Nothing is charged now.</p>
              <input name="name" required placeholder="Your name" className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm" />
              <input name="phone" required inputMode="numeric" maxLength={10} placeholder="Mobile number" className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm" />
              <input name="email" type="email" defaultValue={user.data?.email ?? ""} placeholder="Email (optional)" className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm" />
              <input name="pin" required inputMode="numeric" maxLength={6} placeholder="Delivery PIN code" className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm" />
              <textarea name="note" rows={2} placeholder="Anything else? (optional)" className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
              <button className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground">Send request</button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
