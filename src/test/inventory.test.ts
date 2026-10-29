import { describe, expect, it } from "vitest";
import { inventoryQuantitySchema } from "@/lib/inventory";

describe("CMS inventory quantity", () => {
  it("stores whole-number stock counts including zero", () => {
    expect(inventoryQuantitySchema.parse("25")).toBe(25);
    expect(inventoryQuantitySchema.parse("0")).toBe(0);
  });
  it("rejects negative, fractional, blank and oversized stock counts", () => {
    for (const value of ["-1", "1.5", "", "2147483648"]) expect(inventoryQuantitySchema.safeParse(value).success).toBe(false);
  });
});