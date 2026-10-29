import { describe, expect, it } from "vitest";
import { careersSchema } from "@/lib/contact";

const valid = {
  name: "Aditi Sharma",
  email: "aditi@example.com",
  phone: "+91 98000 00000",
  role: "3D Printing & Fabrication",
  portfolio: "linkedin.com/in/aditi",
  offer: "I have run a farm of twelve FDM machines and would love to tune prints for your range.",
};

describe("Careers application form", () => {
  it("accepts a complete application", () => {
    expect(careersSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const r = careersSchema.safeParse({ ...valid, email: "aditi-at-example" });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].path[0]).toBe("email");
  });

  it("rejects a phone number that is not a number", () => {
    const r = careersSchema.safeParse({ ...valid, phone: "call me later" });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].path[0]).toBe("phone");
  });

  it("requires a remark about what the person offers", () => {
    const r = careersSchema.safeParse({ ...valid, offer: "   " });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].path[0]).toBe("offer");
  });

  it("requires a role to be chosen", () => {
    const r = careersSchema.safeParse({ ...valid, role: "" });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].path[0]).toBe("role");
  });
});
