import { describe, expect, it } from "vitest";
import { addressSchema, inTab, phoneSchema, stepIndex, tabOf } from "@/lib/account";

describe("order tabs", () => {
  it("production through out-for-delivery is live", () => {
    expect(tabOf("in_production")).toBe("live");
    expect(tabOf("out_for_delivery")).toBe("live");
  });
  it("delivered is not live", () => expect(inTab("delivered", "live")).toBe(false));
  it("cancelled, replaced and returns get their own tabs", () => {
    expect(tabOf("cancelled")).toBe("cancelled");
    expect(tabOf("replaced")).toBe("replaced");
    expect(tabOf("returned")).toBe("returns");
  });
  it("timeline order is production → QC → dispatched → out for delivery → delivered", () => {
    expect(stepIndex("quality_check")).toBe(1);
    expect(stepIndex("delivered")).toBe(4);
  });
});

describe("customer details", () => {
  it("accepts a 10-digit Indian mobile", () => expect(phoneSchema.safeParse("9876543210").success).toBe(true));
  it("rejects short mobiles", () => expect(phoneSchema.safeParse("98765").success).toBe(false));
  it("requires a 6-digit PIN", () => {
    const base = { label: "Home", name: "A", phone: "9876543210", line1: "12 Road", line2: "", city: "Mumbai", state: "MH" };
    expect(addressSchema.safeParse({ ...base, pin: "400001" }).success).toBe(true);
    expect(addressSchema.safeParse({ ...base, pin: "4000" }).success).toBe(false);
  });
});
