import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { toast } from "@/hooks/use-toast";

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  selected_size: string | null;
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  addToCart: (productId: string, size?: string) => Promise<void>;
  removeFromCart: (productId: string, size?: string | null) => Promise<void>;
  updateQuantity: (productId: string, quantity: number, size?: string | null) => Promise<void>;
  checkout: () => Promise<boolean>;
  loading: boolean;
  checkoutLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCartItems([]);
    }
  }, [user]);

  const fetchCart = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", user.id);

    if (error) {
      console.error("Error fetching cart:", error);
    } else {
      setCartItems(data || []);
    }
    setLoading(false);
  };

  const addToCart = async (productId: string, size?: string) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to sign in to add items to your cart.",
        variant: "destructive",
      });
      return;
    }

    // Find existing item with same product and size
    const existingItem = cartItems.find(
      (item) => item.product_id === productId && item.selected_size === (size || null)
    );

    if (existingItem) {
      await updateQuantity(productId, existingItem.quantity + 1, size || null);
    } else {
      const { error } = await supabase
        .from("cart_items")
        .insert({ 
          user_id: user.id, 
          product_id: productId, 
          quantity: 1,
          selected_size: size || null
        });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to add item to cart.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Added to cart",
          description: "Item has been added to your cart.",
        });
        fetchCart();
      }
    }
  };

  const removeFromCart = async (productId: string, size?: string | null) => {
    if (!user) return;

    let query = supabase
      .from("cart_items")
      .delete()
      .eq("user_id", user.id)
      .eq("product_id", productId);
    
    if (size !== undefined) {
      query = size === null 
        ? query.is("selected_size", null)
        : query.eq("selected_size", size);
    }

    const { error } = await query;

    if (error) {
      toast({
        title: "Error",
        description: "Failed to remove item from cart.",
        variant: "destructive",
      });
    } else {
      fetchCart();
    }
  };

  const updateQuantity = async (productId: string, quantity: number, size?: string | null) => {
    if (!user) return;

    if (quantity <= 0) {
      await removeFromCart(productId, size);
      return;
    }

    let query = supabase
      .from("cart_items")
      .update({ quantity })
      .eq("user_id", user.id)
      .eq("product_id", productId);

    if (size !== undefined) {
      query = size === null 
        ? query.is("selected_size", null)
        : query.eq("selected_size", size);
    }

    const { error } = await query;

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update cart.",
        variant: "destructive",
      });
    } else {
      fetchCart();
    }
  };

  const checkout = async (): Promise<boolean> => {
    if (!user || cartItems.length === 0) return false;

    setCheckoutLoading(true);
    try {
      // Fetch product prices
      const productIds = cartItems.map((item) => item.product_id);
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("id, price, stock_quantity")
        .in("id", productIds);

      if (productsError || !products) {
        throw new Error("Failed to fetch product data");
      }

      // Check stock availability
      for (const item of cartItems) {
        const product = products.find((p) => p.id === item.product_id);
        if (!product || product.stock_quantity < item.quantity) {
          toast({
            title: "Insufficient stock",
            description: `Not enough stock available for one or more items.`,
            variant: "destructive",
          });
          setCheckoutLoading(false);
          return false;
        }
      }

      // Create orders and update stock
      for (const item of cartItems) {
        const product = products.find((p) => p.id === item.product_id);
        if (!product) continue;

        const totalPrice = product.price * item.quantity;

        // Create order
        const { error: orderError } = await supabase.from("orders").insert({
          user_id: user.id,
          product_id: item.product_id,
          quantity: item.quantity,
          total_price: totalPrice,
          status: "completed",
        });

        if (orderError) {
          console.error("Order error:", orderError);
          throw new Error("Failed to create order");
        }

        // Deduct stock
        const { error: stockError } = await supabase
          .from("products")
          .update({ stock_quantity: product.stock_quantity - item.quantity })
          .eq("id", item.product_id);

        if (stockError) {
          console.error("Stock update error:", stockError);
        }
      }

      // Clear cart
      const { error: clearError } = await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", user.id);

      if (clearError) {
        console.error("Clear cart error:", clearError);
      }

      setCartItems([]);
      toast({
        title: "Order placed!",
        description: "Your order has been successfully placed.",
      });
      setCheckoutLoading(false);
      return true;
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Checkout failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setCheckoutLoading(false);
      return false;
    }
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, cartCount, addToCart, removeFromCart, updateQuantity, checkout, loading, checkoutLoading }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
