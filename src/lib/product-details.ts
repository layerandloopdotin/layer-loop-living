import type { Category, Product } from "@/lib/products";

const short: Record<string, string> = {
  "The Stack Lamp": "Stacked, softly glowing layers that turn a side table into a quiet centrepiece.",
  Terra: "A softly ribbed ceramic-look shade that pools warm, low light — made for slow evenings.",
  Noir: "A deep, glaze-finished sphere that glows from within like a lantern at dusk.",
  Haze: "A gentle arched floor light that leans over a sofa or reading chair.",
  Orb: "A frosted globe resting on a stone-textured base — small, calm and sculptural.",
  Dune: "A slender floor dome with fine layer lines that catch light like wind on sand.",
  Weave: "A woven-pattern pendant that scatters soft patterned light over a table.",
  Atelier: "A focused task lamp with a brass-tone finish for desks and work corners.",
  Cap: "A terracotta-toned mushroom lamp — playful in shape, calm in glow.",
  Lumen: "A ribbed lantern whose layers fold light into gentle stripes.",
  Ripple: "A wave-ribbed vase that turns dried stems and single blooms into sculpture.",
  Arch: "A sculptural object to anchor a shelf, console or desk.",
  Stack: "A stackable organiser and pen cup that keeps a desk clear and considered.",
};

const specsBy: Record<Category, [string, string][]> = {
  Lighting: [["Dimensions", "Ø 22 × H 30 cm"], ["Weight", "650 g"], ["Material", "PLA+ shade, PETG base"], ["Bulb", "E27 warm LED, 2700K (included)"], ["Cable", "1.8 m fabric cord with inline switch"]],
  "Vases & Planters": [["Dimensions", "Ø 12 × H 24 cm"], ["Weight", "280 g"], ["Material", "PETG, watertight"], ["Use", "Fresh or dried stems"]],
  Collectibles: [["Dimensions", "14 × 8 × 18 cm"], ["Weight", "220 g"], ["Material", "Matte PLA"], ["Finish", "Hand-sanded"]],
  "Desk Essentials": [["Dimensions", "10 × 10 × 12 cm"], ["Weight", "180 g"], ["Material", "PLA with TPU non-slip feet"], ["Modules", "3 stackable trays"]],
};

const care = [
  ["Cleaning", "Dust with a soft dry cloth. For marks, use a lightly damp cloth — no solvents or abrasive sprays."],
  ["Heat & sun", "Keep away from direct afternoon sun, heaters and hot cars; prolonged heat above 50°C can soften the print."],
  ["Wear & tear", "Fine layer lines are part of the making, not a flaw. Small scuffs can be eased with a very fine sanding pad."],
  ["End of life", "Send it back to our store — we grind and recycle returned pieces instead of sending them to landfill."],
] as const;

export function detailsFor(p: Product) {
  return {
    short: short[p.name] ?? p.note,
    long: `${p.name} is printed layer by layer in our Bandra studio, then finished by hand. Each piece takes several hours on the printer, so tiny variations in texture make every one slightly different. We use non-toxic, plant-based and recyclable filaments, and design every object to be light, sturdy and easy to live with — in ${p.spaces.join(", ").replace(/The /g, "the ")}.`,
    specs: specsBy[p.category],
    care,
  };
}
