import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Camera, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AVATARS, avatarRef, fieldValue, profileSchema } from "@/lib/account";
import { img } from "@/lib/media";
import { profileQuery, useAvatarUrl } from "@/lib/use-account";

export const Route = createFileRoute("/_authenticated/account/")({ component: Profile });

const input = "mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm";
const label = "block text-xs uppercase tracking-widest text-muted-foreground";

function Profile() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const q = useQuery(profileQuery(user.id));
  const [busy, setBusy] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  const current = avatarRef(q.data?.avatar);
  const uploadedUrl = useAvatarUrl(current.startsWith("avatars:") ? current : null, img);

  const save = async (patch: Record<string, string | null>) => {
    const { error } = await supabase.from("profiles").upsert({ id: user.id, ...patch });
    if (error) throw error;
    await qc.invalidateQueries({ queryKey: ["profile", user.id] });
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const v = profileSchema.safeParse({ full_name: fieldValue(fd, "full_name"), phone: fieldValue(fd, "phone"), gender: fieldValue(fd, "gender") });
    if (!v.success) return toast.error(v.error.issues[0].message);
    setBusy(true);
    try { await save({ ...v.data, gender: v.data.gender || null }); toast.success("Profile saved"); }
    catch { toast.error("Couldn't save your profile"); } finally { setBusy(false); }
  };

  const upload = async (f: File | undefined) => {
    if (!f) return;
    if (!/^image\/(png|jpe?g|webp)$/.test(f.type)) return toast.error("Use a JPG, PNG or WebP image");
    if (f.size > 5 * 1024 * 1024) return toast.error("Image must be under 5 MB");
    const path = `${user.id}/avatar-${Date.now()}.${f.type.split("/")[1]}`;
    const { error } = await supabase.storage.from("avatars").upload(path, f, { contentType: f.type });
    if (error) return toast.error("Upload failed");
    await save({ avatar: `avatars:${path}` });
    toast.success("Photo updated");
  };

  if (q.isPending) return <p className="text-sm text-muted-foreground">Loading…</p>;
  const p = q.data;

  return (
    <div className="space-y-10">
      <div>
        <h2 className="font-display text-xl font-bold">Profile photo <span className="text-sm font-normal text-muted-foreground">(optional)</span></h2>
        <p className="mt-1 text-sm text-muted-foreground">Pick a buddy or upload your own photo.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          {AVATARS.map((a) => (
            <button key={a} type="button" aria-label="Choose this avatar" aria-pressed={current === a} onClick={() => save({ avatar: a }).catch(() => toast.error("Couldn't update"))}
              className={`relative h-16 w-16 overflow-hidden rounded-full border-2 transition ${current === a ? "border-primary" : "border-transparent hover:border-border"}`}>
              <img src={img(a)} alt="" loading="lazy" width={64} height={64} className="h-full w-full object-cover" />
              {current === a && <Check className="absolute bottom-0 right-0 h-5 w-5 rounded-full bg-primary p-0.5 text-primary-foreground" />}
            </button>
          ))}
          <button type="button" onClick={() => file.current?.click()} className={`relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-dashed ${uploadedUrl ? "border-primary" : "border-border"}`} aria-label="Upload a photo">
            {uploadedUrl ? <img src={uploadedUrl} alt="" className="h-full w-full object-cover" /> : <Camera className="h-5 w-5 text-muted-foreground" />}
          </button>
          <input ref={file} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(e) => upload(e.target.files?.[0])} />
        </div>
      </div>

      <form onSubmit={submit} className="grid max-w-xl gap-4 sm:grid-cols-2">
        <h2 className="font-display text-xl font-bold sm:col-span-2">Your details</h2>
        <label className={`${label} sm:col-span-2`}>Name<input name="full_name" defaultValue={p?.full_name ?? ""} className={input} autoComplete="name" /></label>
        <label className={label}>Phone number<input name="phone" defaultValue={(p?.phone ?? user.phone ?? "").replace(/^\+?91/, "")} inputMode="numeric" maxLength={10} className={input} autoComplete="tel-national" /></label>
        <label className={label}>Email<input value={user.email ?? p?.email ?? ""} readOnly className={`${input} text-muted-foreground`} /></label>
        <label className={label}>Gender <span className="normal-case tracking-normal">(optional)</span>
          <select name="gender" defaultValue={p?.gender ?? ""} className={input}>
            <option value="">Not set</option><option value="female">Female</option><option value="male">Male</option>
            <option value="non_binary">Non-binary</option><option value="prefer_not">Prefer not to say</option>
          </select>
        </label>
        <div className="sm:col-span-2"><button disabled={busy} className="rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60">{busy ? "Saving…" : "Save changes"}</button></div>
      </form>
    </div>
  );
}
