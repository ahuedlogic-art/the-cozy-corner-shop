import { useState } from "react";
import { ArrowLeft, CreditCard, Wallet, Truck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useProducts } from "@/hooks/useProducts";
import { Header } from "@/components/layout/Header";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ShippingInfo {
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
  notes: string;
}

const Checkout = () => {
  const { cartItems, cartCount } = useCart();
  const { user } = useAuth();
  const { data: products = [] } = useProducts();
  const navigate = useNavigate();
  
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    address: "",
    city: "",
    postalCode: "",
    country: "",
    phone: "",
    notes: "",
  });

  const cartProducts = cartItems.map((item) => {
    const product = products.find((p) => p.id === item.product_id);
    return { ...item, product };
  }).filter((item) => item.product);

  const subtotal = cartProducts.reduce((sum, item) => {
    return sum + (item.product?.price || 0) * item.quantity;
  }, 0);

  const shipping = subtotal > 100 ? 0 : 9.99;
  const total = subtotal + shipping;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!shippingInfo.address.trim()) {
      toast({ title: "Error", description: "Please enter your address", variant: "destructive" });
      return false;
    }
    if (!shippingInfo.city.trim()) {
      toast({ title: "Error", description: "Please enter your city", variant: "destructive" });
      return false;
    }
    if (!shippingInfo.postalCode.trim()) {
      toast({ title: "Error", description: "Please enter your postal code", variant: "destructive" });
      return false;
    }
    if (!shippingInfo.country.trim()) {
      toast({ title: "Error", description: "Please enter your country", variant: "destructive" });
      return false;
    }
    if (!shippingInfo.phone.trim()) {
      toast({ title: "Error", description: "Please enter your phone number", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleCheckout = async () => {
    if (!user || cartItems.length === 0) return;
    if (!validateForm()) return;

    setCheckoutLoading(true);
    try {
      // Fetch product prices
      const productIds = cartItems.map((item) => item.product_id);
      const { data: productData, error: productsError } = await supabase
        .from("products")
        .select("id, price, stock_quantity")
        .in("id", productIds);

      if (productsError || !productData) {
        throw new Error("Failed to fetch product data");
      }

      // Check stock availability
      for (const item of cartItems) {
        const product = productData.find((p) => p.id === item.product_id);
        if (!product || product.stock_quantity < item.quantity) {
          toast({
            title: "Insufficient stock",
            description: `Not enough stock available for one or more items.`,
            variant: "destructive",
          });
          setCheckoutLoading(false);
          return;
        }
      }

      // Create orders and update stock
      for (const item of cartItems) {
        const product = productData.find((p) => p.id === item.product_id);
        if (!product) continue;

        const totalPrice = product.price * item.quantity;

        // Create order with shipping info
        const { error: orderError } = await supabase.from("orders").insert({
          user_id: user.id,
          product_id: item.product_id,
          quantity: item.quantity,
          total_price: totalPrice,
          status: paymentMethod === "cod" ? "pending" : "completed",
          shipping_address: shippingInfo.address,
          shipping_city: shippingInfo.city,
          shipping_postal_code: shippingInfo.postalCode,
          shipping_country: shippingInfo.country,
          shipping_phone: shippingInfo.phone,
          payment_method: paymentMethod,
          order_notes: shippingInfo.notes || null,
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

      toast({
        title: "Order placed!",
        description: paymentMethod === "cod" 
          ? "Your order has been placed. Pay on delivery." 
          : "Your order has been successfully placed.",
      });
      navigate("/orders");
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Checkout failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in</h1>
          <p className="text-muted-foreground mb-6">You need to sign in to checkout.</p>
          <Link to="/auth">
            <Button variant="success">Sign in</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">Add some products before checkout.</p>
          <Link to="/">
            <Button variant="success">Start Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-8">
        <Link to="/cart" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Cart
        </Link>

        <h1 className="text-2xl font-bold mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Shipping & Payment Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Information */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Shipping Information
              </h2>
              <div className="grid gap-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="address">Street Address *</Label>
                    <Input
                      id="address"
                      name="address"
                      placeholder="123 Main Street"
                      value={shippingInfo.address}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      name="city"
                      placeholder="New York"
                      value={shippingInfo.city}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="postalCode">Postal Code *</Label>
                    <Input
                      id="postalCode"
                      name="postalCode"
                      placeholder="10001"
                      value={shippingInfo.postalCode}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country *</Label>
                    <Input
                      id="country"
                      name="country"
                      placeholder="United States"
                      value={shippingInfo.country}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+1 234 567 890"
                    value={shippingInfo.phone}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Order Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    placeholder="Any special instructions for delivery..."
                    value={shippingInfo.notes}
                    onChange={handleInputChange}
                    className="mt-1"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Method
              </h2>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary/50 cursor-pointer transition-colors">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card" className="flex items-center gap-3 cursor-pointer flex-1">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Credit / Debit Card</p>
                      <p className="text-sm text-muted-foreground">Pay securely with your card</p>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary/50 cursor-pointer transition-colors">
                  <RadioGroupItem value="paypal" id="paypal" />
                  <Label htmlFor="paypal" className="flex items-center gap-3 cursor-pointer flex-1">
                    <Wallet className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium">PayPal</p>
                      <p className="text-sm text-muted-foreground">Pay with your PayPal account</p>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary/50 cursor-pointer transition-colors">
                  <RadioGroupItem value="cod" id="cod" />
                  <Label htmlFor="cod" className="flex items-center gap-3 cursor-pointer flex-1">
                    <Truck className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">Cash on Delivery</p>
                      <p className="text-sm text-muted-foreground">Pay when you receive your order</p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-card rounded-xl p-6 border border-border h-fit sticky top-24">
            <h2 className="font-semibold text-lg mb-4">Order Summary</h2>
            
            {/* Cart Items Preview */}
            <div className="space-y-3 max-h-48 overflow-y-auto mb-4">
              {cartProducts.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <img
                    src={item.product?.image}
                    alt={item.product?.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.product?.name}</p>
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-medium">${((item.product?.price || 0) * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal ({cartCount} items)</span>
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
            
            <Button
              variant="success"
              className="w-full mt-6"
              onClick={handleCheckout}
              disabled={checkoutLoading}
            >
              {checkoutLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                `Place Order - $${total.toFixed(2)}`
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;