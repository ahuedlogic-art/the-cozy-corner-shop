import { useState } from "react";
import { ArrowLeft, CreditCard, Wallet, Truck, Loader2, Diamond } from "lucide-react";
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

const ETH_RATE = 0.00042;
const toEth = (usd: number) => (usd * ETH_RATE).toFixed(4);

const Checkout = () => {
  const { cartItems, cartCount } = useCart();
  const { user } = useAuth();
  const { data: products = [] } = useProducts();
  const navigate = useNavigate();

  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [shippingInfo, setShippingInfo] = useState({
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
    const fields = [
      { key: "address", label: "address" },
      { key: "city", label: "city" },
      { key: "postalCode", label: "postal code" },
      { key: "country", label: "country" },
      { key: "phone", label: "phone number" },
    ];
    for (const f of fields) {
      if (!(shippingInfo as any)[f.key]?.trim()) {
        toast({ title: "Error", description: `Please enter your ${f.label}`, variant: "destructive" });
        return false;
      }
    }
    return true;
  };

  const handleCheckout = async () => {
    if (!user || cartItems.length === 0) return;
    if (!validateForm()) return;

    setCheckoutLoading(true);
    try {
      const productIds = cartItems.map((item) => item.product_id);
      const { data: productData, error: productsError } = await supabase
        .from("products")
        .select("id, price, stock_quantity")
        .in("id", productIds);

      if (productsError || !productData) throw new Error("Failed to fetch product data");

      for (const item of cartItems) {
        const product = productData.find((p) => p.id === item.product_id);
        if (!product || product.stock_quantity < item.quantity) {
          toast({ title: "Insufficient stock", description: "Not enough stock available for one or more items.", variant: "destructive" });
          setCheckoutLoading(false);
          return;
        }
      }

      for (const item of cartItems) {
        const product = productData.find((p) => p.id === item.product_id);
        if (!product) continue;
        const totalPrice = product.price * item.quantity;

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

        if (orderError) throw new Error("Failed to create order");

        await supabase
          .from("products")
          .update({ stock_quantity: product.stock_quantity - item.quantity })
          .eq("id", item.product_id);
      }

      await supabase.from("cart_items").delete().eq("user_id", user.id);

      toast({
        title: "Order placed! 🎉",
        description: paymentMethod === "cod"
          ? "Your order has been placed. Pay on delivery."
          : "Your order has been successfully placed.",
      });
      navigate("/orders");
    } catch (error) {
      console.error("Checkout error:", error);
      toast({ title: "Checkout failed", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold font-['Space_Grotesk'] mb-4">Please sign in</h1>
          <p className="text-muted-foreground mb-6">You need to sign in to checkout.</p>
          <Link to="/auth"><Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Sign in</Button></Link>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold font-['Space_Grotesk'] mb-4">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">Add some NFTs before checkout.</p>
          <Link to="/"><Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Browse NFTs</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-8">
        <Link to="/cart" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Cart
        </Link>

        <h1 className="text-2xl font-bold font-['Space_Grotesk'] mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Shipping & Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping */}
            <div className="bg-card/80 backdrop-blur-sm rounded-xl p-6 border border-border relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
              <div className="relative z-10">
                <h2 className="font-semibold text-lg mb-4 flex items-center gap-2 font-['Space_Grotesk']">
                  <Truck className="h-5 w-5 text-primary" />
                  Shipping Information
                </h2>
                <div className="grid gap-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="address" className="text-muted-foreground">Street Address *</Label>
                      <Input id="address" name="address" placeholder="123 Main Street" value={shippingInfo.address} onChange={handleInputChange} className="mt-1 bg-background/50 border-border focus:border-primary" />
                    </div>
                    <div>
                      <Label htmlFor="city" className="text-muted-foreground">City *</Label>
                      <Input id="city" name="city" placeholder="New York" value={shippingInfo.city} onChange={handleInputChange} className="mt-1 bg-background/50 border-border focus:border-primary" />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="postalCode" className="text-muted-foreground">Postal Code *</Label>
                      <Input id="postalCode" name="postalCode" placeholder="10001" value={shippingInfo.postalCode} onChange={handleInputChange} className="mt-1 bg-background/50 border-border focus:border-primary" />
                    </div>
                    <div>
                      <Label htmlFor="country" className="text-muted-foreground">Country *</Label>
                      <Input id="country" name="country" placeholder="United States" value={shippingInfo.country} onChange={handleInputChange} className="mt-1 bg-background/50 border-border focus:border-primary" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-muted-foreground">Phone Number *</Label>
                    <Input id="phone" name="phone" type="tel" placeholder="+1 234 567 890" value={shippingInfo.phone} onChange={handleInputChange} className="mt-1 bg-background/50 border-border focus:border-primary" />
                  </div>
                  <div>
                    <Label htmlFor="notes" className="text-muted-foreground">Order Notes (Optional)</Label>
                    <Textarea id="notes" name="notes" placeholder="Any special instructions..." value={shippingInfo.notes} onChange={handleInputChange} className="mt-1 bg-background/50 border-border focus:border-primary" rows={3} />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-card/80 backdrop-blur-sm rounded-xl p-6 border border-border relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
              <div className="relative z-10">
                <h2 className="font-semibold text-lg mb-4 flex items-center gap-2 font-['Space_Grotesk']">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Payment Method
                </h2>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                  {[
                    { value: "card", icon: CreditCard, color: "text-primary", label: "Credit / Debit Card", desc: "Pay securely with your card" },
                    { value: "crypto", icon: Diamond, color: "text-primary", label: "Crypto Wallet (ETH)", desc: "Pay with MetaMask or WalletConnect" },
                    { value: "paypal", icon: Wallet, color: "text-info", label: "PayPal", desc: "Pay with your PayPal account" },
                    { value: "cod", icon: Truck, color: "text-success", label: "Cash on Delivery", desc: "Pay when you receive your order" },
                  ].map((method) => (
                    <div
                      key={method.value}
                      className={`flex items-center space-x-3 p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                        paymentMethod === method.value
                          ? "border-primary bg-primary/10 shadow-[0_0_15px_hsl(270_80%_60%/0.15)]"
                          : "border-border hover:border-primary/30 bg-background/30"
                      }`}
                    >
                      <RadioGroupItem value={method.value} id={method.value} />
                      <Label htmlFor={method.value} className="flex items-center gap-3 cursor-pointer flex-1">
                        <method.icon className={`h-5 w-5 ${method.color}`} />
                        <div>
                          <p className="font-medium font-['Space_Grotesk']">{method.label}</p>
                          <p className="text-sm text-muted-foreground">{method.desc}</p>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-card/80 backdrop-blur-sm rounded-xl p-6 border border-border h-fit sticky top-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <h2 className="font-semibold text-lg mb-4 font-['Space_Grotesk']">Order Summary</h2>

              <div className="space-y-3 max-h-48 overflow-y-auto mb-4 pr-1">
                {cartProducts.map((item) => (
                  <div key={item.id} className="flex gap-3 group">
                    <div className="relative overflow-hidden rounded">
                      <img src={item.product?.image} alt={item.product?.name} className="w-12 h-12 object-cover rounded group-hover:scale-105 transition-transform" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate font-['Space_Grotesk']">{item.product?.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-primary font-['Space_Grotesk']">Ξ {toEth((item.product?.price || 0) * item.quantity)}</p>
                      <p className="text-xs text-muted-foreground">${((item.product?.price || 0) * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal ({cartCount} items)</span>
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
                  <p className="text-xs text-muted-foreground">Free shipping on orders over Ξ {toEth(100)}</p>
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

              <Button
                className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground font-['Space_Grotesk'] shadow-[0_0_20px_hsl(270_80%_60%/0.3)]"
                onClick={handleCheckout}
                disabled={checkoutLoading}
              >
                {checkoutLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Place Order — Ξ ${toEth(total)}`
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
