// Engraving rules shared by product pages, cart and the custom builder. Browser-safe.
import { z } from "zod";

/** Font styles customers pick from. The studio sends a proof of the engraved text after ordering. */
export const ENGRAVING_FONTS = ["Serif", "Sans-serif", "Script", "Handwritten", "Slab serif", "Monospace", "Classic capitals"] as const;
export const ENGRAVING_FONT_CSS: Record<string, string> = {
  Serif: "'Playfair Display', Georgia, serif",
  "Sans-serif": "'DM Sans', ui-sans-serif, system-ui, sans-serif",
  Script: "'Great Vibes', 'Brush Script MT', cursive",
  Handwritten: "'Caveat', 'Segoe Print', cursive",
  "Slab serif": "'Roboto Slab', Rockwell, serif",
  Monospace: "'Space Mono', ui-monospace, monospace",
  "Classic capitals": "'Cinzel', 'Trajan Pro', serif",
  // older saved choices
  "Classic serif": "'Playfair Display', Georgia, serif",
  "Clean sans": "'DM Sans', ui-sans-serif, sans-serif",
};
export const CUSTOM_ENGRAVING_PRICE = 199;

/** placement is kept optional only so older carts and saved designs still open. */
export type Engraving = { text: string; font: string; placement?: string };
export type EngravingRules = { enabled: boolean; price: number; maxChars: number; images?: string[] };

/** Older cached products may predate example photos. Never require them to personalise an item. */
export const engravingImages = (rules: Partial<EngravingRules>): string[] =>
  Array.isArray(rules.images) ? rules.images.filter((src) => typeof src === "string" && src.trim().length > 0) : [];

export function engravingSchema(rules: Pick<EngravingRules, "maxChars">) {
  return z.object({
    text: z.string().trim().min(1, "Type the words to engrave").max(rules.maxChars, `Keep it to ${rules.maxChars} characters`),
    font: z.enum(ENGRAVING_FONTS, { message: "Choose a font" }),
  });
}

/** Extra cost for one item: the engraving price when engraving is chosen, otherwise nothing. */
export const engravingCost = (rules: Pick<EngravingRules, "enabled" | "price">, e?: Engraving | null) =>
  rules.enabled && e && e.text.trim() ? Math.max(0, rules.price) : 0;

export const sameEngraving = (a?: Engraving, b?: Engraving) =>
  (a?.text ?? "") === (b?.text ?? "") && (a?.font ?? "") === (b?.font ?? "");

export const describeEngraving = (e: Engraving) => `Engraving: “${e.text}” · ${e.font}`;
