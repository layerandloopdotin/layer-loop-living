// Engraving rules shared by product pages, cart and the custom builder. Browser-safe.
import { z } from "zod";

export const ENGRAVING_FONTS = ["Classic serif", "Clean sans", "Script"] as const;
export const ENGRAVING_FONT_CSS: Record<string, string> = {
  "Classic serif": "Georgia, 'Times New Roman', serif",
  "Clean sans": "ui-sans-serif, system-ui, sans-serif",
  Script: "'Brush Script MT', 'Segoe Script', cursive",
};
export const ENGRAVING_PLACEMENTS = ["Front", "Base", "Back"];
export const CUSTOM_ENGRAVING_PRICE = 199;

export type Engraving = { text: string; font: string; placement: string };
export type EngravingRules = { enabled: boolean; price: number; maxChars: number; placements: string[] };

export function engravingSchema(rules: Pick<EngravingRules, "maxChars" | "placements">) {
  return z.object({
    text: z.string().trim().min(1, "Type the words to engrave").max(rules.maxChars, `Keep it to ${rules.maxChars} characters`),
    font: z.enum(ENGRAVING_FONTS, { message: "Choose a font" }),
    placement: z.string().refine((v) => rules.placements.includes(v), "Choose where to engrave"),
  });
}

/** Extra cost for one item: the engraving price when engraving is chosen, otherwise nothing. */
export const engravingCost = (rules: Pick<EngravingRules, "enabled" | "price">, e?: Engraving | null) =>
  rules.enabled && e && e.text.trim() ? Math.max(0, rules.price) : 0;

export const sameEngraving = (a?: Engraving, b?: Engraving) =>
  (a?.text ?? "") === (b?.text ?? "") && (a?.font ?? "") === (b?.font ?? "") && (a?.placement ?? "") === (b?.placement ?? "");

export const describeEngraving = (e: Engraving) => `Engraving: “${e.text}” · ${e.font} · ${e.placement}`;
