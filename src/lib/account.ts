// Browser-safe account helpers: avatars, form schemas and order status rules.
import { z } from "zod";

export const AVATARS = ["fox", "cat", "panda", "bunny", "owl", "redpanda", "penguin", "shiba"].map((a) => `asset:avatar-${a}.jpg`);
export const DEFAULT_AVATAR = "asset:avatar-fox.jpg";
export const avatarRef = (ref: string | null | undefined) => (!ref || ref === "asset:avatar-fox" ? DEFAULT_AVATAR : ref);

export const fieldValue = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

export const phoneSchema = z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number");
export const toE164 = (digits: string) => `+91${digits}`;

export const designRequestContactSchema = z.object({
  name: z.string().trim().min(1, "Enter your name").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: phoneSchema,
  pin: z.string().regex(/^[1-9]\d{5}$/, "Enter a 6-digit PIN code"),
});

export const profileSchema = z.object({
  full_name: z.string().max(80, "Name is too long"),
  phone: z.string().refine((v) => v === "" || /^[6-9]\d{9}$/.test(v), "Enter a valid 10-digit mobile number"),
  gender: z.enum(["", "female", "male", "non_binary", "prefer_not"]),
});

export const addressSchema = z.object({
  label: z.string().min(1).max(30),
  name: z.string().min(1, "Enter a name").max(80),
  phone: phoneSchema,
  line1: z.string().min(3, "Enter the address").max(160),
  line2: z.string().max(160),
  city: z.string().min(2, "Enter the city").max(60),
  state: z.string().min(2, "Enter the state").max(60),
  pin: z.string().regex(/^[1-9]\d{5}$/, "Enter a 6-digit PIN code"),
});

export const STEPS = ["in_production", "quality_check", "dispatched", "out_for_delivery", "delivered"] as const;
export const STATUS_LABEL: Record<string, string> = {
  in_production: "In production", quality_check: "Quality check", dispatched: "Dispatched",
  out_for_delivery: "Out for delivery", delivered: "Delivered", cancelled: "Cancelled",
  replacement: "Replacement", replaced: "Replaced", return_requested: "Return requested", returned: "Returned",
};
export const ALL_STATUSES = Object.keys(STATUS_LABEL);

export type OrderTab = "all" | "live" | "cancelled" | "replaced" | "returns";
export const ORDER_TABS: { id: OrderTab; label: string }[] = [
  { id: "all", label: "All" }, { id: "live", label: "Live" }, { id: "cancelled", label: "Cancelled" },
  { id: "replaced", label: "Replaced" }, { id: "returns", label: "Returns" },
];

export function tabOf(status: string): Exclude<OrderTab, "all"> | "done" {
  if (["in_production", "quality_check", "dispatched", "out_for_delivery"].includes(status)) return "live";
  if (status === "cancelled") return "cancelled";
  if (status === "replacement" || status === "replaced") return "replaced";
  if (status === "return_requested" || status === "returned") return "returns";
  return "done";
}
export const inTab = (status: string, tab: OrderTab) => tab === "all" || tabOf(status) === tab;

/** Index of the furthest completed step on the production → delivery timeline (-1 when off-track). */
export const stepIndex = (status: string) => (STEPS as readonly string[]).indexOf(status);

export type OrderItem = { slug: string; name: string; qty: number; price: number; variant?: string; image?: string };

export const statusChip = (status: string) => {
  const t = tabOf(status);
  return t === "live" ? "bg-primary text-primary-foreground" : t === "cancelled" ? "bg-destructive/15 text-destructive" : "bg-muted text-foreground";
};

export type CustomProgress = "received" | "reviewing" | "quoted" | "accepted" | "declined";
export function customProgress(request: { deposit_status: string; status: string }): CustomProgress | null {
  if (request.deposit_status !== "paid") return null;
  if (["reviewing", "quoted", "accepted", "declined"].includes(request.status)) return request.status as CustomProgress;
  return "received";
}

/** Explicit links survive edits; older requests fall back to matching their saved snapshot. */
export function matchesSavedDesign(saved: { id: string; design: unknown }, request: { contact: unknown; design: unknown }): boolean {
  const contact = request.contact as { saved_design_id?: string } | null;
  if (contact?.saved_design_id) return contact.saved_design_id === saved.id;
  const canonical = (v: unknown): string => {
    if (Array.isArray(v)) return `[${v.map(canonical).join(",")}]`;
    if (v && typeof v === "object") return `{${Object.entries(v).sort(([a], [b]) => a.localeCompare(b)).map(([k, value]) => `${JSON.stringify(k)}:${canonical(value)}`).join(",")}}`;
    return JSON.stringify(v) ?? "null";
  };
  return saved.design != null && request.design != null && canonical(saved.design) === canonical(request.design);
}
