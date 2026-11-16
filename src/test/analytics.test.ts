import { describe, expect, it } from "vitest";
import { rates, revenueBetween } from "@/lib/analytics";

const o = (status: string, total: number, created_at = "2026-11-16T10:00:00Z") => ({ status, total, created_at, items: [] });

describe("dashboard revenue", () => {
  it("cancelled orders don't count toward revenue", () =>
    expect(revenueBetween([o("delivered", 1000), o("cancelled", 500)], new Date("2026-11-01"), new Date("2026-11-30"))).toBe(1000));
  it("average order value ignores cancelled", () => expect(rates([o("delivered", 1000), o("dispatched", 2000), o("cancelled", 9000)]).aov).toBe(1500));
});
