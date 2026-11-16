import { z } from "zod";

/** Shared rules for the separate "admin" username/password login (browser-safe). */
export const ADMIN_DOMAIN = "layerandloop.in";
export const toAdminEmail = (u: string) => {
  const v = u.trim().toLowerCase();
  return v.includes("@") ? v : `${v}@${ADMIN_DOMAIN}`;
};
export const toAdminPassword = (p: string) => `${p}::layerandloop-cms`;

const GUESSABLE = ["admin", "password", "layerandloop", "layer&loop", "12345678", "qwerty", "letmein", "welcome"];

/** Advisory only — the owner decides whether to accept a weak password. */
export function passwordStrength(password: string, username = "") {
  const p = password.toLowerCase();
  const tips: string[] = [];
  if (password.length < 10) tips.push("Use at least 10 characters");
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) tips.push("Mix letters and numbers");
  if (GUESSABLE.some((g) => p.includes(g))) tips.push("Avoid common words like “admin” or “password”");
  if (username && p.includes(username.toLowerCase())) tips.push("Don't include the login ID");
  const level = tips.length === 0 ? (password.length >= 14 ? "strong" : "good") : tips.length === 1 && password.length >= 10 ? "fair" : "weak";
  return { level: level as "weak" | "fair" | "good" | "strong", tips };
}

export const adminLoginSchema = z.object({
  username: z.string().trim().toLowerCase()
    .regex(/^[a-z0-9._-]{3,30}$/, "Login ID: 3–30 letters, numbers, dots, dashes or underscores"),
  password: z.string().min(1, "Enter a password").max(72, "Password is too long"),
});
