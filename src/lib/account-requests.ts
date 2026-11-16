import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const myRequestsQuery = queryOptions({
  queryKey: ["my-requests"],
  refetchInterval: 15_000,
  queryFn: async () => {
    const { data, error } = await supabase.from("custom_requests").select("id, summary, design, contact, estimate_low, estimate_high, quote, quote_note, status, created_at, updated_at, deposit_amount, deposit_status").order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});