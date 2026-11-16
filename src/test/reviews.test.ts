import { describe, expect, it } from "vitest";
import { ratingSummary } from "@/lib/reviews";

describe("rating summary", () => {
  it("averages to one decimal", () => expect(ratingSummary([{ rating: 5 }, { rating: 4 }, { rating: 4 }])).toEqual({ average: 4.3, count: 3 }));
  it("no reviews shows zero", () => expect(ratingSummary([])).toEqual({ average: 0, count: 0 }));
});
