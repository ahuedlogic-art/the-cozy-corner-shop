import { Minus, Plus, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useProducts } from "@/hooks/useProducts";
import { Header } from "@/components/layout/Header";

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

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in</h1>
          <p className="text-muted-foreground mb-6">You need to sign in to view your cart.</p>
          <Link to="/auth">
            <Button variant="success">Sign in</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-8">
        <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" />
          Continue Shopping
        </Link>

        <h1 className="text-2xl font-bold mb-8">Shopping Cart ({cartCount} items)</h1>

        {cartProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">Your cart is empty</p>
            <Link to="/">
              <Button variant="success">Start Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartProducts.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 bg-card rounded-xl p-4 border border-border"
                >
                  <img
                    src={item.product?.image}
                    alt={item.product?.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{item.product?.name}</h3>
                    <p className="text-sm text-muted-foreground">{item.product?.brand}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {item.selected_size && (
                        <span className="text-sm text-muted-foreground">Size: {item.selected_size}</span>
                      )}
                      {item.selected_color && (
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          Color: 
                          <span 
                            className="w-4 h-4 rounded-full border border-border inline-block"
                            style={{ backgroundColor: item.selected_color }}
                          />
                        </span>
                      )}
                    </div>
                    <p className="text-lg font-bold mt-2">${item.product?.price.toFixed(2)}</p>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => removeFromCart(item.product_id, item.selected_size, item.selected_color)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.product_id, item.quantity - 1, item.selected_size, item.selected_color)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
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
            <div className="bg-card rounded-xl p-6 border border-border h-fit">
              <h2 className="font-semibold text-lg mb-4">Order Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Free shipping on orders over $100
                  </p>
                )}
                <div className="border-t border-border pt-3">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <Link to="/checkout" className="w-full">
                <Button variant="success" className="w-full mt-6">
                  Proceed to Checkout
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
