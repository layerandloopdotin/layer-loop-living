import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CreditCard, Smartphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/account/payments")({ component: Payments });

function Payments() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["payments"], queryFn: async () => {
    const { data, error } = await supabase.from("saved_payment_methods").select("id, kind, label, provider, created_at").order("created_at", { ascending: false });
    if (error) throw error; return data;
  } });
  const remove = async (id: string) => { await supabase.from("saved_payment_methods").delete().eq("id", id); qc.invalidateQueries({ queryKey: ["payments"] }); };
  return (
    <div>
      <h2 className="font-display text-xl font-bold">Saved payment methods</h2>
      <p className="mt-1 text-sm text-muted-foreground">Cards and UPI IDs you chose to save during checkout. We never store full card numbers.</p>
      {q.data?.length === 0 && <p className="mt-6 rounded-xl bg-card p-6 text-sm text-muted-foreground">No saved payment methods.</p>}
      <ul className="mt-6 space-y-3">
        {q.data?.map((m) => { const Icon = m.kind === "upi" ? Smartphone : CreditCard; return (
          <li key={m.id} className="flex items-center gap-4 rounded-xl border border-border p-4 text-sm">
            <Icon className="h-5 w-5 text-primary" /><span className="flex-1">{m.label}</span>
            <button onClick={() => remove(m.id)} className="text-xs text-destructive underline">Remove</button>
          </li>
        ); })}
      </ul>
    </div>
  );
}
