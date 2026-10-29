import { useRef, useState } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { img, MEDIA_BUCKET } from "@/lib/media";
import { LINK_TARGETS, type Field } from "@/lib/cms-schema";
import { Button } from "@/components/ui/button";

export const inputBase = "min-w-0 rounded-md border border-border bg-background px-3 py-2 text-sm";
export const inputCls = `w-full ${inputBase}`;
export const labelCls = "block text-xs font-semibold uppercase tracking-widest text-muted-foreground";

export async function uploadImage(file: File): Promise<string | null> {
  if (!file.type.startsWith("image/")) { toast.error("Please choose an image file"); return null; }
  if (file.size > 10 * 1024 * 1024) { toast.error("Images must be under 10 MB"); return null; }
  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${new Date().getFullYear()}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, { contentType: file.type });
  if (error) { toast.error(`Upload failed: ${error.message}`); return null; }
  return `media:${path}`;
}

function usePicker(onFiles: (files: File[]) => void, multiple = false, accept = "image/*") {
  const ref = useRef<HTMLInputElement>(null);
  const input = (
    <input ref={ref} type="file" accept={accept} multiple={multiple} className="hidden"
      onChange={(e) => { const f = Array.from(e.target.files ?? []); e.target.value = ""; if (f.length) onFiles(f); }} />
  );
  return { input, open: () => ref.current?.click() };
}

export function ImageInput({ value, onChange, logo = false }: { value: string; onChange: (v: string) => void; logo?: boolean }) {
  const [busy, setBusy] = useState(false);
  const { input, open } = usePicker(async ([f]) => {
    if (!f) return;
    if (logo && !["image/png", "image/svg+xml"].includes(f.type)) { toast.error("Please choose an SVG or PNG logo"); return; }
    setBusy(true);
    const ref = await uploadImage(f);
    setBusy(false);
    if (ref) onChange(ref);
  }, false, logo ? "image/png,image/svg+xml,.png,.svg" : "image/*");
  return (
    <div className="flex items-center gap-3">
      {input}
      <Button variant="outline" type="button" aria-label={logo ? "Upload logo" : "Upload photo"} onClick={open} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border-dashed bg-card p-1">
        {value ? <img src={img(value)} alt="" className={`h-full w-full ${logo ? "object-contain" : "object-cover"}`} /> : <ImagePlus className="mx-auto h-6 w-6 text-muted-foreground" />}
        {busy && <span className="absolute inset-0 flex items-center justify-center bg-background/70"><Loader2 className="h-5 w-5 animate-spin" /></span>}
      </Button>
      <div className="flex flex-col gap-1 text-xs">
        <button type="button" onClick={open} className="font-semibold underline-offset-4 hover:underline">{value ? "Replace photo" : "Upload photo"}</button>
        {value && <button type="button" onClick={() => onChange("")} className="text-left text-muted-foreground hover:text-destructive">Remove</button>}
      </div>
    </div>
  );
}

const move = <T,>(list: T[], i: number, d: number) => {
  const j = i + d;
  if (j < 0 || j >= list.length) return list;
  const next = [...list];
  [next[i], next[j]] = [next[j]!, next[i]!];
  return next;
};

export function ImagesInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [busy, setBusy] = useState(0);
  const { input, open } = usePicker(async (files) => {
    setBusy(files.length);
    const refs: string[] = [];
    for (const f of files) {
      const r = await uploadImage(f);
      if (r) refs.push(r);
      setBusy((b) => b - 1);
    }
    onChange([...value, ...refs]);
  }, true);
  return (
    <div>
      {input}
      <div className="flex flex-wrap gap-3">
        {value.map((ref, i) => (
          <div key={ref + i} className="group relative h-24 w-24 overflow-hidden rounded-lg border border-border">
            <img src={img(ref)} alt="" className="h-full w-full object-cover" />
            <span className="absolute left-1 top-1 rounded bg-background/90 px-1.5 text-[10px]">{i + 1}</span>
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-background/90 p-0.5 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
              <button type="button" aria-label="Move earlier" onClick={() => onChange(move(value, i, -1))} className="p-1"><ArrowUp className="h-3 w-3 -rotate-90" /></button>
              <button type="button" aria-label="Remove photo" onClick={() => onChange(value.filter((_, k) => k !== i))} className="p-1 text-destructive"><X className="h-3 w-3" /></button>
              <button type="button" aria-label="Move later" onClick={() => onChange(move(value, i, 1))} className="p-1"><ArrowDown className="h-3 w-3 -rotate-90" /></button>
            </div>
          </div>
        ))}
        <button type="button" onClick={open} className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border bg-card text-xs text-muted-foreground hover:border-foreground">
          {busy > 0 ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
          {busy > 0 ? `${busy} left` : "Add photos"}
        </button>
      </div>
    </div>
  );
}

