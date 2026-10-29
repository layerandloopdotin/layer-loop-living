import { describe, expect, it } from "vitest";
import { unitPrice, variants } from "./catalog";

describe("product variants", () => {
  const v = variants([{ name: "Standard", price: 0 }, { name: "Threaded wire", price: 150 }, { name: "", price: 9 }]);
  it("drops unnamed variants", () => expect(v).toHaveLength(2));
  it("adds the variant's extra price", () => expect(unitPrice({ price: 2400, variants: v }, "Threaded wire")).toBe(2550));
  it("standard stays at the base price", () => expect(unitPrice({ price: 2400, variants: v }, "Standard")).toBe(2400));
});
