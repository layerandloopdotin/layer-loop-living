import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { photoObjectSchema, type PhotoObject } from "@/lib/custom";

const INSTRUCTIONS = `You are a 3D modeller for a 3D printing studio. Identify the main physical object in the photo and rebuild it as a small set of simple 3D parts (2–12 parts).
Coordinate space: the whole object is 1 unit tall, standing on y=0, centred on x=0,z=0. position = centre of the part [x,y,z]. size = [width, height, depth] of the part. rotation = degrees [x,y,z].
Shapes: "lathe" = a turned/revolved body (vases, lamp shades, bottles, cups, bowls, figurine bodies) — give profile as 8–16 radii from bottom to top, each 0..1 as a fraction of size[0]/2; "cylinder", "box", "sphere", "cone" (point up), "torus" (ring; size[0]=outer width, size[1]=tube thickness; lies flat unless rotated). Non-lathe parts use profile [].
Use the object's real colours as hex codes. Estimate its real height in cm. name = short product name, summary = one sentence on the object and how it would be printed.
If there is no clear object (e.g. a landscape or portrait), model the most prominent thing as best you can.`;

const jsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["name", "summary", "height_cm", "parts"],
  properties: {
    name: { type: "string" },
    summary: { type: "string" },
    height_cm: { type: "number" },
    parts: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["shape", "color", "position", "size", "rotation", "profile"],
        properties: {
          shape: { type: "string", enum: ["lathe", "cylinder", "box", "sphere", "cone", "torus"] },
          color: { type: "string" },
          position: { type: "array", items: { type: "number" } },
          size: { type: "array", items: { type: "number" } },
          rotation: { type: "array", items: { type: "number" } },
          profile: { type: "array", items: { type: "number" } },
        },
      },
    },
  },
} as const;

/** Looks at an uploaded photo and returns a simple parametric 3D model of the object in it. */
export const analyzeObjectPhoto = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ image: z.string().regex(/^data:image\/(png|jpeg|webp);base64,/).max(4_000_000) }).parse(d))
  .handler(async ({ data }): Promise<{ ok: true; model: PhotoObject } | { ok: false; error: string }> => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) return { ok: false, error: "Photo analysis isn't set up yet." };
    const { createOpenAI } = await import("@ai-sdk/openai");
    const { streamText, Output, jsonSchema: js } = await import("ai");
    const provider = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey,
      headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    });
    try {
      const result = streamText({
        model: provider.responses("openai/gpt-6-astra"),
        instructions: INSTRUCTIONS,
        messages: [{ role: "user", content: [{ type: "text", text: "Model the object in this photo." }, { type: "image", image: new URL(data.image) }] }],
        output: Output.object({ schema: js<PhotoObject>(jsonSchema as never) }),
        providerOptions: {
          openai: { forceReasoning: true, reasoningEffort: "low", reasoningSummary: "auto", store: false, include: ["reasoning.encrypted_content"] },
        },
      });
      await result.consumeStream();
      const parsed = photoObjectSchema.safeParse(await result.output);
      if (!parsed.success) return { ok: false, error: "We couldn't make out an object in that photo — try a clearer shot." };
      return { ok: true, model: parsed.data };
    } catch (e) {
      const status = (e as { statusCode?: number }).statusCode;
      console.error("analyzeObjectPhoto failed", status, e instanceof Error ? e.message : e);
      if (status === 429) return { ok: false, error: "Lots of people are trying this right now — please try again in a minute." };
      if (status === 402) return { ok: false, error: "Photo analysis is paused at the moment. Try Relief or Lithophane instead." };
      return { ok: false, error: "We couldn't analyse that photo. Please try another one." };
    }
  });
