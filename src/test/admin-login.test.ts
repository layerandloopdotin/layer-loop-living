import { describe, expect, it } from "vitest";
import { adminLoginSchema, passwordStrength, toAdminEmail } from "@/lib/admin-login";

describe("admin login reset", () => {
  it("lets the owner choose any password, even admin/admin", () => {
    expect(adminLoginSchema.safeParse({ username: "admin", password: "admin" }).success).toBe(true);
  });
  it("rates admin/admin as weak", () => {
    expect(passwordStrength("admin", "admin").level).toBe("weak");
  });
  it("rates a long mixed password as strong", () => {
    expect(passwordStrength("Kiln7-orbit-Mango", "studio").level).toBe("strong");
  });
  it("rejects an empty password", () => {
    expect(adminLoginSchema.safeParse({ username: "admin", password: "" }).success).toBe(false);
  });
  it("maps a bare login ID to the shop domain", () => {
    expect(toAdminEmail("Admin")).toBe("admin@layerandloop.in");
  });
});
