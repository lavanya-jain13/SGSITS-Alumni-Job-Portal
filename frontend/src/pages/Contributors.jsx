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
import AbhishekSinghChouhan from "@/assets/contributors/Abhishek Singh Chouhan.jpg";
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
  {
    name: "Abhishek Singh",
    role: "Developer",
    image: AbhishekSinghChouhan,
  },
  {
    name: "Lavanya Jain",
    role: "Developer",
    image: LavanyaJain,
  },

  {
    name: "Mohammed Lakhrawala",
    role: "Developer",
    image: MohammedLakhrawala,
  },
  {
    name: "Aryan Agrawal",
    role: "Developer",
    image: AryanAgrawal,
  },
  {
    name: "Harshita Pandey",
    role: "Developer",
    image: HarshitaPandey,
    initials: "HP",
  },
  {
    name: "Akshat Jain",
    role: "Developer",
    image: AkshatJain,
  },
  {
    name: "Durva Jain",
    role: "Developer",
    image: DurvaJain,
  },
  {
    name: "Atharva Chopra",
    role: "Developer",
    image: AtharavChopda,
  },
  {
    name: "Shaurya Mishra",
    role: "Developer",
    initials: "SM",
  },
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
              className={`w-full h-full object-cover ${
                person.imageClassName || ""
              }`}
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
      <div className="flex-1 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-4">
            <p className="text-sm font-semibold tracking-wide text-primary uppercase">
              Team
            </p>
            <h1 className="text-4xl md:text-5xl font-bold">
              Project Contributors
            </h1>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              A quick look at the people who led and built this project.
            </p>
          </div>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-center">Head</h2>
            <div className="flex justify-center">
              <div className="max-w-sm w-full">
                <ContributorCard person={head} />
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-center">Developers</h2>
              <p className="text-muted-foreground text-center">
                The builders who brought the platform to life.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {developers.map((dev) => (
                <ContributorCard key={dev.name} person={dev} />
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-center">
              Project Manager
            </h2>
            <div className="flex justify-center">
              <div className="max-w-sm w-full">
                <ContributorCard person={manager} />
              </div>
            </div>
          </section>
        </div>
      </div>
      
      <PublicFooter />
    </div>
  );
};

export default Contributors;