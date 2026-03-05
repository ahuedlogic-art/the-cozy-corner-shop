import { Product, Category, Brand } from "@/types/product";

export const categories: Category[] = [
  { id: "1", name: "All NFTs", slug: "all" },
  { id: "2", name: "Trending", slug: "deals" },
  { id: "3", name: "Art", slug: "art" },
  { id: "4", name: "Collectibles", slug: "electronics" },
  { id: "5", name: "Music", slug: "music" },
  { id: "6", name: "Photography", slug: "fashion" },
  { id: "7", name: "Gaming", slug: "gaming" },
  { id: "8", name: "Virtual Worlds", slug: "home" },
  { id: "9", name: "Sports", slug: "sport" },
  { id: "10", name: "Utility", slug: "health" },
];

export const brands: Brand[] = [
  { id: "1", name: "Bored Apes" },
  { id: "2", name: "CryptoPunks" },
  { id: "3", name: "Azuki" },
  { id: "4", name: "Doodles" },
  { id: "5", name: "Art Blocks" },
  { id: "6", name: "CloneX" },
  { id: "7", name: "Moonbirds" },
];

export const products: Product[] = [];
