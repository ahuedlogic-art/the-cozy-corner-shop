import { useState, useEffect } from "react";
import { Eye, EyeOff, ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const AdminLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { signIn, user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && user && isAdmin) navigate("/admin");
  }, [user, isAdmin, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      const result = loginSchema.safeParse({ email, password });
      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        result.error.errors.forEach((err) => { if (err.path[0]) fieldErrors[err.path[0] as string] = err.message; });
        setErrors(fieldErrors);
        setLoading(false);
        return;
      }
      const { error } = await signIn(email, password);
      if (error) {
        toast({ title: "Login failed", description: error.message.includes("Invalid login") ? "Invalid email or password." : error.message, variant: "destructive" });
      } else {
        setTimeout(() => navigate("/admin"), 500);
      }
    } catch {
      toast({ title: "Error", description: "Something went wrong.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden gradient-hero">
        <div className="absolute inset-0 gradient-glow" />
        <Link to="/" className="absolute top-6 left-6 z-10 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm font-medium">Back to Marketplace</span>
        </Link>
        <div className="flex-1 flex flex-col items-center justify-center p-12">
          <span className="text-gradient text-5xl font-bold tracking-tight mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>VOOPO</span>
          <div className="h-20 w-20 rounded-2xl bg-primary/20 neon-border flex items-center justify-center mb-6">
            <Shield className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Admin Portal</h2>
          <p className="text-muted-foreground text-center max-w-sm">
            Manage your NFT marketplace, monitor transactions, and oversee collections
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <span className="text-gradient text-3xl font-bold tracking-tight lg:hidden" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>VOOPO</span>
            <h1 className="text-3xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Admin Login</h1>
            <p className="text-muted-foreground">Sign in to access the admin dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input type="email" placeholder="admin@voopo.io" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 bg-muted border-border" />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <Input type={showPassword ? "text" : "password"} placeholder="••••••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 pr-12 bg-muted border-border" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>
            <Button type="submit" size="lg" className="w-full h-12 rounded-xl gradient-primary shadow-neon" disabled={loading}>
              {loading ? "Signing in..." : "Sign in to Dashboard"}
            </Button>
          </form>

          <p className="text-center text-muted-foreground text-sm">
            Not an admin?{" "}
            <Link to="/auth" className="text-primary hover:text-primary/80 font-medium transition-colors">
              Collector Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
