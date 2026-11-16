// Shop rules. Coupons live in the database (admin → Coupons); `check_coupon` is the
// authority. `evaluateCoupon` mirrors its rules for admin previews and tests.
export const FREE_SHIPPING_FROM = 999;
export const SHIPPING_FEE = 99;

export type Coupon = { code: string; kind: "percent" | "fixed"; amount: number; min_order: number; starts_at: string | null; ends_at: string | null; usage_limit: number | null; active: boolean };
export type CouponResult = { ok: true; code: string; label: string; discount: number } | { ok: false; message: string };

export function evaluateCoupon(c: Coupon, subtotal: number, now = new Date(), used = 0): CouponResult {
  if (!c.active || (c.starts_at && now < new Date(c.starts_at)) || (c.ends_at && now > new Date(c.ends_at))) return { ok: false, message: "That code isn't valid." };
  if (c.usage_limit != null && used >= c.usage_limit) return { ok: false, message: "This code has been fully used." };
  if (subtotal < c.min_order) return { ok: false, message: `Add items worth ₹${c.min_order} or more to use ${c.code}.` };
  const discount = c.kind === "percent" ? Math.round((subtotal * Math.min(c.amount, 100)) / 100) : Math.min(c.amount, subtotal);
  return { ok: true, code: c.code, label: c.code, discount };
}

export function cartTotals(subtotal: number, discount = 0) {
  const d = Math.max(0, Math.min(subtotal, discount));
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_FEE;
  return { subtotal, discount: d, shipping, total: subtotal - d + shipping };
}
