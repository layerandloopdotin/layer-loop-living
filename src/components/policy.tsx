import { DarkHero, Page } from "@/components/site";
import { useContent } from "@/lib/site";

export function PolicyPage({ which }: { which: "terms" | "returns" }) {
  const c = useContent(which);
  return (
    <Page>
      <DarkHero eyebrow={c.eyebrow} title={c.title}>
        <p className="mt-4 max-w-xl text-ink-muted">{c.intro}</p>
      </DarkHero>
      <section className="mx-auto max-w-3xl px-6 py-16">
        {c.notice && <p className="rounded-xl bg-card p-5 text-sm text-muted-foreground">{c.notice}</p>}
        <div className="mt-10 space-y-10">
          {c.sections.map((s, i) => (
            <div key={i}>
              <h2 className="font-display text-xl font-semibold"><span className="mr-3 text-primary">{String(i + 1).padStart(2, "0")}</span>{s.heading}</h2>
              <div className="mt-3 space-y-3 leading-relaxed text-muted-foreground">
                {s.body.split(/\n\s*\n/).map((para, k) => <p key={k} className="whitespace-pre-line">{para}</p>)}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-14 border-t border-border pt-6 text-xs text-muted-foreground">{c.footer}</p>
      </section>
    </Page>
  );
}
