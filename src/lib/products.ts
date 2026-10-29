import terra from "@/assets/terra.jpg";
import heroLamp from "@/assets/hero-lamp.jpg";
import noir from "@/assets/noir.jpg";
import haze from "@/assets/haze.jpg";
import orb from "@/assets/p-orb.jpg";
import floor from "@/assets/p-floor.jpg";
import pendant from "@/assets/p-pendant.jpg";
import brass from "@/assets/p-brass.jpg";
import mushroom from "@/assets/p-mushroom.jpg";
import lantern from "@/assets/p-lantern.jpg";
import vases from "@/assets/cat-vases.jpg";
import desk from "@/assets/cat-desk.jpg";
import tileLighting from "@/assets/tile-lighting.jpg";
import tileVases from "@/assets/tile-vases.jpg";
import tileCollectibles from "@/assets/tile-collectibles.jpg";
import tileDesk from "@/assets/tile-desk.jpg";

export type Category = "Lighting" | "Vases & Planters" | "Collectibles" | "Desk Essentials";
export type Space = "The Lounge" | "The Suite" | "The Café" | "The Dining Room" | "The Study";

export type Product = { name: string; note: string; price: number; image: string; category: Category; spaces: Space[] };

export const slugify = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

export const products: Product[] = [
  { name: "The Stack Lamp", note: "Layered sculptural table lamp", price: 340, image: heroLamp, category: "Lighting", spaces: ["The Lounge", "The Study"] },
  { name: "Terra", note: "Warm ceramic lighting", price: 280, image: terra, category: "Lighting", spaces: ["The Lounge", "The Suite"] },
  { name: "Noir", note: "Glazed ceramic sphere", price: 310, image: noir, category: "Lighting", spaces: ["The Lounge", "The Café"] },
  { name: "Haze", note: "Arched floor light", price: 265, image: haze, category: "Lighting", spaces: ["The Lounge"] },
  { name: "Orb", note: "Glass on raw stone", price: 240, image: orb, category: "Lighting", spaces: ["The Suite", "The Café"] },
  { name: "Dune", note: "Slender floor dome", price: 390, image: floor, category: "Lighting", spaces: ["The Lounge", "The Dining Room"] },
  { name: "Weave", note: "Woven pendant", price: 220, image: pendant, category: "Lighting", spaces: ["The Dining Room", "The Café"] },
  { name: "Atelier", note: "Brass task lamp", price: 295, image: brass, category: "Lighting", spaces: ["The Study"] },
  { name: "Cap", note: "Terracotta mushroom", price: 180, image: mushroom, category: "Lighting", spaces: ["The Suite", "The Café"] },
  { name: "Lumen", note: "Ribbed glass lantern", price: 210, image: lantern, category: "Lighting", spaces: ["The Dining Room", "The Café"] },
  { name: "Ripple", note: "Wave-ribbed vase", price: 150, image: vases, category: "Vases & Planters", spaces: ["The Lounge", "The Dining Room"] },
  { name: "Arch", note: "Sculptural ceramic form", price: 120, image: tileCollectibles, category: "Collectibles", spaces: ["The Lounge", "The Study"] },
  { name: "Stack", note: "Desk organiser & pen cup", price: 135, image: desk, category: "Desk Essentials", spaces: ["The Study"] },
];

export const categories: Category[] = ["Lighting", "Vases & Planters", "Collectibles", "Desk Essentials"];
export const categoryTiles: { name: Category; image: string }[] = [
  { name: "Lighting", image: tileLighting },
  { name: "Vases & Planters", image: tileVases },
  { name: "Collectibles", image: tileCollectibles },
  { name: "Desk Essentials", image: tileDesk },
];
export const spaces: Space[] = ["The Lounge", "The Suite", "The Café", "The Dining Room", "The Study"];
