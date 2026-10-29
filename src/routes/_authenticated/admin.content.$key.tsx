import { createFileRoute, notFound } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { defaults, mergeContent, sections, type ContentKey } from "@/lib/cms-schema";
import { FieldInput, labelCls } from "@/components/admin/fields";
import type { Json } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_authenticated/admin/content/$key")({
  beforeLoad: ({ params }) => { if (!(params.key in sections)) throw notFound(); },
  component: ContentEditor,
});

function ContentEditor() {
  const { key: rawKey } = Route.useParams();
  const key = rawKey as ContentKey;
  const spec = sections[key];
  const qc = useQueryClient();
  const saved = useQuery({
    queryKey: ["admin", "content", key],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_content").select("data").eq("key", key).maybeSingle();
      if (error) throw error;
      return data?.data ?? null;
    },
  });
  const products = useQuery({
    queryKey: ["admin", "product-options"],
    queryFn: async () => (await supabase.from("products").select("slug, name").order("sort")).data ?? [],
  });
  const [value, setValue] = useState<Record<string, unknown> | null>(null);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (saved.isSuccess) { setValue(mergeContent(key, saved.data) as Record<string, unknown>); setDirty(false); }
  }, [saved.isSuccess, saved.data, key]);

  const save = async () => {
    if (!value) return;
    setBusy(true);
    const { error } = await supabase.from("site_content").upsert({ key, data: value as Json });
    setBusy(false);
    if (error) return toast.error(`Couldn't save: ${error.message}`);
    setDirty(false);
    toast.success("Saved — the website is updated");
    qc.invalidateQueries({ queryKey: ["site"] });
    qc.invalidateQueries({ queryKey: ["admin", "content", key] });
  };

  const reset = () => { setValue({ ...(defaults[key] as Record<string, unknown>) }); setDirty(true); };

  if (!value) return <Loader2 className="h-6 w-6 animate-spin" />;

  return (
    <div className="max-w-3xl pb-24">
      <h1 className="text-3xl font-bold">{spec.title}</h1>
      <p className="mt-2 text-muted-foreground">{spec.description}</p>
      <div className="mt-8 space-y-6">
        {spec.groups.map((g) => (
          <section key={g.title} className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold">{g.title}</h2>
            <div className="mt-5 grid gap-5">
              {g.fields.map((f) => (
                <div key={f.k} className="grid gap-1.5">
                  <span className={labelCls}>{f.label}</span>
                  <FieldInput field={f} value={value[f.k]} products={products.data ?? []}
                    onChange={(v) => { setValue((cur) => ({ ...cur, [f.k]: v })); setDirty(true); }} />
                  {f.help && <span className="text-xs text-muted-foreground">{f.help}</span>}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 py-3 pl-[17rem] pr-8 backdrop-blur">
        <div className="flex max-w-3xl items-center justify-between gap-4">
          <button type="button" onClick={reset} className="text-xs text-muted-foreground hover:text-foreground">Restore original text &amp; photos</button>
          <div className="flex items-center gap-3">
            {dirty && <span className="text-xs text-muted-foreground">Unsaved changes</span>}
            <button onClick={save} disabled={busy || !dirty} className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">{busy ? "Saving…" : "Save changes"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
