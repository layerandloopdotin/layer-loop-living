import terra from "@/assets/terra.jpg";
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
export type Material = "Ceramic" | "Stone" | "Hand-blown Glass" | "Terrazzo";

export type Product = { name: string; note: string; price: number; image: string; category: Category; material: Material };

export const products: Product[] = [
  { name: "Terra", note: "Warm ceramic lighting", price: 280, image: terra, category: "Lighting", material: "Stone" },
  { name: "Noir", note: "Glazed ceramic sphere", price: 310, image: noir, category: "Lighting", material: "Ceramic" },
  { name: "Haze", note: "Arched floor light", price: 265, image: haze, category: "Lighting", material: "Terrazzo" },
  { name: "Orb", note: "Glass on raw stone", price: 240, image: orb, category: "Lighting", material: "Hand-blown Glass" },
  { name: "Dune", note: "Slender floor dome", price: 390, image: floor, category: "Lighting", material: "Ceramic" },
  { name: "Weave", note: "Woven pendant", price: 220, image: pendant, category: "Lighting", material: "Ceramic" },
  { name: "Atelier", note: "Brass task lamp", price: 295, image: brass, category: "Lighting", material: "Terrazzo" },
  { name: "Cap", note: "Terracotta mushroom", price: 180, image: mushroom, category: "Lighting", material: "Ceramic" },
  { name: "Lumen", note: "Ribbed glass lantern", price: 210, image: lantern, category: "Lighting", material: "Hand-blown Glass" },
  { name: "Ripple", note: "Wave-ribbed vase", price: 150, image: vases, category: "Vases & Planters", material: "Ceramic" },
  { name: "Arch", note: "Sculptural ceramic form", price: 120, image: tileCollectibles, category: "Collectibles", material: "Ceramic" },
  { name: "Stack", note: "Desk organiser & pen cup", price: 135, image: desk, category: "Desk Essentials", material: "Terrazzo" },
];

export const categories: Category[] = ["Lighting", "Vases & Planters", "Collectibles", "Desk Essentials"];
export const categoryTiles: { name: Category; image: string }[] = [
  { name: "Lighting", image: tileLighting },
  { name: "Vases & Planters", image: tileVases },
  { name: "Collectibles", image: tileCollectibles },
  { name: "Desk Essentials", image: tileDesk },
];
export const materials: Material[] = ["Ceramic", "Stone", "Hand-blown Glass", "Terrazzo"];
