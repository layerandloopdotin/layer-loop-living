import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type TrackingScan = { date: string; activity: string; location: string };
export type Tracking = { connected: boolean; status?: string; etd?: string; url?: string; scans: TrackingScan[] };

/** Live Shiprocket tracking for one of the caller's own orders (looked up by RLS). */
export const getOrderTracking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { orderId: string }) => ({ orderId: String(input.orderId) }))
  .handler(async ({ data, context }): Promise<Tracking> => {
    const { data: order } = await context.supabase.from("orders").select("awb").eq("id", data.orderId).maybeSingle();
    if (!order?.awb) return { connected: false, scans: [] };
    const url = `https://shiprocket.co/tracking/${encodeURIComponent(order.awb)}`;
    const email = process.env["SHIPROCKET_EMAIL"], password = process.env["SHIPROCKET_PASSWORD"];
    if (!email || !password) return { connected: false, url, scans: [] };
    try {
      const login = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
        method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, password }),
      });
      const { token } = (await login.json()) as { token?: string };
      if (!token) return { connected: false, url, scans: [] };
      const res = await fetch(`https://apiv2.shiprocket.in/v1/external/courier/track/awb/${encodeURIComponent(order.awb)}`, { headers: { authorization: `Bearer ${token}` } });
      const j = (await res.json()) as { tracking_data?: { etd?: string; track_url?: string; shipment_track?: { current_status?: string }[]; shipment_track_activities?: { date: string; activity: string; location: string }[] } };
      const t = j.tracking_data;
      return {
        connected: true, url: t?.track_url || url, etd: t?.etd, status: t?.shipment_track?.[0]?.current_status,
        scans: (t?.shipment_track_activities ?? []).map((s) => ({ date: s.date, activity: s.activity, location: s.location })),
      };
    } catch {
      return { connected: false, url, scans: [] };
    }
  });
