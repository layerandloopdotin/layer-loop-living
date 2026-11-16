import { describe, expect, it } from "vitest";
import { adminLoginSchema, toAdminEmail } from "@/lib/admin-login";

describe("admin login reset", () => {
  it("rejects the guessable default admin/admin", () => {
    expect(adminLoginSchema.safeParse({ username: "admin", password: "admin" }).success).toBe(false);
  });
  it("rejects passwords containing 'admin' even when long", () => {
    expect(adminLoginSchema.safeParse({ username: "studio", password: "admin123456" }).success).toBe(false);
  });
  it("rejects passwords shorter than 10 characters", () => {
    expect(adminLoginSchema.safeParse({ username: "studio", password: "Tr4ck9x" }).success).toBe(false);
  });
  it("accepts a strong password", () => {
    expect(adminLoginSchema.safeParse({ username: "studio", password: "Kiln7-orbit-Mango" }).success).toBe(true);
  });
  it("maps a bare login ID to the shop domain", () => {
    expect(toAdminEmail("Admin")).toBe("admin@layerandloop.in");
  });
});
