import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ImagePlus, Star, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

export function Stars({ value, onChange, size = "h-6 w-6" }: { value: number; onChange?: (v: number) => void; size?: string }) {
  return (
    <div className="flex gap-1" role={onChange ? "radiogroup" : undefined} aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => onChange
        ? <button key={n} type="button" role="radio" aria-checked={value === n} aria-label={`${n} star${n > 1 ? "s" : ""}`} onClick={() => onChange(n)}><Star className={`${size} ${n <= value ? "fill-primary text-primary" : "text-muted-foreground"}`} /></button>
        : <Star key={n} aria-hidden className={`${size} ${n <= value ? "fill-primary text-primary" : "text-muted-foreground/40"}`} />)}
    </div>
  );
}

export function ReviewDialog({ userId, slug, name, authorName, existing }: { userId: string; slug: string; name: string; authorName: string; existing?: { rating: number; status: string } | undefined }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [comment, setComment] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!rating) { toast.error("Pick a star rating"); return; }
    setBusy(true);
    try {
      const images: string[] = [];
      for (const f of files) {
        const path = `${userId}/${slug}-${crypto.randomUUID()}.${f.type.split("/")[1]}`;
        const { error } = await supabase.storage.from("review-media").upload(path, f, { contentType: f.type });
        if (error) throw new Error("Photo upload failed");
        images.push(path);
      }
      const { error } = await supabase.from("reviews").upsert({ product_slug: slug, user_id: userId, author_name: authorName, rating, comment: comment.trim(), images, status: "pending" }, { onConflict: "product_slug,user_id" });
      if (error) throw new Error(error.message.includes("delivered") ? "You can review products once they're delivered." : "Couldn't save your review");
      toast.success("Thanks! Your review will appear once approved.");
      qc.invalidateQueries({ queryKey: ["my-reviews"] });
      setOpen(false);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Something went wrong"); } finally { setBusy(false); }
  };

  const addFiles = (list: FileList | null) => {
    const ok = Array.from(list ?? []).filter((f) => /^image\/(png|jpeg|webp)$/.test(f.type) && f.size <= 5 * 1024 * 1024);
    setFiles((s) => [...s, ...ok].slice(0, 4));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="rounded-full border border-foreground px-3 py-1 text-xs">{existing ? (existing.status === "approved" ? "Edit review" : "Review pending · edit") : "Rate & review"}</button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogTitle className="font-display">Review {name}</DialogTitle>
        <Stars value={rating} onChange={setRating} size="h-8 w-8" />
        <textarea value={comment} onChange={(e) => setComment(e.target.value.slice(0, 2000))} rows={4} placeholder="How do you like it?" className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
        <div className="flex flex-wrap gap-2">
          {files.map((f, i) => (
            <div key={i} className="relative h-16 w-16 overflow-hidden rounded-lg">
              <img src={URL.createObjectURL(f)} alt="" className="h-full w-full object-cover" />
              <button type="button" aria-label="Remove photo" onClick={() => setFiles((s) => s.filter((_, k) => k !== i))} className="absolute right-0.5 top-0.5 rounded-full bg-background p-0.5"><X className="h-3 w-3" /></button>
            </div>
          ))}
          {files.length < 4 && <label className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-lg border border-dashed border-border"><ImagePlus className="h-5 w-5 text-muted-foreground" /><input type="file" accept="image/png,image/jpeg,image/webp" multiple hidden onChange={(e) => addFiles(e.target.files)} /></label>}
        </div>
        <button disabled={busy} onClick={submit} className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60">{busy ? "Saving…" : "Submit review"}</button>
      </DialogContent>
    </Dialog>
  );
}
