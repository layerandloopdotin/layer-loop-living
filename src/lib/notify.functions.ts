import { createServerFn } from "@tanstack/react-start";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/whatsapp";

/**
 * Sends the shop's WhatsApp alert for a just-created order or custom request.
 * Callable by anyone (guests create requests), so it only acts on a matching
 * admin notification that is under 15 minutes old and not yet sent.
 */
export const notifyNewRequest = createServerFn({ method: "POST" })
  .inputValidator((input: { kind: "order" | "custom"; id: string }) => {
    if (input.kind !== "order" && input.kind !== "custom") throw new Error("bad kind");
    if (!/^[0-9a-f-]{36}$/i.test(String(input.id))) throw new Error("bad id");
    return { kind: input.kind, id: String(input.id) };
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const since = new Date(Date.now() - 15 * 60_000).toISOString();
    const { data: claimed } = await supabaseAdmin.from("admin_notifications")
      .update({ sent_at: new Date().toISOString() })
      .eq("kind", data.kind).eq("ref_id", data.id).is("sent_at", null).gte("created_at", since)
      .select("title").maybeSingle();
    if (!claimed) return { sent: false };

    const { data: settings } = await supabaseAdmin.from("admin_settings").select("*").maybeSingle();
    const results: string[] = [];
    const lovableKey = process.env["LOVABLE_API_KEY"], waKey = process.env["WHATSAPP_API_KEY"];
    const to = settings?.notify_whatsapp?.replace(/\D/g, "");
    if (settings?.whatsapp_on && to && lovableKey && waKey) {
      const res = await fetch(`${GATEWAY_URL}/messages`, {
        method: "POST",
        headers: { Authorization: `Bearer ${lovableKey}`, "X-Connection-Api-Key": waKey, "Content-Type": "application/json" },
        body: JSON.stringify({ messaging_product: "whatsapp", to: to.length === 10 ? `91${to}` : to, type: "text", text: { body: `Layer & Loop — ${claimed.title}. Open the admin panel to review.` } }),
      });
      if (!res.ok) console.error(`WhatsApp alert failed [${res.status}]: ${await res.text()}`);
      else results.push("whatsapp");
    }
    // Email alerts start once the shop's sending domain is set up.
    return { sent: results.length > 0 };
  });
