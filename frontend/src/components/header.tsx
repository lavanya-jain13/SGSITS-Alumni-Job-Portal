import { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from "@/assets/logo.png";
import { Button } from './ui/button';
import { Menu, X } from 'lucide-react';

export default function Header() {
const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    return(
        <>
{/* ✅ Responsive Header */}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <img
                  src={logo}
                  alt="SGSITS Alumni Portal"
                  className="w-full h-full object-contain rounded-lg"
                />
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
              <Button variant="outline" asChild>
                <Link to="/contributors">Contributors</Link>
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
                variant="outline"
                asChild
                className="w-full justify-start text-left"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Link to="/contributors">Contributors</Link>
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
      </>
        );
}