import { CUSTOM_ENGRAVING_PRICE } from "@/lib/engraving";
import { z } from "zod";

// Browser-safe rules for the Custom Studio page: sandbox options, shapes, touch points, estimates, colour matching and the brief form.

export const FORMS = [
  { id: "pendant", label: "Pendant", light: true, water: false },
  { id: "table-lamp", label: "Table lamp", light: true, water: false },
  { id: "vase", label: "Vase", light: false, water: true },
  { id: "planter", label: "Planter", light: false, water: true },
  { id: "stack", label: "Stackable", light: true, water: true },
] as const;
export type FormId = (typeof FORMS)[number]["id"];

/** Ready-made geometric shapes for stack modules and table-lamp bases. "classic" follows the chosen form's own curve. */
export const SHAPES = [
  { id: "custom", label: "Custom" },
  { id: "classic", label: "Signature" },
  { id: "cylinder", label: "Cylinder" },
  { id: "sphere", label: "Sphere" },
  { id: "cone", label: "Trapezium" },
  { id: "dome", label: "Semicircle" },
  { id: "donut", label: "Donut" },
  { id: "box", label: "Box" },
] as const;
export type ShapeId = (typeof SHAPES)[number]["id"];

/** Wall area relative to a straight cylinder of the same height and width. */
const AREA: Record<ShapeId, number> = { custom: 0.9, classic: 0.85, cylinder: 1, sphere: 0.75, cone: 0.8, dome: 0.7, donut: 1.1, box: 1.27 };

export type TouchPoint = { t: number; s: number }; // t: 0 bottom..1 top, s: width multiplier
/** A stack piece. Lathe shapes (all but box/donut) take their own touch points; "custom" also takes its own taper. */
export type StackModule = { shape: ShapeId; height: number; width: number; color: string | null; points?: TouchPoint[]; taper?: number };

export type LightKind = "strip" | "tube";

export type Design = {
  form: FormId;
  height: number; // cm
  width: number; // cm diameter
  taper: number; // -1..1
  twist: number; // degrees over the full height
  fuzzy: number; // 0..1 fuzzy skin
  layers: number; // vertical rib count
  hRibs: number; // horizontal rib count
  points: TouchPoint[]; // extra shaping points between the top and bottom
  modules: StackModule[]; // stackable only
  base: ShapeId | "none"; // table lamp only
  lampBase?: StackModule; // independent printed base; optional for saved-design compatibility
  legs?: "none" | "tripod" | "four";
  legHeight?: number; // cm
  legSpread?: number; // cm beyond the base radius
  stemHeight?: number; // cm between base and shade
  shadeShape?: ShapeId;
  legStyle?: "round" | "tapered";
  color: string; // hex
  light: boolean;
  warm: boolean;
  waterproof: boolean;
  lightFrom: number; // stack only: lowest lit module (0 = bottom)
  lightTo: number; // stack only: highest lit module
  lightKind: LightKind; // stack only, when the light spans more than one module
  engraving?: { text: string; remarks?: string; font?: string; placement?: string } | undefined; // optional; saved designs without it still open
};

export const MAX_MODULES = 6;
export const MAX_POINTS = 4;
export const BASE_HEIGHT = 6; // cm

export const DEFAULT_MODULES: StackModule[] = [
  { shape: "cylinder", height: 8, width: 20, color: null },
  { shape: "classic", height: 16, width: 18, color: null },
  { shape: "donut", height: 6, width: 18, color: null },
  { shape: "classic", height: 16, width: 18, color: null },
];

export const DEFAULT_DESIGN: Design = {
  form: "pendant", height: 24, width: 18, taper: 0.2, twist: 60, fuzzy: 0.35, layers: 28, hRibs: 0,
  points: [{ t: 0.5, s: 0.75 }], modules: DEFAULT_MODULES, base: "cylinder",
  color: "#c46a43", light: true, warm: true, waterproof: false,
  lightFrom: 0, lightTo: 3, lightKind: "strip",
};

export const CUSTOM_MODULE: StackModule = { shape: "custom", height: 14, width: 18, color: null, points: [{ t: 0.5, s: 0.75 }], taper: 0.2 };

export function lampBase(d: Design): StackModule {
  return d.lampBase ?? { shape: d.base === "none" ? "cylinder" : d.base, height: BASE_HEIGHT, width: Math.round(d.width * 0.6), color: "#30302e", points: [], taper: 0 };
}

/** Shared centimetre layout for the preview and estimate; an E27 socket is 27 mm wide. */
export function lampAssembly(d: Design) {
  const hasBase = d.form === "table-lamp" && d.base !== "none";
  const feetHeight = hasBase && d.legs && d.legs !== "none" ? d.legHeight ?? 5 : 0;
  const baseHeight = hasBase ? lampBase(d).height : 0;
  const stemHeight = hasBase ? d.stemHeight ?? 4 : 0;
  const shadeY = feetHeight + baseHeight + stemHeight;
  return { feetHeight, baseHeight, stemHeight, shadeY, totalHeight: shadeY + d.height, socketDiameter: 2.7, bulbDiameter: 6 };
}

