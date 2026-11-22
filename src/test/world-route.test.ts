import { describe, expect, it } from "vitest";
import { resolveRouteWorld } from "@/lib/world";

describe("resolveRouteWorld", () => {
  it("returns null on main homepage and neutral brand pages even when stored world is culture", () => {
    expect(resolveRouteWorld("/", undefined, "culture")).toBeNull();
    expect(resolveRouteWorld("/about", undefined, "culture")).toBeNull();
    expect(resolveRouteWorld("/trade", undefined, "culture")).toBeNull();
    expect(resolveRouteWorld("/custom", undefined, "culture")).toBeNull();
    expect(resolveRouteWorld("/contactus", undefined, "culture")).toBeNull();
    expect(resolveRouteWorld("/cart", undefined, "culture")).toBeNull();
  });

  it("returns explicit world on /space and /culture", () => {
    expect(resolveRouteWorld("/space", undefined, "culture")).toBe("space");
    expect(resolveRouteWorld("/culture", undefined, "space")).toBe("culture");
  });

  it("resolves /products from search param, search query, or stored fallback", () => {
    expect(resolveRouteWorld("/products", { world: "culture" }, "space")).toBe("culture");
    expect(resolveRouteWorld("/products", { world: "space" }, "culture")).toBe("space");
    expect(resolveRouteWorld("/products", { q: "lamp" }, "culture")).toBeNull();
    expect(resolveRouteWorld("/products", {}, "culture")).toBe("culture");
  });

  it("inherits the product's world on /product/:slug", () => {
    expect(resolveRouteWorld("/product/cosmo-cat", undefined, "space", "culture")).toBe("culture");
    expect(resolveRouteWorld("/product/terra", undefined, "culture", "space")).toBe("space");
    expect(resolveRouteWorld("/product/unknown", undefined, "culture")).toBeNull();
  });
});
