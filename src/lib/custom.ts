import { z } from "zod";

// Browser-safe rules for the Custom Studio page: sandbox options, estimates, colour matching and the brief form.

export const FORMS = [
  { id: "pendant", label: "Pendant", light: true, water: false },
  { id: "table-lamp", label: "Table lamp", light: true, water: false },
  { id: "vase", label: "Vase", light: false, water: true },
  { id: "planter", label: "Planter", light: false, water: true },
  { id: "stack", label: "Stackable", light: true, water: true },
] as const;
export type FormId = (typeof FORMS)[number]["id"];

export type Design = {
  form: FormId;
  height: number; // cm per module
  width: number; // cm diameter
  taper: number; // -1..1
  twist: number; // 0..1
  fuzzy: number; // 0..1 fuzzy skin
  layers: number; // rib count 8..60
  stack: number; // modules 1..6
  color: string; // hex
  light: boolean;
  warm: boolean;
  waterproof: boolean;
};

export const DEFAULT_DESIGN: Design = {
  form: "pendant", height: 24, width: 18, taper: 0.2, twist: 0.15, fuzzy: 0.35, layers: 28, stack: 1,
  color: "#c46a43", light: true, warm: true, waterproof: false,
};

export type Rates = { gramPrice: number; base: number; lightKit: number; waterproofLoops: number };
export const DEFAULT_RATES: Rates = { gramPrice: 6, base: 900, lightKit: 1200, waterproofLoops: 3 };

/** Walls: 2 loops normally; waterproofing adds extra loops, which adds weight. */
export function wallLoops(d: Pick<Design, "waterproof">, rates: Rates = DEFAULT_RATES) {
  return d.waterproof ? 2 + rates.waterproofLoops : 2;
}

export function estimate(d: Design, rates: Rates = DEFAULT_RATES) {
  const modules = d.form === "stack" ? Math.max(1, Math.min(6, Math.round(d.stack))) : 1;
  const totalHeight = d.height * modules;
  const area = Math.PI * d.width * totalHeight; // cm² of wall
  const loops = wallLoops(d, rates);
  const grams = Math.round(area * loops * 0.05 * (1 + d.fuzzy * 0.15));
  const hours = Math.round((grams / 12) * (1 + d.fuzzy * 0.4) * 10) / 10;
  const lightOn = d.light && FORMS.find((f) => f.id === d.form)!.light;
  const price = rates.base + grams * rates.gramPrice + (lightOn ? rates.lightKit : 0);
  const low = Math.round((price * 0.9) / 50) * 50;
  const high = Math.round((price * 1.2) / 50) * 50;
  return { modules, totalHeight, width: d.width, grams, hours, loops, low, high };
}

export type Swatch = { name: string; hex: string };
export const STUDIO_PALETTE: Swatch[] = [
  { name: "Obsidian", hex: "#1d1b1a" },
  { name: "Bone", hex: "#ece4d6" },
  { name: "Terracotta", hex: "#c46a43" },
  { name: "Sandstone", hex: "#c9ad86" },
  { name: "Sage", hex: "#8f9f84" },
  { name: "Clay Pink", hex: "#d7a596" },
  { name: "Ochre", hex: "#c8902f" },
  { name: "Slate", hex: "#5d6670" },
  { name: "Forest", hex: "#3d5443" },
  { name: "Cobalt", hex: "#2e4a8c" },
];

export function hexToRgb(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const g = m[1] ?? "";
  const h = g.length === 3 ? g.split("").map((c) => c + c).join("") : g;
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
}

/** Nearest studio filament by weighted RGB distance (closer to perceived difference than plain RGB). */
export function closestSwatches(hex: string, palette: Swatch[] = STUDIO_PALETTE, n = 3) {
  const c = hexToRgb(hex);
  if (!c) return [];
  return palette
    .map((s) => {
      const p = hexToRgb(s.hex)!;
      const rm = (c[0] + p[0]) / 2;
      const [dr, dg, db] = [c[0] - p[0], c[1] - p[1], c[2] - p[2]];
      const dist = Math.sqrt((2 + rm / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rm) / 256) * db * db);
      return { ...s, dist };
    })
    .sort((a, b) => a.dist - b.dist)
    .slice(0, n);
}

export const BRIEF_KINDS = ["Lighting", "Vase / planter", "Stackable floor piece", "Engraved gift", "From my photo", "Corporate / batch", "Something else"];
export const TIMELINES = ["No rush", "Within a month", "Within 2 weeks", "For a date"];

export const briefSchema = z.object({
  kind: z.string().min(1, "Pick what you'd like made"),
  idea: z.string().trim().min(10, "Tell us a little more — at least 10 characters").max(1500, "Keep it under 1500 characters"),
  size: z.string().trim().max(120).optional(),
  color: z.string().trim().max(120).optional(),
  engraving: z.string().trim().max(60, "Keep engraving under 60 characters").optional(),
  quantity: z.coerce.number().int("Whole numbers only").min(1, "At least 1").max(5000, "For over 5000 pieces, email us"),
  timeline: z.string().min(1, "Please choose one"),
  name: z.string().trim().min(1, "Please enter your name").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().regex(/^[+\d][\d\s-]{6,18}$/, "Enter a valid phone number"),
  pincode: z.string().trim().regex(/^\d{6}$/, "Enter a 6-digit PIN code"),
});
