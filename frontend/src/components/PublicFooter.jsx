import { Link } from "react-router-dom";
import { Facebook, Twitter, Linkedin, Instagram, Mail, Phone } from "lucide-react";
import logo from "@/assets/logo.png"; // Assuming this path is correct

export default function PublicFooter() {
  // Common class for link styling with enhanced hover effect
  const linkClass = "text-base text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors hover:underline-offset-4 hover:underline";
  
  return (
    // Base footer container with subtle background and strong top border accent
    <footer className="bg-gray-50 dark:bg-gray-950 py-12 sm:py-16 relative">
      
      {/* Subtle Gradient Accent Border */}
      <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-blue-600 to-cyan-500"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* --- Main Grid Layout --- */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-y-10 gap-x-8 lg:gap-x-16">
          
          {/* Column 1: Branding & Description (Spans 2 columns on small screens) */}
          <div className="col-span-2 space-y-4 md:space-y-6">
            <Link to="/" className="flex items-center gap-3 group">
              {/* Logo Container with Branded Gradient */}
              <div className="w-11 h-11 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg transition-all group-hover:rotate-6">
                <img
                  src={logo}
                  alt="SGSITS Alumni Portal"
                  className="w-9 h-9 object-contain rounded-lg"
                />
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                SGSITS Alumni Portal
              </span>
            </Link>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm leading-relaxed">
              Connecting students, alumni, and the institution for mutual growth, mentorship, and lifelong success.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-5">
            <h3 className="text-lg font-extrabold text-gray-900 dark:text-white mb-3 tracking-wide">
              Explore
            </h3>
            <ul className="space-y-3">
              <li><Link to="/about" className={linkClass}>About Us</Link></li>
              <li><Link to="/directory" className={linkClass}>Alumni Directory</Link></li>
              <li><Link to="/events" className={linkClass}>Events & Reunions</Link></li>
              <li><Link to="/jobs" className={linkClass}>Job Board</Link></li>
            </ul>
          </div>

          {/* Column 3: Legal & Help */}
          <div className="space-y-5">
            <h3 className="text-lg font-extrabold text-gray-900 dark:text-white mb-3 tracking-wide">
              Resources
            </h3>
            <ul className="space-y-3">
              <li><Link to="/help" className={linkClass}>Help Center</Link></li>
              <li><Link to="/privacy" className={linkClass}>Privacy Policy</Link></li>
              <li><Link to="/terms" className={linkClass}>Terms of Service</Link></li>
              <li><Link to="/contact" className={linkClass}>Contact Us</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact & Social */}
          <div className="space-y-5">
            <h3 className="text-lg font-extrabold text-gray-900 dark:text-white mb-3 tracking-wide">
              Get In Touch
            </h3>
            <div className="space-y-3">
              {/* Mail */}
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
                <a href="mailto:alumni@sgsits.ac.in" className={linkClass.replace("text-sm", "text-base")}>
                  alumni@sgsits.ac.in
                </a>
              </div>
              {/* Phone */}
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
                <span className="text-base text-gray-600 dark:text-gray-400">
                  +91-731-2582000
                </span>
              </div>
            </div>
            
            {/* Social Icons - More prominent and colorful */}
            <div className="flex space-x-4 pt-3">
              <a href="#" aria-label="LinkedIn" className="p-2 rounded-full bg-white dark:bg-gray-800 text-gray-500 hover:text-blue-700 dark:hover:text-cyan-400 transition-colors shadow-md hover:shadow-lg">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" aria-label="Facebook" className="p-2 rounded-full bg-white dark:bg-gray-800 text-gray-500 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors shadow-md hover:shadow-lg">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" aria-label="Twitter" className="p-2 rounded-full bg-white dark:bg-gray-800 text-gray-500 hover:text-sky-500 dark:hover:text-cyan-400 transition-colors shadow-md hover:shadow-lg">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" aria-label="Instagram" className="p-2 rounded-full bg-white dark:bg-gray-800 text-gray-500 hover:text-pink-600 dark:hover:text-cyan-400 transition-colors shadow-md hover:shadow-lg">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* --- Copyright & Bottom Line --- */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="text-center text-sm text-gray-500 dark:text-gray-600">
            &copy; {new Date().getFullYear()} SGSITS Alumni Association. All rights reserved. Designed and developed by the Contributors Team.
          </div>
        </div>
        
      </div>
    </footer>
  );
}