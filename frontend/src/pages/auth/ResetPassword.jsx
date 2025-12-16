import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, ArrowLeft, Mail, Eye, EyeOff, CheckCircle, Send } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { apiClient } from "@/lib/api";

const isStrongPassword = (pwd) => {
  if (typeof pwd !== "string") return false;
  const hasMinLength = pwd.length >= 8;
  const hasUpper = /[A-Z]/.test(pwd);
  const hasLower = /[a-z]/.test(pwd);
  const hasNumber = /\d/.test(pwd);
  const hasSpecial = /[^A-Za-z0-9]/.test(pwd);
  return hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial;
};

const ResetPassword = () => {
  const [step, setStep] = useState(1); // 1: email, 2: OTP & new password, 3: success
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Step 1: Send OTP to email
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Mock API call: await apiClient.forgotPassword(email);
      // Simulating success
      setTimeout(() => {
        toast({
          title: "OTP Sent!",
          description: "Check your email for the verification code.",
        });
        setStep(2);
        setIsLoading(false);
      }, 1500);
      
    } catch (error) {
      toast({
        title: "Could not send OTP",
        description: error.message || "Please check your email address and try again.",
        variant: "default",
        className: "bg-blue-600 text-white dark:bg-cyan-600",
      });
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP and reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are the same.",
        variant: "default",
        className: "bg-blue-600 text-white dark:bg-cyan-600",
      });
      return;
    }

    if (!isStrongPassword(newPassword)) {
      toast({
        title: "Create a stronger password",
        description:
          "Use 8+ characters with uppercase, lowercase, a number, and a symbol.",
        variant: "default",
        className: "bg-blue-600 text-white dark:bg-cyan-600",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Mock API call: await apiClient.resetPassword(email, otp, newPassword);
      // Simulating success
      setTimeout(() => {
        toast({
          title: "Password Reset Successful!",
          description: "You can now login with your new password.",
        });
        setStep(3);
        setIsLoading(false);
      }, 1500);

    } catch (error) {
      toast({
        title: "OTP verification failed",
        description: error.message || "The code seems incorrect or expired. Please resend and try again.",
        variant: "default",
        className: "bg-blue-600 text-white dark:bg-cyan-600",
      });
    } finally {
      // setIsLoading(false); // Done in setTimeout mock
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setIsLoading(true);
    try {
      // Mock API call: await apiClient.forgotPassword(email);
      // Simulating success
      setTimeout(() => {
        toast({
          title: "OTP Resent!",
          description: "A new verification code has been sent to your email.",
        });
        setIsLoading(false);
      }, 1000);

    } catch (error) {
      toast({
        title: "Could not resend OTP",
        description: error.message || "Please check your email address and try again.",
        variant: "default",
        className: "bg-blue-600 text-white dark:bg-cyan-600",
      });
    } finally {
      // setIsLoading(false); // Done in setTimeout mock
    }
  };

  // --- Step 3: Success screen (Enhanced) ---
  if (step === 3) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
        <div className="w-full max-w-sm sm:max-w-md">
          <Card className="shadow-2xl dark:shadow-blue-900/30 border-2 border-green-500/30 bg-white dark:bg-gray-900">
            <CardHeader className="space-y-1 text-center pt-8">
              {/* Green Success Icon */}
              <div className="mx-auto mb-4 w-14 h-14 bg-green-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center shadow-lg">
                <CheckCircle className="w-7 h-7 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-3xl font-extrabold text-gray-900 dark:text-white">
                Password Updated
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400 text-base">
                Your password has been successfully updated. You can now sign in with your new credentials.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pt-6">
              <Button 
                className="w-full h-11 text-base bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/40 hover:from-blue-700 hover:to-cyan-600 transition-all duration-300" 
                onClick={() => navigate("/login")}
              >
                Sign In to Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // --- Step 2: Enter OTP and new password (Enhanced) ---
  if (step === 2) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
        <div className="w-full max-w-sm sm:max-w-md">
          <Card className="shadow-2xl dark:shadow-blue-900/30 border-2 border-blue-500/20 dark:border-cyan-500/20 bg-white dark:bg-gray-900">
            <CardHeader className="space-y-1 text-center pt-8">
              {/* Branded Mail Icon */}
              <div className="mx-auto mb-4 w-14 h-14 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <Mail className="w-7 h-7 text-white" />
              </div>
              <CardTitle className="text-3xl font-extrabold text-gray-900 dark:text-white">
                Verification Required
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400 text-base">
                Enter the 6-digit code sent to **{email}** and set your new password.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleResetPassword} className="space-y-6">
                {/* OTP */}
                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-sm font-medium dark:text-gray-300">Verification Code (OTP)</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    className="h-11 dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    required
                  />
                </div>

                {/* New Password */}
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-sm font-medium dark:text-gray-300">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password (8+ chars with upper/lower/number/symbol)"
                      className="h-11 dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 text-gray-500 dark:text-gray-400 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Must be 8+ chars with uppercase, lowercase, number, and special symbol.
                  </p>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium dark:text-gray-300">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      className="h-11 dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 text-gray-500 dark:text-gray-400 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-11 text-base bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/40 hover:from-blue-700 hover:to-cyan-600 transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? "Resetting..." : "Reset Password"}
                </Button>
              </form>

              {/* Resend OTP */}
              <div className="text-center pt-2">
                <Button
                  variant="link"
                  className="text-sm text-blue-600 dark:text-cyan-400 p-0 h-auto"
                  onClick={handleResendOTP}
                  disabled={isLoading}
                >
                  {isLoading ? "Resending..." : "Didn't receive the code? Resend OTP"}
                </Button>
              </div>

              {/* Back */}
              <Button
                variant="outline"
                className="w-full h-11 text-base border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setStep(1)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Change Email Address
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // --- Step 1: Enter email (Enhanced) ---
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm sm:max-w-md">
        <Card className="shadow-2xl dark:shadow-blue-900/30 border-2 border-blue-500/20 dark:border-cyan-500/20 bg-white dark:bg-gray-900">
          <CardHeader className="space-y-1 text-center pt-8">
            {/* Branded Icon */}
            <div className="mx-auto mb-4 w-14 h-14 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <CardTitle className="text-3xl font-extrabold text-gray-900 dark:text-white">
              Reset Password
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400 text-base">
              Enter your registered email address to receive a verification code.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSendOTP} className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium dark:text-gray-300">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your registered email address"
                  className="h-11 dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground dark:text-gray-500">
                  Must be the email associated with your SGSITS account.
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-11 text-base bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/40 hover:from-blue-700 hover:to-cyan-600 transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? (
                  "Sending Code..."
                ) : (
                  <>
                    Send Verification Code
                    <Send className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>

            {/* Back to Login */}
            <Button 
              variant="outline" 
              className="w-full h-11 text-base border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              asChild
            >
              <Link to="/login">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Sign In
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
