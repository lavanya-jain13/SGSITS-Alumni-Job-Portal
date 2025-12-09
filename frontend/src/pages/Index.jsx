import { useState } from "react";
import { Link } from "react-router-dom";
import {
  GraduationCap,
  ArrowRight,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Index = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* ✅ Responsive Header */}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg sm:text-xl font-bold">
                SGSITS Alumni Portal
              </span>
            </div>

            {/* Desktop Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
              <Button variant="gradient" asChild>
                <Link to="/signup">Get Started</Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-md hover:bg-accent/10 focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-foreground" />
              ) : (
                <Menu className="h-6 w-6 text-foreground" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-sm">
            <div className="px-4 py-3 flex flex-col gap-2">
              <Button
                variant="ghost"
                asChild
                className="w-full justify-start text-left"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Link to="/login">Sign In</Link>
              </Button>
              <Button
                variant="gradient"
                asChild
                className="w-full justify-start text-left"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Link to="/signup">Get Started</Link>
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* ✅ Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Bridge Your Career with
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                {" "}
                SGSITS Alumni
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Connect with alumni, discover exclusive job opportunities, and
              accelerate your career with the power of our network.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {/* 🎓 Updated Only These Two Links */}
              <Button variant="gradient" size="lg" asChild>
                <Link to="/signup/student">
                  Join as Student
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/signup/alumni">Join as Alumni</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ✅ CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Card className="shadow-elegant">
            <CardHeader className="pb-8">
              <CardTitle className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Start Your Journey?
              </CardTitle>
              <CardDescription className="text-lg">
                Join thousands of SGSITS students and alumni who are already
                building their careers through our platform.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="gradient" size="lg" asChild>
                  <Link to="/signup/student">
                    Create Account
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Free to join • Exclusive to SGSITS community • Secure and private
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ✅ Footer */}
      <footer className="bg-background border-t py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold">
                SGSITS Alumni Portal
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2025 SGSITS Alumni Association. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
