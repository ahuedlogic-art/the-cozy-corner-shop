import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Package, ArrowLeft, ExternalLink } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";

interface OrderWithProduct {
  id: string;
  quantity: number;
  total_price: number;
  status: string;
  created_at: string;
  product: {
    id: string;
    name: string;
    image: string | null;
    brand: string;
  } | null;
}

const OrderHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["orders", user?.id],
    queryFn: async () => {
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("id, quantity, total_price, status, created_at, product_id")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;

      // Get product details
      const productIds = ordersData?.map(o => o.product_id) || [];
      const { data: productsData } = await supabase
        .from("products")
        .select("id, name, image, brand")
        .in("id", productIds);

      const productMap = new Map(productsData?.map(p => [p.id, p]) || []);

      return ordersData?.map(order => ({
        ...order,
        product: productMap.get(order.product_id) || null
      })) as OrderWithProduct[];
    },
    enabled: !!user,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-success/10 text-success border-success/20";
      case "pending":
        return "bg-warning/10 text-warning border-warning/20";
      case "cancelled":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <div className="text-center py-16">
            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Sign in to view orders</h1>
            <p className="text-muted-foreground mb-6">
              You need to be logged in to view your order history.
            </p>
            <Link to="/auth">
              <Button>Sign In</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <Button
          variant="ghost"
          className="mb-6 gap-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="flex items-center gap-3 mb-8">
          <Package className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Order History</h1>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 rounded-xl bg-card border border-border">
                <div className="flex gap-4">
                  <Skeleton className="h-20 w-20 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : orders && orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Product Image */}
                  <div className="h-20 w-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <img
                      src={order.product?.image || "/placeholder.svg"}
                      alt={order.product?.name || "Product"}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Order Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-foreground truncate">
                          {order.product?.name || "Unknown Product"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {order.product?.brand}
                        </p>
                      </div>
                      <Badge variant="outline" className={getStatusColor(order.status)}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                      <span className="text-muted-foreground">
                        Qty: <span className="text-foreground font-medium">{order.quantity}</span>
                      </span>
                      <span className="text-muted-foreground">
                        Total: <span className="text-foreground font-medium">${Number(order.total_price).toFixed(2)}</span>
                      </span>
                      <span className="text-muted-foreground">
                        {format(new Date(order.created_at), "MMM d, yyyy 'at' h:mm a")}
                      </span>
                    </div>
                  </div>

                  {/* View Product Link */}
                  {order.product && (
                    <Link
                      to={`/product/${order.product.id}`}
                      className="flex-shrink-0 self-center"
                    >
                      <Button variant="outline" size="sm" className="gap-2">
                        <ExternalLink className="h-4 w-4" />
                        View Product
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No orders yet</h2>
            <p className="text-muted-foreground mb-6">
              Start shopping to see your order history here.
            </p>
            <Link to="/">
              <Button>Browse Products</Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default OrderHistory;
