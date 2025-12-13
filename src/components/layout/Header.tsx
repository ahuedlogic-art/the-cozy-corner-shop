import { useState } from "react";
import { Search, ShoppingCart, Heart, Package, User, LogOut, LayoutDashboard, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import tharketyLogo from "@/assets/tharkety-logo.jpg";

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    setMobileMenuOpen(false);
  };
  
  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  const handleNavClick = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-white dark:bg-card/95 backdrop-blur supports-[backdrop-filter]:dark:bg-card/80">
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Mobile Menu Button */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0">
            <SheetHeader className="p-4 border-b border-border">
              <SheetTitle className="flex items-center gap-2">
                <img src={tharketyLogo} alt="Tharkety" className="h-8 object-contain" />
              </SheetTitle>
            </SheetHeader>
            <div className="flex flex-col p-4">
              {/* Mobile Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="search" 
                  placeholder="Search products..." 
                  className="pl-10 pr-4 h-10 bg-muted border-0 focus-visible:ring-primary" 
                />
              </div>

              {/* Mobile Navigation Links */}
              <nav className="flex flex-col gap-1">
                <button
                  onClick={() => handleNavClick("/")}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-foreground hover:bg-muted transition-colors text-left"
                >
                  <Search className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Browse Products</span>
                </button>
                <button
                  onClick={() => handleNavClick("/orders")}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-foreground hover:bg-muted transition-colors text-left"
                >
                  <Package className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">My Orders</span>
                </button>
                <button
                  onClick={() => handleNavClick("/cart")}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-foreground hover:bg-muted transition-colors text-left"
                >
                  <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Cart</span>
                  {cartCount > 0 && (
                    <span className="ml-auto h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                      {cartCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => handleNavClick("/")}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-foreground hover:bg-muted transition-colors text-left"
                >
                  <Heart className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Favourites</span>
                </button>
              </nav>

              {/* Divider */}
              <div className="border-t border-border my-4" />

              {/* User Section */}
              {user ? (
                <div className="flex flex-col gap-1">
                  <div className="px-3 py-2 mb-2">
                    <p className="text-sm font-medium">{user.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {isAdmin ? "Administrator" : "Customer"}
                    </p>
                  </div>
                  <button
                    onClick={() => handleNavClick("/profile")}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-foreground hover:bg-muted transition-colors text-left"
                  >
                    <User className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">Profile</span>
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => handleNavClick("/admin")}
                      className="flex items-center gap-3 px-3 py-3 rounded-lg text-foreground hover:bg-muted transition-colors text-left"
                    >
                      <LayoutDashboard className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">Admin Dashboard</span>
                    </button>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-destructive hover:bg-destructive/10 transition-colors text-left"
                  >
                    <LogOut className="h-5 w-5" />
                    <span className="font-medium">Sign out</span>
                  </button>
                </div>
              ) : (
                <Button 
                  onClick={() => handleNavClick("/auth")} 
                  className="w-full bg-gradient-to-r from-[hsl(220,80%,55%)] via-[hsl(260,70%,50%)] to-[hsl(280,70%,45%)]"
                >
                  Sign in / Create Account
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src={tharketyLogo} alt="Tharkety" className="h-10 object-contain" />
        </Link>

        {/* Search Bar - Hidden on mobile */}
        <div className="hidden md:flex flex-1 max-w-xl">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search products, brands, categories..." className="pl-10 pr-4 h-10 bg-muted border-0 focus-visible:ring-primary" />
          </div>
        </div>

        {/* Desktop Navigation Icons - Hidden on mobile */}
        <nav className="hidden md:flex items-center gap-1">
          <Link to="/orders">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
              <Package className="h-4 w-4" />
              <span>Orders</span>
            </Button>
          </Link>
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
            <Heart className="h-4 w-4" />
            <span>Favourites</span>
          </Button>
          <Link to="/cart">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground relative">
              <ShoppingCart className="h-4 w-4" />
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                  {cartCount}
                </span>
              )}
            </Button>
          </Link>

          {user ? (
            <DropdownMenu>
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
                {isAdmin && (
                  <DropdownMenuItem onClick={() => navigate("/admin")}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth">
              <Button variant="ghost" size="icon" className="rounded-full ml-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
              </Button>
            </Link>
          )}
        </nav>

        {/* Mobile Cart & User Icons */}
        <div className="flex md:hidden items-center gap-1">
          <Link to="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                  {cartCount}
                </span>
              )}
            </Button>
          </Link>
          {user ? (
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setMobileMenuOpen(true)}>
              <Avatar className="h-8 w-8">
                <AvatarImage src="" />
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-xs">
                  {getInitials(user.email || "U")}
                </AvatarFallback>
              </Avatar>
            </Button>
          ) : (
            <Link to="/auth">
              <Button variant="ghost" size="icon" className="rounded-full">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};