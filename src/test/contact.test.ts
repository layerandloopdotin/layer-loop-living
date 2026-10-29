import { describe, expect, it } from "vitest";
import { careersSchema, fieldValue } from "@/lib/contact";

const valid = {
  name: "Aditi Sharma",
  email: "aditi@example.com",
  phone: "+91 98000 00000",
  role: "3D Printing & Fabrication",
  portfolio: "linkedin.com/in/aditi",
  offer: "I have run a farm of twelve FDM machines and would love to tune prints for your range.",
};

const firstIssue = (r: ReturnType<typeof careersSchema.safeParse>) =>
  r.success ? undefined : r.error.issues[0];

describe("Careers application form", () => {
  it("accepts a complete application", () => {
    expect(careersSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const issue = firstIssue(careersSchema.safeParse({ ...valid, email: "aditi-at-example" }));
    expect(issue?.path[0]).toBe("email");
  });

  it("rejects a phone number that is not a number", () => {
    const issue = firstIssue(careersSchema.safeParse({ ...valid, phone: "call me later" }));
    expect(issue?.path[0]).toBe("phone");
  });

  it("requires a remark about what the person offers", () => {
    const issue = firstIssue(careersSchema.safeParse({ ...valid, offer: "   " }));
    expect(issue?.path[0]).toBe("offer");
  });

  it("asks for a role when the select is left untouched", () => {
    // A <select> still on its disabled placeholder contributes nothing to FormData.
    const issue = firstIssue(
      careersSchema.safeParse({ ...valid, role: fieldValue(new FormData(), "role") }),
    );
    expect(issue?.message).toBe("Please choose a role");
  });
});
