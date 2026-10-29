import { z } from "zod";

// A <select> left on its disabled placeholder submits no value at all, so FormData gives null.
export const fieldValue = (f: FormData, key: string) => String(f.get(key) ?? "");

export const careersSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().regex(/^[+\d][\d\s-]{6,18}$/, "Enter a valid phone number"),
  role: z.string().trim().min(2, "Tell us the role you'd like to apply for").max(100),
  portfolio: z.string().trim().max(300).optional(),
  offer: z
    .string()
    .trim()
    .min(10, "Tell us a little more — at least 10 characters")
    .max(800, "Keep it under 800 characters"),
});

export const tradeSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(100),
  company: z.string().trim().min(1, "Please enter your company").max(120),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().regex(/^[+\d][\d\s-]{6,18}$/, "Enter a valid phone number"),
  type: z.string().min(1, "Please choose one"),
  catalogues: z.array(z.string()).min(1, "Pick at least one catalogue"),
  quantity: z.string().min(1, "Please choose one"),
  message: z.string().max(1000).optional(),
});
