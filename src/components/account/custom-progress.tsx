import { Check, Clock, Circle } from "lucide-react";
import { customProgress } from "@/lib/account";
import { formatPrice } from "@/lib/currency";
import { useContent } from "@/lib/site";

type Request = { status: string; deposit_status: string; deposit_amount: number; quote: number | null; quote_note: string | null };

export function CustomProgress({ request, compact = false }: { request: Request; compact?: boolean }) {
  const c = useContent("custom");
  const progress = customProgress(request);
  if (!progress) return null;
  const labels = { received: c.progressReceived, reviewing: c.progressReviewing, quoted: c.progressQuoted, accepted: c.progressAccepted, declined: c.progressDeclined };
  const notes = { received: c.progressReceivedNote, reviewing: c.progressReviewingNote, quoted: c.progressQuotedNote, accepted: c.progressAcceptedNote, declined: c.progressDeclinedNote };
  const steps = ["received", "reviewing", "quoted", "accepted"] as const;
  const index = steps.findIndex((step) => step === progress);
  const hasQuote = ["quoted", "accepted"].includes(progress) && request.quote != null;
  return (
    <div className="mt-3 space-y-3 text-xs" aria-label="Design request progress">
      <p className="flex items-center gap-2 font-semibold text-foreground"><Clock className="h-3.5 w-3.5 shrink-0" />{labels[progress]}</p>
      {!compact && progress !== "declined" && <ol className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {steps.map((step, i) => <li key={step} aria-current={i === index ? "step" : undefined} className={`flex items-start gap-1.5 ${i <= index ? "text-foreground" : "text-muted-foreground"}`}>
          {i < index ? <Check className="h-3.5 w-3.5 shrink-0" /> : <Circle className="h-3.5 w-3.5 shrink-0" />}<span>{labels[step]}</span>
        </li>)}
      </ol>}
      {!compact && <p className="text-muted-foreground">{notes[progress]}</p>}
      <p className="text-muted-foreground">{c.progressAdvanceLabel}: {formatPrice(Number(request.deposit_amount))}</p>
      {hasQuote && <div className="border-t border-border pt-3">
        <p className="font-semibold">{c.progressQuoteLabel}: {formatPrice(Number(request.quote))}</p>
        <p className="mt-1 text-muted-foreground">{c.progressBalanceLabel}: {formatPrice(Math.max(0, Number(request.quote) - Number(request.deposit_amount)))}</p>
        {!compact && request.quote_note && <p className="mt-2 text-muted-foreground">{request.quote_note}</p>}
      </div>}
    </div>
  );
}