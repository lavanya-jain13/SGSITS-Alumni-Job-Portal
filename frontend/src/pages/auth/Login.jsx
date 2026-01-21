import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, GraduationCap, ArrowRight } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { apiClient } from "@/lib/api";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess, selectAuth } from "@/store/authSlice";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector(selectAuth);

  // Capture the intended redirect target once (e.g., /jobs/matching) so it
  // persists across renders and after login.
  const redirectPathRef = useRef(
    location.state?.from?.pathname ? location.state.from.pathname : null
  );

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const getTargetForRole = (role) => {
    const normalized = (role || "").toLowerCase();
    if (normalized === "admin") return "/admin";
    if (normalized === "alumni") return "/alumni";
    return "/dashboard";
  };

  // If already signed in, send them back to where they came from or their dashboard
  useEffect(() => {
    if (isAuthenticated && user?.role) {
      const from = redirectPathRef.current || location.state?.from?.pathname;
      const target = from || getTargetForRole(user.role);
      navigate(target, { replace: true, state: {} });
    }
  }, [isAuthenticated, user, navigate, location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiClient.login({
        email: formData.email,
        password: formData.password,
      });

      dispatch(loginSuccess({ user: response.user }));

      const from = redirectPathRef.current || location.state?.from?.pathname;
      const target = from || getTargetForRole(response.user.role);
      const roleLabel = from
        ? "next step"
        : (response.user.role || "").toLowerCase();
      toast({
        title: "Welcome back!",
        description: from
          ? "Taking you back to where you left off."
          : `Taking you to your ${roleLabel} dashboard.`,
        variant: "default",
      });
      navigate(target, { replace: true, state: {} });

    } catch (error) {
      toast({
        title: "Unable to sign in",
        description: error.message || "Check your email and password or create an account to continue.",
        variant: "default",
        className: "bg-blue-600 text-white dark:bg-cyan-600"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    // Updated background for a subtle, professional look
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <PublicHeader />
      {/* Centered container with optimized padding */}
      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-sm sm:max-w-md"> {/* slightly wider max-width for better balance */}
          {/* Card with enhanced shadow and border */}
          <Card className="shadow-2xl dark:shadow-blue-900/30 border-2 border-blue-500/20 dark:border-cyan-500/20 bg-white dark:bg-gray-900">
            <CardHeader className="space-y-1 text-center pt-8">
              {/* Prominent, branded icon */}
              <div className="mx-auto mb-4 w-14 h-14 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <CardTitle className="text-3xl font-extrabold text-gray-900 dark:text-white">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400 text-base">
                Sign in to your SGSITS Alumni Portal account
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium dark:text-gray-300">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@sgsits.ac.in"
                    className="h-11 dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium dark:text-gray-300">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="h-11 dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 text-gray-500 dark:text-gray-400 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="rememberMe"
                      className="border-gray-400 dark:border-gray-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
                      checked={formData.rememberMe}
                      onCheckedChange={(checked) => handleInputChange("rememberMe", checked)}
                    />
                    <Label htmlFor="rememberMe" className="text-sm font-normal text-gray-600 dark:text-gray-400 cursor-pointer">
                      Remember me
                    </Label>
                  </div>
                  <Link to="/reset-password" className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-cyan-400 dark:hover:text-cyan-500 hover:underline transition-colors">
                    Forgot password?
                  </Link>
                </div>

                {/* Primary Login Button with Gradient and Shadow */}
                <Button 
                  type="submit" 
                  className="w-full h-11 text-base bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/40 hover:from-blue-700 hover:to-cyan-600 transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    "Signing in..."
                  ) : (
                    <>
                      Sign In 
                      <ArrowRight className="w-4 h-4 ml-2"/>
                    </>
                  )}
                </Button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200 dark:border-gray-700"/>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-gray-900 px-2 text-muted-foreground dark:text-gray-500">
                    Need an account?
                  </span>
                </div>
              </div>

              {/* Secondary Signup Button */}
              <Button 
                variant="outline" 
                className="w-full h-11 text-base border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                asChild
              >
                <Link to="/signup">Create New Account</Link>
              </Button>
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Having trouble?{" "}
              <Link to="/support" className="font-medium text-blue-600 hover:text-blue-700 dark:text-cyan-400 dark:hover:text-cyan-500 hover:underline">
                Contact Support
              </Link>
            </p>
          </div>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
};

export default Login;
