import { Link } from 'react-router-dom';
import logo from "@/assets/logo.png";

export default function Footer() {
  return (
    <>
{/* ✅ Footer */}
      <footer className="bg-background border-t py-8 bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <img
                  src={logo}
                  alt="SGSITS Alumni Portal"
                  className="w-full h-full object-contain rounded-lg"
                />
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
      </>
        );
}