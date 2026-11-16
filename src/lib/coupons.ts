import { supabase } from "@/integrations/supabase/client";
import type { CouponResult } from "@/lib/pricing";

/** Asks the database whether a code is live for this subtotal. Only admin-created coupons pass. */
export async function checkCoupon(code: string, subtotal: number): Promise<CouponResult> {
  const { data, error } = await supabase.rpc("check_coupon", { _code: code, _subtotal: subtotal });
  if (error || !data) return { ok: false, message: "Couldn't check that code. Try again." };
  return data as unknown as CouponResult;
}
