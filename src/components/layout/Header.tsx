import { Search, ShoppingCart, Heart, Package, User, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
export const Header = () => {
  const {
    user,
    isAdmin,
    signOut
  } = useAuth();
  const {
    cartCount
  } = useCart();
  const navigate = useNavigate();
  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };
  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };
  return <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-secondary-foreground">
              <span className="text-primary-foreground font-bold text-lg">M</span>
            </div>
            <span className="font-bold text-xl tracking-tight text-foreground">​MARKETY                     </span>
          </div>
        </Link>

        {/* Search Bar */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search products, brands, categories..." className="pl-10 pr-4 h-10 bg-muted border-0 focus-visible:ring-primary" />
          </div>
        </div>

        {/* Navigation Icons */}
        <nav className="flex items-center gap-1">
          <Link to="/orders">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
              <Package className="h-4 w-4" />
              <span className="hidden md:inline">Orders</span>
            </Button>
          </Link>
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
            <Heart className="h-4 w-4" />
            <span className="hidden md:inline">Favourites</span>
          </Button>
          <Link to="/cart">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground relative">
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden md:inline">Cart</span>
              {cartCount > 0 && <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                  {cartCount}
                </span>}
            </Button>
          </Link>

          {user ? <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full ml-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                      {getInitials(user.email || "U")}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {isAdmin ? "Administrator" : "Customer"}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                {isAdmin && <DropdownMenuItem onClick={() => navigate("/admin")}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu> : <Link to="/auth">
              <Button variant="ghost" size="icon" className="rounded-full ml-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
              </Button>
            </Link>}
        </nav>
      </div>
    </header>;
};