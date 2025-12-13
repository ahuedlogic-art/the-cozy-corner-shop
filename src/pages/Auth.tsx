import { useState, useEffect } from "react";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import tharketyLogo from "@/assets/tharkety-logo.png";
import { z } from "zod";
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
});
const signupSchema = loginSchema.extend({
  name: z.string().min(2, "Name must be at least 2 characters")
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
  const {
    signIn,
    signUp,
    user
  } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      if (isLogin) {
        const result = loginSchema.safeParse({
          email,
          password
        });
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach(err => {
            if (err.path[0]) {
              fieldErrors[err.path[0] as string] = err.message;
            }
          });
          setErrors(fieldErrors);
          setLoading(false);
          return;
        }
        const {
          error
        } = await signIn(email, password);
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast({
              title: "Login failed",
              description: "Invalid email or password. Please try again.",
              variant: "destructive"
            });
          } else {
            toast({
              title: "Login failed",
              description: error.message,
              variant: "destructive"
            });
          }
        } else {
          toast({
            title: "Welcome back!",
            description: "You have successfully logged in."
          });
          navigate("/");
        }
      } else {
        const result = signupSchema.safeParse({
          email,
          password,
          name
        });
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach(err => {
            if (err.path[0]) {
              fieldErrors[err.path[0] as string] = err.message;
            }
          });
          setErrors(fieldErrors);
          setLoading(false);
          return;
        }
        const {
          error
        } = await signUp(email, password, name);
        if (error) {
          if (error.message.includes("User already registered")) {
            toast({
              title: "Account exists",
              description: "An account with this email already exists. Please sign in.",
              variant: "destructive"
            });
          } else {
            toast({
              title: "Sign up failed",
              description: error.message,
              variant: "destructive"
            });
          }
        } else {
          toast({
            title: "Account created!",
            description: "Your account has been created successfully."
          });
          navigate("/");
        }
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  return <div className="min-h-screen flex">
      {/* Left Panel - Product Showcase */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[hsl(220,80%,55%)] via-[hsl(260,70%,50%)] to-[hsl(280,70%,45%)]">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        
        {/* Back Button */}
        <Link to="/" className="absolute top-6 left-6 z-10 flex items-center gap-2 text-white/80 hover:text-white transition-colors">
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm font-medium">Back to Store</span>
        </Link>

        {/* Product Image */}
        <div className="flex-1 flex items-center justify-center p-12">
          <div className="relative">
            <img src="https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=500&fit=crop" alt="Featured Sneaker" className="max-w-md w-full rounded-3xl shadow-2xl transform -rotate-12 hover:rotate-0 transition-transform duration-700" />
            <div className="absolute -bottom-8 left-8 right-8 bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
              <p className="text-white font-semibold text-lg">Air Force 1 Low</p>
              <div className="flex gap-2 mt-2">
                <span className="w-2 h-2 rounded-full bg-white" />
                <span className="w-2 h-2 rounded-full bg-white/40" />
                <span className="w-2 h-2 rounded-full bg-white/40" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <img src={tharketyLogo} alt="Tharkety" className="h-16 mx-auto mb-4 object-contain" />
            <p className="text-gray-500 text-sm">Your premium marketplace</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && <div className="space-y-2">
                <label className="text-sm text-gray-600 font-medium">Full Name</label>
                <Input type="text" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} className="h-12 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-[hsl(260,70%,50%)] focus-visible:border-[hsl(260,70%,50%)]" />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>}

            <div className="space-y-2">
              <label className="text-sm text-gray-600 font-medium">Email</label>
              <Input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} className="h-12 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-[hsl(260,70%,50%)] focus-visible:border-[hsl(260,70%,50%)]" />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-600 font-medium">Password</label>
              <div className="relative">
                <Input type={showPassword ? "text" : "password"} placeholder="••••••••••••" value={password} onChange={e => setPassword(e.target.value)} className="h-12 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-[hsl(260,70%,50%)] focus-visible:border-[hsl(260,70%,50%)] pr-12" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>

            {isLogin && <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={rememberMe} onCheckedChange={checked => setRememberMe(!!checked)} className="border-gray-300 data-[state=checked]:bg-[hsl(260,70%,50%)] data-[state=checked]:border-[hsl(260,70%,50%)]" />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
                <button type="button" className="text-sm text-[hsl(260,70%,50%)] hover:text-[hsl(260,70%,40%)] transition-colors font-medium">
                  Forgot Password?
                </button>
              </div>}

            <Button type="submit" size="xl" className="w-full rounded-xl bg-gradient-to-r from-[hsl(220,80%,55%)] via-[hsl(260,70%,50%)] to-[hsl(280,70%,45%)] hover:opacity-90 text-white border-0" disabled={loading}>
              {loading ? "Please wait..." : isLogin ? "Sign in" : "Create Account"}
            </Button>
          </form>

          {/* Toggle Auth Mode */}
          <p className="text-center text-gray-500 text-sm">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => {
            setIsLogin(!isLogin);
            setErrors({});
          }} className="text-[hsl(260,70%,50%)] hover:text-[hsl(260,70%,40%)] font-medium transition-colors">
              {isLogin ? "Create an Account" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>;
};
export default Auth;