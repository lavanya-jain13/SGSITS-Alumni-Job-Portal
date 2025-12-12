import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, GraduationCap, Building, UserPlus } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { apiClient } from "@/lib/api";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";

const BRANCHES = [
  "Computer Science",
  "Information Technology",
  "Electronics and Telecommunication",
  "Electronics and Instrumentation",
  "Electrical",
  "Mechanical",
  "Civil",
  "Industrial Production",
];

const SignUp = () => {
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userType, setUserType] = useState("student"); // default
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    studentId: "",
    gradYear: "",
    branch: "",
    currentTitle: "",
    acceptTerms: false,
  });

  // ✅ Auto-detect user type based on route and handle initial state setting
  useEffect(() => {
    let initialType = "student";
    if (location.pathname.includes("alumni")) {
      initialType = "alumni";
    }
    setUserType(initialType);
    // Reset form data when user type changes via route or manual switch
    setFormData((prev) => ({
      ...prev,
      studentId: "",
      gradYear: "",
      branch: "",
      currentTitle: "",
    }));
  }, [location.pathname]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // --- Validation ---
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (userType === "student" && !formData.email.endsWith("@sgsits.ac.in")) {
      toast({
        title: "Invalid email",
        description: "Students must use their official SGSITS institute email address.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (!formData.acceptTerms) {
      toast({
        title: "Terms not accepted",
        description: "Please accept the terms and conditions to continue.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Role-specific required fields validation (enhanced feedback)
    if (userType === "student") {
      if (!formData.branch || !formData.gradYear || !formData.studentId) {
        toast({
          title: "Missing details",
          description: "Branch, expected graduation year, and student ID are required for student registration.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
    } else if (userType === "alumni") {
      if (!formData.gradYear || !formData.currentTitle) {
        toast({
          title: "Missing details",
          description: "Graduation year and current job title are required for alumni registration.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
    }
    // --- End Validation ---


    try {
      // Mock API call to simulate registration based on type
      if (userType === "student") {
        // await apiClient.registerStudent({...});
      } else {
        // await apiClient.registerAlumni({...});
      }

      // Simulate API success delay
      await new Promise(resolve => setTimeout(resolve, 1500)); 

      toast({
        title: "Account created successfully!",
        description: "Please login to continue.",
        variant: "default",
      });

      navigate("/login");
    } catch (error) {
      toast({
        title: "Registration failed",
        description:
          error?.message || "An account with this email may already exist. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Generate Year options
  const graduationYears = (() => {
    const currentYear = new Date().getFullYear();
    if (userType === "student") {
      // Students: current year up to current + 7 years (for 4 years B.Tech + buffer)
      return Array.from({ length: 8 }, (_, i) => currentYear + i);
    }
    // Alumni: 1952 (earliest) up to current year, descending
    return Array.from(
      { length: currentYear - 1952 + 1 },
      (_, i) => currentYear - i
    ).sort((a, b) => b - a); // Ensure descending order
  })();

  const selectedButtonClasses = "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/40 hover:from-blue-700 hover:to-cyan-600 border-transparent";
  const unselectedButtonClasses = "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800";


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <PublicHeader />
      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-lg">
          <Card className="shadow-2xl dark:shadow-blue-900/30 border-2 border-blue-500/20 dark:border-cyan-500/20 bg-white dark:bg-gray-900">
            <CardHeader className="space-y-1 text-center pt-8">
              {/* Prominent, branded icon */}
              <div className="mx-auto mb-4 w-14 h-14 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <UserPlus className="w-7 h-7 text-white" />
              </div>
              <CardTitle className="text-3xl font-extrabold text-gray-900 dark:text-white">
                Create Your Account
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400 text-base">
                Join the SGSITS network as a Student or Alumni.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* User Type Selection (Enhanced with consistent gradient) */}
              <div className="grid grid-cols-2 gap-4 border-b pb-4 border-gray-200 dark:border-gray-800">
                <Button
                  type="button"
                  variant="outline"
                  className={`flex items-center gap-2 h-12 text-base font-semibold transition-all duration-300 ${
                    userType === "student" ? selectedButtonClasses : unselectedButtonClasses
                  }`}
                  onClick={() => setUserType("student")}
                >
                  <GraduationCap className="w-5 h-5" />
                  Student Registration
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className={`flex items-center gap-2 h-12 text-base font-semibold transition-all duration-300 ${
                    userType === "alumni" ? selectedButtonClasses : unselectedButtonClasses
                  }`}
                  onClick={() => setUserType("alumni")}
                >
                  <Building className="w-5 h-5" />
                  Alumni Registration
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Name & Email (Always required) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium dark:text-gray-300">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      className="h-11 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium dark:text-gray-300">
                      Email {userType === "student" && "(Institute Email)"}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={
                        userType === "student"
                          ? "yourname@sgsits.ac.in"
                          : "your.email@example.com"
                      }
                      className="h-11 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                    />
                    {userType === "student" && (
                      <p className="text-xs text-red-500 dark:text-red-400 font-medium">
                        *Required: Must be your official SGSITS email address
                      </p>
                    )}
                  </div>
                </div>

                {/* Role-Specific Fields */}
                <h3 className="text-lg font-semibold border-b pb-1 dark:text-white">
                  {userType === "student" ? "Student Details" : "Alumni Details"}
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Branch (Students) / Title (Alumni) */}
                  {userType === "student" ? (
                    <div className="space-y-2">
                      <Label htmlFor="branch" className="text-sm font-medium dark:text-gray-300">Branch</Label>
                      <Select
                        value={formData.branch}
                        onValueChange={(value) => handleInputChange("branch", value)}
                        required
                      >
                        <SelectTrigger className="h-11 dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                          <SelectValue placeholder="Select your branch" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                          {BRANCHES.map((branch) => (
                            <SelectItem key={branch} value={branch.toLowerCase()} className="hover:bg-gray-700/50">
                              {branch}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="currentTitle" className="text-sm font-medium dark:text-gray-300">Current Title / Role</Label>
                      <Input
                        id="currentTitle"
                        type="text"
                        placeholder="e.g., Senior Engineer at ABC Corp"
                        className="h-11 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        value={formData.currentTitle}
                        onChange={(e) => handleInputChange("currentTitle", e.target.value)}
                        required
                      />
                    </div>
                  )}

                  {/* Graduation Year */}
                  <div className="space-y-2">
                    <Label htmlFor="gradYear" className="text-sm font-medium dark:text-gray-300">
                      {userType === "student" ? "Expected Graduation Year" : "Graduation Year"}
                    </Label>
                    <Select
                      value={formData.gradYear}
                      onValueChange={(value) => handleInputChange("gradYear", value)}
                      required
                    >
                      <SelectTrigger className="h-11 dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-800 dark:border-gray-700 max-h-60 overflow-y-auto">
                        {graduationYears.map((year) => (
                          <SelectItem key={year} value={year.toString()} className="hover:bg-gray-700/50">
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Student ID (only for students) */}
                  {userType === "student" && (
                    <div className="space-y-2">
                      <Label htmlFor="studentId" className="text-sm font-medium dark:text-gray-300">Student ID / Enrollment No.</Label>
                      <Input
                        id="studentId"
                        type="text"
                        placeholder="Enter your student ID"
                        className="h-11 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        value={formData.studentId}
                        onChange={(e) => handleInputChange("studentId", e.target.value)}
                        required
                      />
                    </div>
                  )}

                  {/* Phone (Optional) */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium dark:text-gray-300">Phone Number (Optional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 9876543210"
                      className="h-11 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                    />
                  </div>
                </div>

                {/* Password Fields */}
                <h3 className="text-lg font-semibold border-b pb-1 dark:text-white">
                  Security
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium dark:text-gray-300">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        className="h-11 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
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
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium dark:text-gray-300">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        className="h-11 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 text-gray-500 dark:text-gray-400 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Terms */}
                <div className="flex items-start space-x-2 pt-2">
                  <Checkbox
                    id="acceptTerms"
                    className="mt-1 border-gray-400 dark:border-gray-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
                    checked={formData.acceptTerms}
                    onCheckedChange={(checked) => handleInputChange("acceptTerms", checked)}
                    required
                  />
                  <Label htmlFor="acceptTerms" className="text-sm font-normal text-gray-600 dark:text-gray-400 cursor-pointer leading-relaxed">
                    I agree to the{" "}
                    <Link to="/terms" className="text-blue-600 dark:text-cyan-400 hover:underline font-medium">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link to="/privacy" className="text-blue-600 dark:text-cyan-400 hover:underline font-medium">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>

                {/* Submit Button (Uses the same gradient) */}
                <Button
                  type="submit"
                  
                  variant="outline"
                  disabled={isLoading}
                  // Apply the gradient classes directly here for the main submit button
                  style={{ backgroundColor: 'transparent', borderColor: 'transparent' }} // Override outline defaults
                  className={`w-full h-12 text-lg font-semibold transition-all duration-300 mt-6 ${selectedButtonClasses}`}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>

              {/* Back to Login Link */}
              <div className="text-center text-sm pt-4">
                <span className="text-muted-foreground dark:text-gray-400">
                  Already have an account?{" "}
                </span>
                <Link
                  to="/login"
                  className="text-blue-600 dark:text-cyan-400 hover:underline font-medium"
                >
                  Sign in here
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
};

export default SignUp;