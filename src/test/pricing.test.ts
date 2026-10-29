import { describe, expect, it } from "vitest";
import { applyCoupon, cartTotals } from "@/lib/pricing";

describe("cart pricing", () => {
  it("charges ₹99 shipping below ₹999", () => expect(cartTotals(560).shipping).toBe(99));
  it("ships free from ₹999", () => expect(cartTotals(999).shipping).toBe(0));
  it("WELCOME10 takes 10% off", () => expect(cartTotals(1000, "WELCOME10").discount).toBe(100));
  it("LOOP100 needs ₹500 subtotal", () => expect(applyCoupon("loop100", 400).ok).toBe(false));
  it("unknown codes are rejected", () => expect(applyCoupon("FREE", 1000).ok).toBe(false));
  it("total = subtotal − discount + shipping", () => expect(cartTotals(560, "LOOP100").total).toBe(559));
});
