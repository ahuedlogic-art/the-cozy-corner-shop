import { useState, useEffect } from "react";
import { Eye, EyeOff, ArrowLeft, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
const signupSchema = loginSchema.extend({
  name: z.string().min(2, "Name must be at least 2 characters"),
});

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      if (isLogin) {
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
          toast({ title: "Welcome back!", description: "You have successfully logged in." });
          navigate("/");
        }
      } else {
        const result = signupSchema.safeParse({ email, password, name });
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach((err) => { if (err.path[0]) fieldErrors[err.path[0] as string] = err.message; });
          setErrors(fieldErrors);
          setLoading(false);
          return;
        }
        const { error } = await signUp(email, password, name);
        if (error) {
          toast({ title: "Sign up failed", description: error.message, variant: "destructive" });
        } else {
          toast({ title: "Account created!", description: "Your account has been created successfully." });
          navigate("/");
        }
      }
    } catch {
      toast({ title: "Error", description: "Something went wrong.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden gradient-hero">
        <div className="absolute inset-0 gradient-glow" />
        <Link to="/" className="absolute top-6 left-6 z-10 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm font-medium">Back to Marketplace</span>
        </Link>
        <div className="flex-1 flex flex-col items-center justify-center p-12">
          <span className="text-gradient text-5xl font-bold tracking-tight mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>VOOPO</span>
          <p className="text-xl text-muted-foreground text-center max-w-sm mb-8">
            The premier NFT marketplace for digital collectors and creators
          </p>
          <div className="grid grid-cols-3 gap-4 w-full max-w-sm">
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 neon-border flex items-center justify-center text-3xl">🎨</div>
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-accent/20 to-primary/20 neon-border flex items-center justify-center text-3xl mt-8">🖼️</div>
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 neon-border flex items-center justify-center text-3xl">🎭</div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <span className="text-gradient text-3xl font-bold tracking-tight lg:hidden" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>VOOPO</span>
            <h1 className="text-2xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {isLogin ? "Welcome back" : "Join VOOPO"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isLogin ? "Sign in to your account" : "Create your collector account"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground font-medium">Full Name</label>
                <Input type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} className="h-12 bg-muted border-border focus-visible:ring-primary" />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground font-medium">Email</label>
              <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 bg-muted border-border focus-visible:ring-primary" />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground font-medium">Password</label>
              <div className="relative">
                <Input type={showPassword ? "text" : "password"} placeholder="••••••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 bg-muted border-border focus-visible:ring-primary pr-12" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>

            {isLogin && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={rememberMe} onCheckedChange={(checked) => setRememberMe(!!checked)} className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                  <span className="text-sm text-muted-foreground">Remember me</span>
                </label>
                <button type="button" className="text-sm text-primary hover:text-primary/80 transition-colors font-medium">Forgot Password?</button>
              </div>
            )}

            <Button type="submit" size="xl" className="w-full rounded-xl gradient-primary text-primary-foreground border-0 shadow-neon" disabled={loading}>
              <Wallet className="h-5 w-5 mr-2" />
              {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-muted-foreground text-sm">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => { setIsLogin(!isLogin); setErrors({}); }} className="text-primary hover:text-primary/80 font-medium transition-colors">
              {isLogin ? "Create an Account" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
export default Auth;
