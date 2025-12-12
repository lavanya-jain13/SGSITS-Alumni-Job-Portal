import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import NeeleshJain from "@/assets/contributors/Neelesh Jain.jpg";
import PrinceKumar from "@/assets/contributors/Prince Kumar.jpg";
import AkshatJain from "@/assets/contributors/Akshat Jain.jpg";
import AryanAgrawal from "@/assets/contributors/Aryan Agrawal.jpg";
import DurvaJain from "@/assets/contributors/Durva Jain.jpg";
import LavanyaJain from "@/assets/contributors/Lavanya Jain.jpg";
import MohammedLakhrawala from "@/assets/contributors/Mohammed Lakhrawala.jpg";
import AbhishekSinghChauhan from "@/assets/contributors/Abhishek Singh Chauhan.jpg";
import AtharavChopda from "@/assets/contributors/Atharav Chopda.jpg";
import HarshitaPandey from "@/assets/contributors/Harshita Pandey.jpg";
import { Trophy, Users, Briefcase } from "lucide-react";


// --- Data Definitions (Kept the same) ---
const head = {
  name: "Neelesh Jain",
  role: "Mentor",
  image: NeeleshJain,
  imageClassName: "object-cover object-top", 
};

const manager = {
  name: "Prince Kumar",
  role: "Project Manager",
  image: PrinceKumar,
};

const developers = [
  { name: "Mohammed Lakhrawala", role: "Developer", image: MohammedLakhrawala, },
  { name: "Harshita Pandey", role: "Developer", image: HarshitaPandey, initials: "HP", },
  { name: "Akshat Jain", role: "Developer", image: AkshatJain, },
  { name: "Aryan Agrawal", role: "Developer", image: AryanAgrawal, },
  { name: "Lavanya Jain", role: "Developer", image: LavanyaJain, },
  { name: "Abhishek Singh Chauhan", role: "Developer", image: AbhishekSinghChauhan, },
  { name: "Durva Jain", role: "Developer", image: DurvaJain, },
  { name: "Atharav Chopda", role: "Developer", image: AtharavChopda, },
  { name: "Shaurya Mishra", role: "Developer", initials: "SM", },
];


// --- Enhanced Contributor Card Component ---
const ContributorCard = ({ person, isHead = false, isManager = false }) => {
  let roleColor = "text-gray-500 dark:text-gray-400";
  let roleIcon = <Briefcase className="w-4 h-4 mr-1 text-gray-400 dark:text-gray-500" />;
  let cardBorderClass = "border-gray-200 dark:border-gray-800"; // Default border

  if (isHead) {
    roleColor = "text-red-600 dark:text-red-400 font-bold";
    roleIcon = <Trophy className="w-4 h-4 mr-1 text-yellow-500 fill-yellow-500" />;
    cardBorderClass = "border-red-500/80"; // Stronger highlight for Head
  } else if (isManager) {
    roleColor = "text-blue-600 dark:text-cyan-400 font-semibold";
    roleIcon = <Users className="w-4 h-4 mr-1 text-blue-500 dark:text-cyan-400" />;
    cardBorderClass = "border-blue-500/80"; // Stronger highlight for Manager
  }

  const gradientClasses = "bg-gradient-to-r from-blue-600 to-cyan-500";
  
  return (
    // Card with subtle color effects and hover
    <Card className={`h-full border-t-4 shadow-lg dark:shadow-blue-900/20 bg-white dark:bg-gray-900 
                    transform hover:scale-[1.03] transition-all duration-300 hover:shadow-2xl group ${cardBorderClass} 
                    ${isHead ? 'hover:border-red-500' : isManager ? 'hover:border-blue-500' : 'hover:border-blue-500/50'}`}>
      <CardContent className="pt-8 flex flex-col items-center text-center gap-4">
        
        {/* Profile Image Container */}
        <div className={`w-28 h-28 rounded-full overflow-hidden flex items-center justify-center border-4 border-white dark:border-gray-900 shadow-xl 
                        ${person.image ? 'p-0' : gradientClasses}`}>
          {person.image ? (
            <img
              src={person.image}
              alt={person.name}
              className={`w-full h-full object-cover ${person.imageClassName || ""}`}
            />
          ) : (
            // Custom Placeholder with gradient background and white text
            <span className="text-2xl font-bold text-white">
              {person.initials || person.name.charAt(0)}
            </span>
          )}
        </div>
        
        {/* Name and Role */}
        <div className="space-y-1">
          <h3 className="text-xl font-bold leading-snug text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
            {person.name}
          </h3>
          <p className={`text-sm flex items-center justify-center ${roleColor}`}>
            {roleIcon}
            {person.role}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};


// --- Main Contributors Page Component ---
const Contributors = () => {
  return (
    // ✅ Apply a very light blue/cyan gradient background to add color
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 to-cyan-50/50 dark:from-gray-950 dark:to-gray-900 flex flex-col">
      <PublicHeader />
      
      <div className="flex-1 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          {/* Section Title */}
          <div className="text-center space-y-4">
            <p className="text-base font-extrabold tracking-widest text-blue-600 dark:text-cyan-400 uppercase">
              The Driving Force
            </p>
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white">
              Project <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Contributors</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto">
              We extend our sincere gratitude to the dedicated team of mentors and developers who brought the SGSITS Alumni Portal to life.
            </p>
          </div>

          {/* 1. Head/Mentor Section (Prominent) */}
          <section className="space-y-8">
            <h2 className="text-3xl font-bold text-center pb-2 text-gray-800 dark:text-gray-200">
                <span className="pb-1 border-b-2 border-blue-500/50 dark:border-cyan-500/50">Project Mentor</span>
            </h2>
            <div className="flex justify-center">
              <div className="w-full max-w-sm">
                <ContributorCard person={head} isHead={true} />
              </div>
            </div>
          </section>

          {/* 2. Project Manager Section */}
          <section className="space-y-8">
            <h2 className="text-3xl font-bold text-center pb-2 text-gray-800 dark:text-gray-200">
                <span className="pb-1 border-b-2 border-blue-500/50 dark:border-cyan-500/50">Project Manager</span>
            </h2>
            <div className="flex justify-center">
              <div className="w-full max-w-sm">
                <ContributorCard person={manager} isManager={true} />
              </div>
            </div>
          </section>

          {/* 3. Developers Section */}
          <section className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-center pb-2 text-gray-800 dark:text-gray-200">
                <span className="pb-1 border-b-2 border-blue-500/50 dark:border-cyan-500/50">Development Team</span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 text-center">
                The talented developers responsible for coding and platform execution.
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {developers.map((dev) => (
                <ContributorCard key={dev.name} person={dev} />
              ))}
            </div>
          </section>
        </div>
      </div>
      
      <PublicFooter />
    </div>
  );
};

export default Contributors;