/** Which modules of a stack light up and what fitting that needs: one module takes an E27 bulb, more take an LED strip or tube. */
export function lightFitting(d: Pick<Design, "modules" | "lightFrom" | "lightTo" | "lightKind">) {
  const n = Math.max(1, Math.min(d.modules.length, MAX_MODULES));
  const a = Math.min(n - 1, Math.max(0, Math.round(d.lightFrom)));
  const b = Math.min(n - 1, Math.max(0, Math.round(d.lightTo)));
  const from = Math.min(a, b), to = Math.max(a, b);
  const count = to - from + 1;
  const fitting = count === 1 ? "E27 LED bulb" : d.lightKind === "tube" ? "LED tube light" : "LED strip";
  return { from, to, count, fitting };
}

/** Smooth width multiplier at height t through the touch points (top and bottom stay at 1). */
export function pinch(points: TouchPoint[], t: number) {
  const pts = [{ t: 0, s: 1 }, ...[...points].sort((a, b) => a.t - b.t), { t: 1, s: 1 }];
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i]!, b = pts[i + 1]!;
    if (t <= b.t) {
      const u = b.t === a.t ? 1 : Math.min(1, Math.max(0, (t - a.t) / (b.t - a.t)));
      const k = u * u * (3 - 2 * u);
      return a.s + (b.s - a.s) * k;
    }
  }
  return 1;
}

export const POINT_PRESETS: { label: string; points: TouchPoint[] }[] = [
  { label: "None", points: [] },
  { label: "Hourglass", points: [{ t: 0.5, s: 0.55 }] },
  { label: "Double hourglass", points: [{ t: 0.3, s: 0.6 }, { t: 0.55, s: 1.05 }, { t: 0.78, s: 0.6 }] },
  { label: "Belly", points: [{ t: 0.45, s: 1.3 }] },
];

/** Walls: 2 loops normally; waterproofing adds extra loops, which adds weight. */
export function wallLoops(d: Pick<Design, "waterproof">, rates: Rates = DEFAULT_RATES) {
  return d.waterproof ? 2 + rates.waterproofLoops : 2;
}

export type Rates = { gramPrice: number; base: number; lightKit: number; waterproofLoops: number };
export const DEFAULT_RATES: Rates = { gramPrice: 6, base: 900, lightKit: 1200, waterproofLoops: 3 };

/** The printed parts of a design, bottom to top. */
export function parts(d: Design): StackModule[] {
  if (d.form === "stack") return d.modules.slice(0, MAX_MODULES);
  const main: StackModule = { shape: d.form === "table-lamp" ? d.shadeShape ?? "classic" : "classic", height: d.height, width: d.width, color: null };
  if (d.form === "table-lamp" && d.base !== "none") return [lampBase(d), main];
  return [main];
}

export function estimate(d: Design, rates: Rates = DEFAULT_RATES) {
  const ps = parts(d);
  const modules = d.form === "stack" ? ps.length : 1;
  const totalHeight = d.form === "table-lamp" ? lampAssembly(d).totalHeight : ps.reduce((s, p) => s + p.height, 0);
  const width = Math.max(...ps.map((p) => p.width));
  const area = ps.reduce((s, p) => s + Math.PI * p.width * p.height * AREA[p.shape], 0);
  const loops = wallLoops(d, rates);
  const grams = Math.round(area * loops * 0.05 * (1 + d.fuzzy * 0.15) * (1 + Math.min(d.hRibs, 40) * 0.004));
  const hours = Math.round((grams / 12) * (1 + d.fuzzy * 0.4) * 10) / 10;
  const lightOn = d.light && FORMS.find((f) => f.id === d.form)!.light;
  const price = rates.base + grams * rates.gramPrice + (lightOn ? rates.lightKit : 0) + (d.engraving?.text.trim() ? CUSTOM_ENGRAVING_PRICE : 0);
  const low = Math.round((price * 0.9) / 50) * 50;
  const high = Math.round((price * 1.2) / 50) * 50;
  return { modules, totalHeight, width, grams, hours, loops, low, high };
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

export function rgbToHex(r: number, g: number, b: number) {
  return "#" + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v || 0))).toString(16).padStart(2, "0")).join("");
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


/** Photo lab modes. */
export const PHOTO_MODES = [
  { id: "object", label: "3D object", hint: "AI recognises what's in the photo and models the object itself." },
  { id: "relief", label: "Relief", hint: "A raised panel — bright areas rise, dark areas sink." },
  { id: "lithophane", label: "Lithophane", hint: "A thin panel that reveals the photo when light shines through." },
] as const;
export type PhotoMode = (typeof PHOTO_MODES)[number]["id"];

/** What the AI returns for an object photo: primitive parts in a unit space (height 1, base at y=0). */
export const OBJECT_PART_SHAPES = ["lathe", "cylinder", "box", "sphere", "cone", "torus"] as const;
export const photoObjectSchema = z.object({
  name: z.string(),
  summary: z.string(),
  height_cm: z.number(),
  parts: z.array(z.object({
    shape: z.enum(OBJECT_PART_SHAPES),
    color: z.string(),
    position: z.array(z.number()),
    size: z.array(z.number()),
    rotation: z.array(z.number()),
    profile: z.array(z.number()),
  })).min(1),
});
export type PhotoObject = z.infer<typeof photoObjectSchema>;

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

/** Share of the estimate paid upfront before the studio prices a custom design. Mirrors the set_custom_deposit trigger. */
export const DEPOSIT_RATE = 0.2;
export function depositFor(low: number, high: number) {
  return Math.round(DEPOSIT_RATE * (low + high) / 2);
}
