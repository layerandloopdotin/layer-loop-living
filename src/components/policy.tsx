import type { ReactNode } from "react";
import { DarkHero, Page } from "@/components/site";

export function PolicyPage({ eyebrow, title, intro, sections }: { eyebrow: string; title: string; intro: string; sections: { h: string; body: ReactNode }[] }) {
  return (
    <Page>
      <DarkHero eyebrow={eyebrow} title={title}>
        <p className="mt-4 max-w-xl text-ink-muted">{intro}</p>
      </DarkHero>
      <section className="mx-auto max-w-3xl px-6 py-16">
        <p className="rounded-xl bg-card p-5 text-sm text-muted-foreground">This is a summary for reference while the full legal document is being finalised. Final terms will be published on this page.</p>
        <div className="mt-10 space-y-10">
          {sections.map((s, i) => (
            <div key={s.h}>
              <h2 className="font-display text-xl font-semibold"><span className="mr-3 text-primary">{String(i + 1).padStart(2, "0")}</span>{s.h}</h2>
              <div className="mt-3 space-y-3 leading-relaxed text-muted-foreground">{s.body}</div>
            </div>
          ))}
        </div>
        <p className="mt-14 border-t border-border pt-6 text-xs text-muted-foreground">Last updated: October 2026. Questions? Write to hello@layerandloop.in.</p>
      </section>
    </Page>
  );
}
