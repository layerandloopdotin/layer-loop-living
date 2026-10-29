// Placeholder shop rules — replace with real values when confirmed.
export const FREE_SHIPPING_FROM = 999;
export const SHIPPING_FEE = 99;

export const coupons: Record<string, { label: string; discount: (subtotal: number) => number; min?: number }> = {
  WELCOME10: { label: "10% off your order", discount: (s) => Math.round(s * 0.1) },
  LOOP100: { label: "₹100 off orders above ₹500", min: 500, discount: () => 100 },
};

export type CouponResult = { ok: true; code: string; label: string } | { ok: false; message: string };

export function applyCoupon(input: string, subtotal: number): CouponResult {
  const code = input.trim().toUpperCase();
  const c = coupons[code];
  if (!c) return { ok: false, message: "That code isn't valid." };
  if (c.min && subtotal < c.min) return { ok: false, message: `Add items worth ₹${c.min} or more to use ${code}.` };
  return { ok: true, code, label: c.label };
}

export function cartTotals(subtotal: number, couponCode?: string) {
  const c = couponCode ? coupons[couponCode] : undefined;
  const discount = c && (!c.min || subtotal >= c.min) ? Math.min(subtotal, c.discount(subtotal)) : 0;
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_FEE;
  return { subtotal, discount, shipping, total: subtotal - discount + shipping };
}
