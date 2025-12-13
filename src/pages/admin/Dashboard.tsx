import { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Package, 
  CreditCard, 
  MessageSquare, 
  ShoppingBag,
  Users,
  Settings,
  LogOut,
  Search,
  Bell,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { ProductsTable } from "@/components/admin/ProductsTable";
import { supabase } from "@/integrations/supabase/client";

const transactionData = [
  { name: "Jan", value: 4000 },
  { name: "Feb", value: 3000 },
  { name: "Mar", value: 5000 },
  { name: "Apr", value: 4500 },
  { name: "May", value: 6000 },
  { name: "Jun", value: 5500 },
  { name: "Jul", value: 7000 },
  { name: "Aug", value: 6500 },
  { name: "Sep", value: 8000 },
  { name: "Oct", value: 7500 },
  { name: "Nov", value: 9000 },
  { name: "Dec", value: 8500 },
];

const visitorData = [
  { name: "Mon", current: 400, lastMonth: 300 },
  { name: "Tue", current: 500, lastMonth: 400 },
  { name: "Wed", current: 450, lastMonth: 350 },
  { name: "Thu", current: 600, lastMonth: 450 },
];

const pieData = [
  { name: "Sneakers", value: 58, color: "hsl(262 83% 58%)" },
  { name: "Apparel", value: 24, color: "hsl(280 83% 65%)" },
  { name: "Accessories", value: 11, color: "hsl(262 83% 75%)" },
  { name: "Other", value: 7, color: "hsl(var(--muted))" },
];

const topCountries = [
  { name: "United States", percentage: 85 },
  { name: "United Kingdom", percentage: 70 },
  { name: "Germany", percentage: 55 },
  { name: "France", percentage: 40 },
  { name: "Canada", percentage: 30 },
];

type SidebarTab = "dashboard" | "products" | "orders" | "transactions" | "messages";

const sidebarItems: { icon: typeof LayoutDashboard; label: string; tab: SidebarTab }[] = [
  { icon: LayoutDashboard, label: "Dashboard", tab: "dashboard" },
  { icon: Package, label: "Order Summary", tab: "orders" },
  { icon: CreditCard, label: "Transaction", tab: "transactions" },
  { icon: MessageSquare, label: "Messages", tab: "messages" },
  { icon: ShoppingBag, label: "Products", tab: "products" },
];

const supportItems = [
  { icon: Users, label: "Account" },
  { icon: Settings, label: "Settings" },
];

const Dashboard = () => {
  const { user, signOut, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTimeTab, setActiveTimeTab] = useState("Month");
  const [activeSidebarTab, setActiveSidebarTab] = useState<SidebarTab>("dashboard");
  const [lowStockCount, setLowStockCount] = useState(0);
  const [outOfStockCount, setOutOfStockCount] = useState(0);

  useEffect(() => {
    const fetchStockCounts = async () => {
      const { data: lowStock } = await supabase
        .from("products")
        .select("id", { count: "exact" })
        .gt("stock_quantity", 0)
        .lt("stock_quantity", 10);
      
      const { data: outOfStock } = await supabase
        .from("products")
        .select("id", { count: "exact" })
        .eq("stock_quantity", 0);
      
      setLowStockCount(lowStock?.length || 0);
      setOutOfStockCount(outOfStock?.length || 0);
    };
    
    fetchStockCounts();
  }, []);

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate("/");
    }
  }, [isAdmin, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-foreground">
        Loading...
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        {/* Logo */}
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">M</span>
            </div>
            <span className="font-bold text-xl tracking-tight">MLC Store</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4 px-3">General</p>
          <ul className="space-y-1">
            {sidebarItems.map((item) => (
              <li key={item.label}>
                <button
                  onClick={() => setActiveSidebarTab(item.tab)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    activeSidebarTab === item.tab 
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>

          <p className="text-xs text-muted-foreground uppercase tracking-wider mt-8 mb-4 px-3">Support</p>
          <ul className="space-y-1">
            {supportItems.map((item) => (
              <li key={item.label}>
                <button
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              </li>
            ))}
            <li>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-muted/50 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </li>
          </ul>
        </nav>

        {/* Pro Card */}
        <div className="p-4">
          <div className="bg-primary/10 rounded-2xl p-4">
            <p className="text-sm font-medium text-primary mb-1">Get more complete access and analysis</p>
            <Button size="sm" className="w-full mt-3">
              Go Pro Now!
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search Anything..."
                className="w-64 pl-10 bg-muted/50 border-0"
              />
            </div>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
            </Button>
            <Avatar className="h-9 w-9 border-2 border-primary/20">
              <AvatarImage src="" />
              <AvatarFallback className="bg-warning text-warning-foreground">
                {user?.email?.charAt(0).toUpperCase() || "A"}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-6 overflow-auto">
          {activeSidebarTab === "products" ? (
            <ProductsTable />
          ) : (
          <div className="grid grid-cols-12 gap-6">
            {/* Transaction Activity Chart */}
            <div className="col-span-8 bg-card rounded-2xl p-6 shadow-card border border-border">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Transaction activity</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold">$90,984</span>
                      <span className="text-sm text-primary flex items-center">
                        15.90% <ArrowUpRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 bg-muted/50 rounded-lg p-1">
                  {["Day", "Week", "Month", "Year"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTimeTab(tab)}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        activeTimeTab === tab
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={transactionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))", 
                        borderRadius: "8px" 
                      }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Balance Card */}
            <div className="col-span-4 bg-card rounded-2xl p-6 shadow-card border border-border">
              <p className="text-sm text-muted-foreground mb-1">Balance</p>
              <p className="text-3xl font-bold mb-6">$ 2,345.90</p>
              
              <div className="mb-6">
                <p className="text-sm text-muted-foreground mb-2">Pay with</p>
                <div className="flex items-center gap-3 bg-muted/30 rounded-lg p-3">
                  <div className="h-8 w-8 rounded-full bg-primary" />
                  <span className="text-sm">Card 907636 ********</span>
                </div>
              </div>

              <Button className="w-full">
                Withdraw Money
              </Button>

              <div className="mt-6">
                <p className="text-sm font-medium mb-4">Sales Mapping by country</p>
                <div className="h-32 bg-muted/20 rounded-lg flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">World Map</span>
                </div>
              </div>
            </div>

            {/* Low Stock Alert Card */}
            <div className="col-span-4 bg-card rounded-2xl p-6 shadow-card border border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                </div>
                <p className="text-sm text-muted-foreground">Low Stock Items</p>
              </div>
              <p className="text-3xl font-bold">
                {lowStockCount}<span className="text-sm font-normal text-muted-foreground"> products</span>
              </p>
              <p className="text-xs text-amber-500 mt-2">Stock below 10 units</p>
            </div>

            {/* Out of Stock Alert Card */}
            <div className="col-span-4 bg-card rounded-2xl p-6 shadow-card border border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-destructive/20 flex items-center justify-center">
                  <XCircle className="h-5 w-5 text-destructive" />
                </div>
                <p className="text-sm text-muted-foreground">Out of Stock</p>
              </div>
              <p className="text-3xl font-bold">
                {outOfStockCount}<span className="text-sm font-normal text-muted-foreground"> products</span>
              </p>
              <p className="text-xs text-destructive mt-2">Requires immediate restock</p>
            </div>

            {/* Top Countries */}
            <div className="col-span-4 bg-card rounded-2xl p-6 shadow-card border border-border">
              <p className="text-sm font-medium mb-4">Top Country</p>
              <div className="space-y-3">
                {topCountries.map((country) => (
                  <div key={country.name} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-24 truncate">{country.name}</span>
                    <div className="flex-1 h-2 bg-muted/30 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${country.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Average Sales with Pie Chart */}
            <div className="col-span-4 bg-card rounded-2xl p-6 shadow-card border border-border">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">Average sales</p>
                <select className="text-xs bg-muted/50 border-0 rounded px-2 py-1">
                  <option>Month</option>
                </select>
              </div>
              <p className="text-2xl font-bold mb-4">$975,993</p>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={50}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {pieData.map((item) => (
                  <div key={item.name} className="flex items-center gap-1 text-xs">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Average Visitor Bar Chart */}
            <div className="col-span-4 bg-card rounded-2xl p-6 shadow-card border border-border">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">Average visitor</p>
                <select className="text-xs bg-muted/50 border-0 rounded px-2 py-1">
                  <option>Weekly</option>
                </select>
              </div>
              <p className="text-2xl font-bold mb-4">560,395<span className="text-sm font-normal text-muted-foreground">/User</span></p>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={visitorData}>
                    <Bar dataKey="current" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="lastMonth" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs">
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-muted-foreground">Current</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-muted" />
                  <span className="text-muted-foreground">Last Month</span>
                </div>
                <span className="text-success flex items-center ml-auto">
                  20% <ArrowUpRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
