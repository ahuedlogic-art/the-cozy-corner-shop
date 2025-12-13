import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";

export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return data.map((product) => ({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        originalPrice: product.original_price ? Number(product.original_price) : undefined,
        image: product.image || "",
        category: product.category,
        brand: product.brand,
        rating: Number(product.rating) || 0,
        reviewCount: product.review_count || 0,
        isTopItem: product.is_top_item || false,
        isFavorite: false,
        inStock: product.in_stock ?? true,
      }));
    },
  });
};

export const useBrands = () => {
  return useQuery({
    queryKey: ["brands"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("brand")
        .order("brand");

      if (error) {
        throw error;
      }

      const uniqueBrands = [...new Set(data.map((p) => p.brand))];
      return uniqueBrands.map((name, index) => ({
        id: String(index + 1),
        name,
      }));
    },
  });
};
