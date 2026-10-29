import { describe, expect, it } from "vitest";
import { checkPincode } from "@/lib/delivery";

describe("checkPincode", () => {
  it("rejects PINs that are not 6 digits", () => expect(checkPincode("4000").ok).toBe(false));
  it("rejects PINs starting with 0", () => expect(checkPincode("012345").ok).toBe(false));
  it("Mumbai PINs deliver in 1–2 days", () => {
    const r = checkPincode("400050");
    expect(r.ok && r.days).toBe("1–2 days");
  });
  it("other PINs deliver in 4–7 days", () => {
    const r = checkPincode("560001");
    expect(r.ok && r.days).toBe("4–7 days");
  });
});
