import { z } from "zod";

/** Shared rules for the separate "admin" username/password login (browser-safe). */
export const ADMIN_DOMAIN = "layerandloop.in";
export const toAdminEmail = (u: string) => {
  const v = u.trim().toLowerCase();
  return v.includes("@") ? v : `${v}@${ADMIN_DOMAIN}`;
};
export const toAdminPassword = (p: string) => `${p}::layerandloop-cms`;

const GUESSABLE = ["admin", "password", "layerandloop", "layer&loop", "12345678", "qwerty", "letmein", "welcome"];

export const adminLoginSchema = z.object({
  username: z.string().trim().toLowerCase()
    .regex(/^[a-z0-9._-]{3,30}$/, "Login ID: 3–30 letters, numbers, dots, dashes or underscores"),
  password: z.string()
    .min(10, "Password must be at least 10 characters")
    .regex(/[a-zA-Z]/, "Password needs a letter")
    .regex(/[0-9]/, "Password needs a number"),
}).superRefine((v, ctx) => {
  const p = v.password.toLowerCase();
  if (GUESSABLE.some((g) => p.includes(g)) || p.includes(v.username)) {
    ctx.addIssue({ code: "custom", path: ["password"], message: "Password is too easy to guess" });
  }
});
