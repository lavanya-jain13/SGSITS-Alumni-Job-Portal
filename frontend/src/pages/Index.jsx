import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Network, Briefcase, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// ✅ Import the enhanced, consistent Header and Footer components
import PublicHeader from "@/components/PublicHeader"; 
import PublicFooter from "@/components/PublicFooter"; 
// Note: You must ensure the PublicHeader and PublicFooter files 
// contain the code blocks we finalized in the previous steps.

const Index = () => {
  // Mobile menu state is no longer needed here as it's managed inside PublicHeader
  // const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // Removed

  // --- Feature Data ---
  const features = [
    {
      icon: Network,
      title: "Global Alumni Network",
      description: "Instantly connect with over 10,000 SGSITS alumni worldwide for mentorship and collaboration.",
    },
    {
      icon: Briefcase,
      title: "Exclusive Job Board",
      description: "Access curated job and internship opportunities shared directly by alumni companies and recruiters.",
    },
    {
      icon: Calendar,
      title: "Event & Seminar Hub",
      description: "Stay informed about college reunions, workshops, and exclusive alumni professional development seminars.",
    },
    {
      icon: Users,
      title: "Mentorship Program",
      description: "Get personalized career guidance from experienced alumni in your desired industry or field.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      
      {/* 1. ✅ Replaced inline header with the consistent PublicHeader component */}
      <PublicHeader />

      <main className="flex-grow">
        
        {/* ✅ Hero Section - More dramatic and inviting */}
        <section
          className="py-16 md:py-24 bg-cover bg-center relative overflow-hidden"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1950&q=80')",
          }}
        >
          {/* Semi-transparent Overlay */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold mb-6 text-white leading-tight">
                Bridge Your Career with the <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-300">SGSITS Alumni</span> Network
              </h1>

              <p className="text-xl md:text-2xl text-gray-200 mb-10 max-w-2xl mx-auto">
                Connect with esteemed alumni, discover exclusive job opportunities, and
                accelerate your journey with the power of our professional community.
              </p>

              {/* Button Group - Prominent and action-oriented */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="xl" 
                  className="text-lg py-4 px-8 bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-2xl shadow-blue-500/40 hover:from-blue-700 hover:to-cyan-600 transition-all duration-300"
                  asChild
                >
                  <Link to="/signup/student">
                    Join as Student
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>

                <Button
                  variant="secondary"
                  size="xl"
                  className="text-lg py-4 px-8 bg-white text-blue-600 hover:bg-gray-100 shadow-lg dark:bg-gray-800 dark:text-cyan-400 dark:hover:bg-gray-700 transition-all duration-300"
                  asChild
                >
                  <Link to="/signup/alumni">Join as Alumni</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ✅ Features Section - Value Proposition */}
        <section className="py-16 md:py-20 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-900 dark:text-white">
              Your Next <span className="text-blue-600 dark:text-cyan-400">Career Step</span> Starts Here
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-16 max-w-3xl mx-auto">
              We provide the essential tools and connections to bridge the gap between academic life and professional success.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="transform hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-t-4 border-blue-500 dark:border-cyan-400">
                  <CardHeader className="flex flex-col items-center space-y-3">
                    <div className="p-4 bg-blue-100 dark:bg-blue-900/50 rounded-full text-blue-600 dark:text-cyan-400">
                      <feature.icon className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-xl font-bold pt-2">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 dark:text-gray-400 text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* --- Visual separation --- */}
        <div className="max-w-7xl mx-auto"><hr className="border-gray-200 dark:border-gray-800" /></div>


        {/* ✅ CTA Section - Elegant and Focused */}
        <section className="py-16 md:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Card with subtle background and strong shadow */}
            <Card className="shadow-2xl dark:shadow-blue-900/30 bg-white dark:bg-gray-900 border-2 border-blue-500/20 dark:border-cyan-500/20">
              <CardHeader className="pb-8">
                <CardTitle className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-900 dark:text-white">
                  Ready to Start Your Journey?
                </CardTitle>
                <CardDescription className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  Join thousands of SGSITS students and alumni who are already
                  building successful careers through our trusted platform.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="xl"
                    className="text-lg py-6 px-8 bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300"
                    asChild
                  >
                    <Link to="/signup">
                      Create Your Account
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="xl"
                    className="text-lg py-6 px-8 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    asChild
                  >
                    <Link to="/login">Sign In</Link>
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground dark:text-gray-500">
                  Free to join • Exclusive to the SGSITS community • Secure and private
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* 2. ✅ Replaced inline footer with the consistent PublicFooter component */}
      <PublicFooter />
    </div>
  );
};

export default Index;