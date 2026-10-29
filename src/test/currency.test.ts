import { describe, expect, it } from "vitest";
import { formatPrice } from "@/lib/currency";

describe("INR prices", () => {
  it("displays the existing price amounts in Indian rupees", () => {
    expect(formatPrice(340)).toBe("₹340");
    expect(formatPrice(280)).toBe("₹280");
    expect(formatPrice(100000)).toBe("₹1,00,000");
  });
});