import { describe, expect, it } from "vitest";
import { defaults } from "@/lib/cms-schema";

describe("returns window", () => {
  it("every default return mention uses 2 days", () => {
    const text = JSON.stringify(defaults);
    const windows = [...text.matchAll(/(\d+)[- ]day[^"]{0,20}return|return[^"]{0,40}within (\d+) days?/gi)].map((m) => m[1] ?? m[2]);
    expect(windows.length).toBeGreaterThan(0);
    expect(windows.every((n) => n === "2")).toBe(true);
  });
  it("links Instagram to @layerandloop.in", () => {
    expect(defaults.instagram.url).toBe("https://instagram.com/layerandloop.in");
  });
});
