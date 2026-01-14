import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, LogIn, UserPlus, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
// Assuming logo is the actual institute logo
import logo from "@/assets/logo.png"; 

export default function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Define the base button class for mobile menu items
  const mobileMenuItemClasses = "w-full justify-start text-left text-base h-11 transition-colors";
  
  return (
    // Enhanced sticky header with controlled backdrop blur and high z-index
    <header className="border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm sticky top-0 z-[100]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo (Enhanced with Gradient) */}
          <Link to="/" className="flex items-center gap-3 group">
            {/* Logo Container with Branded Gradient */}
            <div className="w-9 h-9 flex items-center justify-center group-hover:shadow-lg">
              <img
                src={logo}
                alt="SGSITS Alumni Portal"
                className="w-7 h-7 object-contain rounded-lg" // Slightly smaller image within the container
              />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white transition-colors">
              SGSITS Alumni Portal
            </span>
          </Link>

          {/* Desktop Navigation & Buttons */}
          <div className="hidden md:flex items-center gap-4">
            
            {/* Sign In (Ghost) */}
            <Button 
              variant="ghost" 
              asChild 
              className="text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-cyan-400"
            >
              <Link to="/login" className="flex items-center gap-2">
                <LogIn className="w-4 h-4" /> Sign In
              </Link>
            </Button>
            
            {/* Contributors (Outline/Secondary) */}
            <Button 
              variant="outline" 
              asChild 
              className="text-base font-medium h-10 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Link to="/contributors" className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" /> Contributors
              </Link>
            </Button>
            
            {/* Get Started (Primary Gradient CTA) */}
            <Button 
              variant="gradient" 
              asChild 
              className="text-base font-semibold h-10 px-6 bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/30 hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300"
            >
              <Link to="/signup" className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" /> Get Started
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-2 focus:ring-blue-500 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu (Smoother Transition) */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950/95 transition-all duration-300 ease-in-out">
          <div className="px-4 py-4 flex flex-col gap-2">
            
            <Button
              variant="ghost"
              asChild
              className={`${mobileMenuItemClasses} text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Link to="/login" className="flex items-center gap-3">
                <LogIn className="w-5 h-5" /> Sign In
              </Link>
            </Button>
            
            <Button
              variant="outline"
              asChild
              className={`${mobileMenuItemClasses} border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Link to="/contributors" className="flex items-center gap-3">
                <Heart className="w-5 h-5 text-red-500" /> Contributors
              </Link>
            </Button>
            
            {/* Primary CTA in Mobile Menu (Consistent Gradient) */}
            <Button
              variant="gradient"
              asChild
              className={`${mobileMenuItemClasses} bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/30 mt-1`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Link to="/signup" className="flex items-center gap-3">
                <UserPlus className="w-5 h-5" /> Get Started
              </Link>
            </Button>

          </div>
        </div>
      )}
    </header>
  );
}