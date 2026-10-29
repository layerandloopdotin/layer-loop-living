import { z } from "zod";

export const inventoryQuantitySchema = z.string().trim().regex(/^\d+$/, "Enter a whole number of 0 or more").transform(Number).refine((n) => Number.isSafeInteger(n) && n <= 2147483647, "Enter a smaller inventory quantity");