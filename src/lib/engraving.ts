// Engraving rules shared by product pages, cart and the custom builder. Browser-safe.
import { z } from "zod";

export const CUSTOM_ENGRAVING_PRICE = 199;
export const ENGRAVING_REMARKS_MAX = 120;

/** font and placement stay optional only so older carts and saved designs still open. */
export type Engraving = { text: string; remarks?: string; font?: string; placement?: string };
export type EngravingRules = { enabled: boolean; price: number; maxChars: number; images?: string[] };

/** Older cached products may predate example photos. Never require them to personalise an item. */
export const engravingImages = (rules: Partial<EngravingRules>): string[] =>
  Array.isArray(rules.images) ? rules.images.filter((src) => typeof src === "string" && src.trim().length > 0) : [];

export function engravingSchema(rules: Pick<EngravingRules, "maxChars">) {
  return z.object({
    text: z.string().trim().min(1, "Type the words to engrave").max(rules.maxChars, `Keep it to ${rules.maxChars} characters`),
    remarks: z.string().trim().max(ENGRAVING_REMARKS_MAX, `Keep remarks to ${ENGRAVING_REMARKS_MAX} characters`).optional(),
  });
}

/** Extra cost for one item: the engraving price when engraving is chosen, otherwise nothing. */
export const engravingCost = (rules: Pick<EngravingRules, "enabled" | "price">, e?: Engraving | null) =>
  rules.enabled && e && e.text.trim() ? Math.max(0, rules.price) : 0;

export const sameEngraving = (a?: Engraving, b?: Engraving) =>
  (a?.text ?? "") === (b?.text ?? "") && (a?.remarks ?? "") === (b?.remarks ?? "") && (a?.font ?? "") === (b?.font ?? "");

export const describeEngraving = (e: Engraving) =>
  `Engraving: “${e.text}”${e.remarks?.trim() ? ` · ${e.remarks.trim()}` : e.font ? ` · ${e.font}` : ""}`;
