import { describe, expect, it } from "vitest";
import { addressSchema, customProgress, designRequestContactSchema, matchesSavedDesign, inTab, phoneSchema, stepIndex, tabOf } from "@/lib/account";

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
  const request = { name: "Asha", email: "asha@example.com", phone: "9876543210", pin: "400001" };
  it("requires a name on design requests", () => {
    expect(designRequestContactSchema.safeParse(request).success).toBe(true);
    expect(designRequestContactSchema.safeParse({ ...request, name: " " }).success).toBe(false);
  });
  it("requires a valid email on design requests", () => {
    expect(designRequestContactSchema.safeParse({ ...request, email: "" }).success).toBe(false);
    expect(designRequestContactSchema.safeParse({ ...request, email: "invalid" }).success).toBe(false);
  });
  it("requires a phone number on design requests", () => {
    expect(designRequestContactSchema.safeParse({ ...request, phone: "" }).success).toBe(false);
  });
  it("accepts a 10-digit Indian mobile", () => expect(phoneSchema.safeParse("9876543210").success).toBe(true));
  it("rejects short mobiles", () => expect(phoneSchema.safeParse("98765").success).toBe(false));
  it("requires a 6-digit PIN", () => {
    const base = { label: "Home", name: "A", phone: "9876543210", line1: "12 Road", line2: "", city: "Mumbai", state: "MH" };
    expect(addressSchema.safeParse({ ...base, pin: "400001" }).success).toBe(true);
    expect(addressSchema.safeParse({ ...base, pin: "4000" }).success).toBe(false);
  });
});

describe("advance-paid custom progress", () => {
  it("does not expose progress before the advance is paid, even for a quote", () => {
    expect(customProgress({ deposit_status: "pending", status: "requested" })).toBeNull();
    expect(customProgress({ deposit_status: "pending", status: "quoted" })).toBeNull();
  });
  it("starts at received once payment is confirmed", () => {
    expect(customProgress({ deposit_status: "paid", status: "requested" })).toBe("received");
  });
  it("reflects the team's review, quote, acceptance and decline", () => {
    for (const status of ["reviewing", "quoted", "accepted", "declined"] as const) {
      expect(customProgress({ deposit_status: "paid", status })).toBe(status);
    }
  });
  it("links requests to the saved design even after editing it", () => {
    expect(matchesSavedDesign({ id: "lamp-1", design: { height: 30 } }, { contact: { saved_design_id: "lamp-1" }, design: { height: 20 } })).toBe(true);
    expect(matchesSavedDesign({ id: "lamp-2", design: { height: 20 } }, { contact: { saved_design_id: "lamp-1" }, design: { height: 20 } })).toBe(false);
  });
  it("matches older snapshots regardless of object key ordering", () => {
    expect(matchesSavedDesign({ id: "old", design: { shape: "lamp", height: 20 } }, { contact: {}, design: { height: 20, shape: "lamp" } })).toBe(true);
    expect(matchesSavedDesign({ id: "old", design: { height: 30 } }, { contact: {}, design: { height: 20 } })).toBe(false);
  });
});
