import { Minus, Plus, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useProducts } from "@/hooks/useProducts";
import { Header } from "@/components/layout/Header";

const ETH_RATE = 0.00042; // 1 USD ≈ 0.00042 ETH

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, cartCount } = useCart();
  const { user } = useAuth();
  const { data: products = [] } = useProducts();

  const cartProducts = cartItems.map((item) => {
    const product = products.find((p) => p.id === item.product_id);
    return { ...item, product };
  }).filter((item) => item.product);

  const subtotal = cartProducts.reduce((sum, item) => {
    return sum + (item.product?.price || 0) * item.quantity;
  }, 0);

  const shipping = subtotal > 100 ? 0 : 9.99;
  const total = subtotal + shipping;

  const toEth = (usd: number) => (usd * ETH_RATE).toFixed(4);

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold font-['Space_Grotesk'] mb-4">Please sign in</h1>
          <p className="text-muted-foreground mb-6">You need to sign in to view your cart.</p>
          <Link to="/auth">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Sign in</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-8">
        <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" />
          Continue Shopping
        </Link>

        <h1 className="text-2xl font-bold font-['Space_Grotesk'] mb-8">
          Shopping Cart
          <span className="text-muted-foreground text-lg font-normal ml-2">({cartCount} items)</span>
        </h1>

        {cartProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-secondary/50 flex items-center justify-center">
              <span className="text-3xl">🛒</span>
            </div>
            <p className="text-muted-foreground mb-4">Your cart is empty</p>
            <Link to="/">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Start Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartProducts.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 bg-card/80 backdrop-blur-sm rounded-xl p-4 border border-border hover:border-primary/30 transition-all duration-300 group"
                >
                  <div className="relative overflow-hidden rounded-lg">
                    <img
                      src={item.product?.image}
                      alt={item.product?.name}
                      className="w-24 h-24 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent rounded-lg" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium font-['Space_Grotesk']">{item.product?.name}</h3>
                    <p className="text-sm text-muted-foreground">{item.product?.brand}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {item.selected_size && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                          Size: {item.selected_size}
                        </span>
                      )}
                      {item.selected_color && (
                        <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                          Color:
                          <span
                            className="w-3 h-3 rounded-full border border-border inline-block"
                            style={{ backgroundColor: item.selected_color }}
                          />
                        </span>
                      )}
                    </div>
                    <div className="mt-2">
                      <p className="text-lg font-bold text-primary font-['Space_Grotesk']">
                        Ξ {toEth(item.product?.price || 0)}
                      </p>
                      <p className="text-xs text-muted-foreground">${item.product?.price.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => removeFromCart(item.product_id, item.selected_size, item.selected_color)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 border-border hover:border-primary hover:bg-primary/10"
                        onClick={() => updateQuantity(item.product_id, item.quantity - 1, item.selected_size, item.selected_color)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center font-medium font-['Space_Grotesk']">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 border-border hover:border-primary hover:bg-primary/10"
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1, item.selected_size, item.selected_color)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="bg-card/80 backdrop-blur-sm rounded-xl p-6 border border-border h-fit relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
              <div className="relative z-10">
                <h2 className="font-semibold text-lg mb-4 font-['Space_Grotesk']">Order Summary</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <div className="text-right">
                      <span className="font-['Space_Grotesk']">Ξ {toEth(subtotal)}</span>
                      <p className="text-xs text-muted-foreground">${subtotal.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <div className="text-right">
                      <span className="font-['Space_Grotesk']">{shipping === 0 ? "Free" : `Ξ ${toEth(shipping)}`}</span>
                      {shipping > 0 && <p className="text-xs text-muted-foreground">${shipping.toFixed(2)}</p>}
                    </div>
                  </div>
                  {shipping > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Free shipping on orders over Ξ {toEth(100)}
                    </p>
                  )}
                  <div className="border-t border-border pt-3">
                    <div className="flex justify-between font-semibold text-lg">
                      <span className="font-['Space_Grotesk']">Total</span>
                      <div className="text-right">
                        <span className="text-primary font-['Space_Grotesk']">Ξ {toEth(total)}</span>
                        <p className="text-xs text-muted-foreground font-normal">${total.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <Link to="/checkout" className="w-full">
                  <Button className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground font-['Space_Grotesk'] shadow-[0_0_20px_hsl(270_80%_60%/0.3)]">
                    Proceed to Checkout
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
