import terra from "@/assets/terra.jpg";
import noir from "@/assets/noir.jpg";
import haze from "@/assets/haze.jpg";
import orb from "@/assets/p-orb.jpg";
import floor from "@/assets/p-floor.jpg";
import pendant from "@/assets/p-pendant.jpg";
import brass from "@/assets/p-brass.jpg";
import mushroom from "@/assets/p-mushroom.jpg";
import lantern from "@/assets/p-lantern.jpg";

export type Category = "Table Lamps" | "Floor Lamps" | "Pendant Lights" | "Sculptural Objects";
export type Material = "Ceramic" | "Stone" | "Hand-blown Glass" | "Terrazzo";

export type Product = { name: string; note: string; price: number; image: string; category: Category; material: Material };

export const products: Product[] = [
  { name: "Terra", note: "Warm ceramic lighting", price: 280, image: terra, category: "Sculptural Objects", material: "Stone" },
  { name: "Noir", note: "Glazed ceramic sphere", price: 310, image: noir, category: "Table Lamps", material: "Ceramic" },
  { name: "Haze", note: "Arched floor light", price: 265, image: haze, category: "Floor Lamps", material: "Terrazzo" },
  { name: "Orb", note: "Glass on raw stone", price: 240, image: orb, category: "Table Lamps", material: "Hand-blown Glass" },
  { name: "Dune", note: "Slender floor dome", price: 390, image: floor, category: "Floor Lamps", material: "Ceramic" },
  { name: "Weave", note: "Woven pendant", price: 220, image: pendant, category: "Pendant Lights", material: "Ceramic" },
  { name: "Atelier", note: "Brass task lamp", price: 295, image: brass, category: "Table Lamps", material: "Terrazzo" },
  { name: "Cap", note: "Terracotta mushroom", price: 180, image: mushroom, category: "Table Lamps", material: "Ceramic" },
  { name: "Lumen", note: "Ribbed glass lantern", price: 210, image: lantern, category: "Sculptural Objects", material: "Hand-blown Glass" },
];

export const categories: Category[] = ["Table Lamps", "Floor Lamps", "Pendant Lights", "Sculptural Objects"];
export const materials: Material[] = ["Ceramic", "Stone", "Hand-blown Glass", "Terrazzo"];
