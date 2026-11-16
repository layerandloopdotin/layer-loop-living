import { describe, expect, it } from "vitest";
import { cartTotals, evaluateCoupon, type Coupon } from "@/lib/pricing";

const base: Coupon = { code: "LOOP10", kind: "percent", amount: 10, min_order: 0, starts_at: null, ends_at: null, usage_limit: null, active: true };
const now = new Date("2026-11-16T12:00:00Z");

describe("totals", () => {
  it("charges ₹99 shipping below ₹999", () => expect(cartTotals(560).shipping).toBe(99));
  it("ships free from ₹999", () => expect(cartTotals(999).shipping).toBe(0));
  it("total = subtotal − discount + shipping", () => expect(cartTotals(560, 100).total).toBe(559));
});

describe("live coupons", () => {
  it("percent coupon takes 10% off", () => expect(evaluateCoupon(base, 1000, now)).toMatchObject({ ok: true, discount: 100 }));
  it("fixed coupon never exceeds subtotal", () => expect(evaluateCoupon({ ...base, kind: "fixed", amount: 500 }, 300, now)).toMatchObject({ discount: 300 }));
  it("inactive coupons are rejected", () => expect(evaluateCoupon({ ...base, active: false }, 1000, now).ok).toBe(false));
  it("expired coupons are rejected", () => expect(evaluateCoupon({ ...base, ends_at: "2026-11-01T00:00:00Z" }, 1000, now).ok).toBe(false));
  it("not-yet-started coupons are rejected", () => expect(evaluateCoupon({ ...base, starts_at: "2026-12-01T00:00:00Z" }, 1000, now).ok).toBe(false));
  it("minimum order applies", () => expect(evaluateCoupon({ ...base, min_order: 500 }, 400, now).ok).toBe(false));
  it("usage limit applies", () => expect(evaluateCoupon({ ...base, usage_limit: 5 }, 1000, now, 5).ok).toBe(false));
});
