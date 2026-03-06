import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Home, MessageSquare, BarChart3, Heart, Store, Gavel, User, Settings, UserCircle,
  Search, Bell, LogOut, ChevronRight, Clock, Heart as HeartIcon, Flame
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useProducts } from "@/hooks/useProducts";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import tharkety from "@/assets/tharkety-logo.png";

const ETH_RATE = 0.00042;
const toEth = (usd: number) => (usd * ETH_RATE).toFixed(3);

const sidebarItems = [
  { icon: Home, label: "Dashboard", id: "dashboard" },
  { icon: MessageSquare, label: "Message", id: "message" },
  { icon: BarChart3, label: "Analytic", id: "analytic" },
  { icon: Heart, label: "Favorite", id: "favorite", badge: true },
  { icon: Store, label: "Market", id: "market", link: "/" },
  { icon: Gavel, label: "Active Bid", id: "activebid" },
  { icon: User, label: "Portfolio", id: "portfolio", link: "/orders" },
  { icon: Settings, label: "General Setting", id: "settings" },
  { icon: UserCircle, label: "Profile Setting", id: "profile" },
];

const aiChips = ["Ask AI", "Predict hot bids", "NFT Consult"];

const UserDashboard = () => {
  const { user, signOut, loading } = useAuth();
  const { data: products = [] } = useProducts();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [favCount, setFavCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      supabase.from("favorites").select("id", { count: "exact", head: true }).eq("user_id", user.id)
        .then(({ count }) => setFavCount(count || 0));
    }
  }, [user]);

  const featuredProducts = products.filter(p => p.isTopItem).slice(0, 2);
  const hotBids = products.slice(0, 10);
  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Creator";

  const handleSidebarClick = (item: typeof sidebarItems[0]) => {
    if (item.link) {
      navigate(item.link);
    } else {
      setActiveTab(item.id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 min-h-screen bg-card/50 backdrop-blur-xl border-r border-border flex flex-col p-6 sticky top-0 h-screen">
        <Link to="/" className="mb-10">
          <span
            className="text-2xl font-bold tracking-tight bg-clip-text text-transparent"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              backgroundImage: "var(--gradient-primary)",
            }}
          >
            VOOPO
          </span>
        </Link>

        <nav className="flex-1 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSidebarClick(item)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === item.id
                  ? "bg-primary text-primary-foreground shadow-[0_0_20px_hsl(270_80%_60%/0.3)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-['Space_Grotesk']">{item.label}</span>
              {item.badge && favCount > 0 && (
                <span className="ml-auto text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">
                  {favCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        <button
          onClick={() => { signOut(); navigate("/auth"); }}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-all"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-['Space_Grotesk']">Sign Out</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border px-8 py-4 flex items-center justify-between">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted/50 border-border h-10"
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-xl hover:bg-muted/50 transition-colors">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-border">
              <Avatar className="h-9 w-9 border-2 border-primary/30">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-primary/20 text-primary font-['Space_Grotesk'] text-sm">
                  {userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm font-medium font-['Space_Grotesk'] leading-none">{userName}</p>
                <p className="text-xs text-muted-foreground">Creator</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Greeting */}
          <div>
            <h1 className="text-3xl font-bold font-['Space_Grotesk']">
              Hello, {userName}
            </h1>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <p className="text-lg text-muted-foreground font-['Space_Grotesk']">
                How can I help you today?
              </p>
              {aiChips.map((chip) => (
                <button
                  key={chip}
                  className="px-4 py-1.5 rounded-full border border-primary/40 text-sm font-medium text-primary hover:bg-primary/10 transition-all font-['Space_Grotesk']"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Featured Auctions */}
          <div className="grid md:grid-cols-2 gap-6">
            {featuredProducts.length > 0
              ? featuredProducts.map((product) => (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    className="group relative rounded-2xl overflow-hidden border border-border bg-card/50 hover:border-primary/40 transition-all duration-300"
                  >
                    <div className="aspect-[16/10] overflow-hidden">
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <div className="flex items-center justify-between bg-card/80 backdrop-blur-md rounded-xl px-4 py-3 border border-border/50">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-primary" />
                            <div>
                              <p className="text-xs text-muted-foreground">Time Remaining</p>
                              <p className="text-sm font-bold font-['Space_Grotesk'] text-primary">18h : 17m : 29s</p>
                            </div>
                          </div>
                          <div className="border-l border-border pl-4">
                            <p className="text-xs text-muted-foreground">Highest Bid</p>
                            <p className="text-sm font-bold font-['Space_Grotesk'] text-primary">
                              {toEth(product.price)} ETH
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="bg-primary hover:bg-primary/90 text-primary-foreground font-['Space_Grotesk'] rounded-lg shadow-[0_0_12px_hsl(270_80%_60%/0.3)]"
                        >
                          Place A Bid
                        </Button>
                      </div>
                    </div>
                  </Link>
                ))
              : Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="aspect-[16/10] rounded-2xl bg-muted/30 animate-pulse border border-border" />
                ))}
          </div>

          {/* Hot Bids */}
          <div>
            <h2 className="text-xl font-bold font-['Space_Grotesk'] flex items-center gap-2 mb-5">
              <Flame className="h-5 w-5 text-orange-500" />
              Hot Bids
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {hotBids.map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  className="group rounded-2xl overflow-hidden border border-border bg-card/50 hover:border-primary/40 transition-all duration-300 hover:shadow-[0_0_25px_hsl(270_80%_60%/0.15)]"
                >
                  {/* Top bar */}
                  <div className="flex items-center justify-between px-3 py-2 bg-muted/30">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs font-mono text-muted-foreground">02:32:07</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-muted-foreground">{product.reviewCount || 43}</span>
                      <Heart className="h-3 w-3 text-muted-foreground hover:text-primary transition-colors" />
                    </div>
                  </div>

                  {/* Image */}
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>

                  {/* Info */}
                  <div className="p-3 space-y-1.5">
                    <p className="text-sm font-semibold font-['Space_Grotesk'] truncate">{product.name}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-primary font-['Space_Grotesk']">
                        {toEth(product.price)} ETH
                      </span>
                      <div className="flex -space-x-1.5">
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className="w-5 h-5 rounded-full border-2 border-card"
                            style={{
                              backgroundColor: ["hsl(270 80% 60%)", "hsl(200 80% 60%)", "hsl(340 80% 60%)"][i],
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