export function StringsInput({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  return (
    <div className="space-y-2">
      {value.map((v, i) => (
        <div key={i} className="flex gap-2">
          <input value={v} placeholder={placeholder} onChange={(e) => onChange(value.map((x, k) => (k === i ? e.target.value : x)))} className={inputCls} />
          <RowTools onUp={() => onChange(move(value, i, -1))} onDown={() => onChange(move(value, i, 1))} onRemove={() => onChange(value.filter((_, k) => k !== i))} />
        </div>
      ))}
      <button type="button" onClick={() => onChange([...value, ""])} className="inline-flex items-center gap-1 text-xs font-semibold"><Plus className="h-3.5 w-3.5" /> Add</button>
    </div>
  );
}

export function RowTools({ onUp, onDown, onRemove }: { onUp: () => void; onDown: () => void; onRemove: () => void }) {
  return (
    <div className="flex shrink-0 items-center gap-0.5">
      <button type="button" aria-label="Move up" onClick={onUp} className="rounded p-1.5 hover:bg-muted"><ArrowUp className="h-3.5 w-3.5" /></button>
      <button type="button" aria-label="Move down" onClick={onDown} className="rounded p-1.5 hover:bg-muted"><ArrowDown className="h-3.5 w-3.5" /></button>
      <button type="button" aria-label="Remove" onClick={onRemove} className="rounded p-1.5 text-destructive hover:bg-muted"><Trash2 className="h-3.5 w-3.5" /></button>
    </div>
  );
}

type Obj = Record<string, unknown>;
export type ProductOption = { slug: string; name: string };

const blank = (f: Field): unknown => (f.t === "list" || f.t === "images" || f.t === "strings" ? [] : "");

export function FieldInput({ field, value, onChange, products }: { field: Field; value: unknown; onChange: (v: unknown) => void; products: ProductOption[] }) {
  const str = typeof value === "string" ? value : "";
  const arr = Array.isArray(value) ? value : [];
  switch (field.t) {
    case "select":
      return <select aria-label={field.label} value={str} onChange={(e) => onChange(e.target.value)} className={inputCls}>{field.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>;
    case "textarea":
      return <textarea value={str} rows={Math.min(10, Math.max(3, str.split("\n").length + 1))} onChange={(e) => onChange(e.target.value)} className={inputCls} />;
    case "image":
      return <ImageInput value={str} onChange={onChange} logo={field.k === "logoImage"} />;
    case "images":
      return <ImagesInput value={arr.map(String)} onChange={onChange} />;
    case "strings":
      return <StringsInput value={arr.map(String)} onChange={onChange} />;
    case "link":
      return (
        <select value={str} onChange={(e) => onChange(e.target.value)} className={inputCls}>
          {LINK_TARGETS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
        </select>
      );
    case "product":
      return (
        <select value={str} onChange={(e) => onChange(e.target.value)} className={inputCls}>
          <option value="">Choose a product</option>
          {products.map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}
        </select>
      );
    case "color":
      return <input type="color" value={str || "#cccccc"} onChange={(e) => onChange(e.target.value)} className="h-9 w-16 rounded border border-border" />;
    case "list": {
      const items = arr as Obj[];
      const set = (i: number, k: string, v: unknown) => onChange(items.map((it, n) => (n === i ? { ...it, [k]: v } : it)));
      return (
        <div className="space-y-3">
          {items.map((it, i) => (
            <div key={i} className="rounded-xl border border-border bg-background p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold capitalize text-muted-foreground">{field.item} {i + 1}</span>
                <RowTools onUp={() => onChange(move(items, i, -1))} onDown={() => onChange(move(items, i, 1))} onRemove={() => onChange(items.filter((_, k) => k !== i))} />
              </div>
              <div className="grid gap-4">
                {field.of.map((sub) => (
                  <label key={sub.k} className="grid gap-1.5">
                    <span className={labelCls}>{sub.label}</span>
                    <FieldInput field={sub} value={it[sub.k]} onChange={(v) => set(i, sub.k, v)} products={products} />
                    {sub.help && <span className="text-xs text-muted-foreground">{sub.help}</span>}
                  </label>
                ))}
              </div>
            </div>
          ))}
          <button type="button" onClick={() => onChange([...items, Object.fromEntries(field.of.map((f) => [f.k, f.t === "link" ? "/" : blank(f)]))])}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-1.5 text-xs font-semibold hover:border-foreground">
            <Plus className="h-3.5 w-3.5" /> Add {field.item}
          </button>
        </div>
      );
    }
    default:
      return <input type={field.t === "url" ? "url" : "text"} value={str} onChange={(e) => onChange(e.target.value)} className={inputCls} />;
  }
}
