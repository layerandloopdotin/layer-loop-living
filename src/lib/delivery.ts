export type DeliveryResult =
  | { ok: false; message: string }
  | { ok: true; days: string; message: string };

/** Placeholder rule: any valid Indian PIN (6 digits, not starting with 0) is serviceable. Mumbai (400xxx) is fastest. */
export function checkPincode(input: string): DeliveryResult {
  const pin = input.trim();
  if (!/^[1-9]\d{5}$/.test(pin)) return { ok: false, message: "Enter a valid 6-digit PIN code." };
  if (pin.startsWith("400")) return { ok: true, days: "1–2 days", message: "Delivers to " + pin + " in 1–2 days." };
  return { ok: true, days: "4–7 days", message: "Delivers to " + pin + " in 4–7 days." };
}
