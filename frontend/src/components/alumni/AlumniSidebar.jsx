// import { useState } from "react";
// import { 
//   Home, 
//   Briefcase, 
//   Users, 
//   Building2, 
//   Settings, 
//   User,
//   PlusCircle,
//   ChevronLeft,
//   ChevronRight
// } from "lucide-react";
// import { NavLink } from "react-router-dom";
// import { cn } from "@/lib/utils";
// import { Button } from "@/components/ui/button";

// // Mock state for company existence
// const hasCompany = true;

// const navigation = [
//   { name: "Home", href: "/alumni", icon: Home },
//   { name: "Postings", href: "/alumni/postings", icon: Briefcase },
//   { name: "Edit My Profile", href: "/alumni/profile", icon: User },
//   { 
//     name: hasCompany ? "Company Profile" : "Add Company", 
//     href: hasCompany ? "/alumni/company-profile" : "/alumni/add-company", 
//     icon: Building2 
//   },
//   { name: "Applications Overview", href: "/alumni/applications", icon: Users },
// ];

// const quickActions = [
//   { name: "New message from applicant", href: "/alumni/messages", icon: PlusCircle },
// ];

// export function AlumniSidebar({ className }) {
//   const [collapsed, setCollapsed] = useState(false);

//   return (
//     <div 
//       className={cn(
//         // ✅ Changed background from bg-sidebar-background → gradient-sidebar
//         "relative flex h-screen flex-col transition-all duration-300 gradient-sidebar text-sidebar-foreground",
//         collapsed ? "w-16" : "w-64",
//         className
//       )}
//     >
//       <div className="relative flex h-full flex-col z-10">
//         {/* Header */}
//         <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
//           {!collapsed && (
//             <div className="flex items-center space-x-2">
//               <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
//                 <Building2 className="h-5 w-5 text-primary-foreground" />
//               </div>
//               <div>
//                 <h2 className="text-sm font-semibold text-sidebar-foreground">
//                   SGSITS Alumni
//                 </h2>
//                 <p className="text-xs text-sidebar-foreground/70">Association</p>
//               </div>
//             </div>
//           )}

//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={() => setCollapsed(!collapsed)}
//             className="text-sidebar-foreground hover:bg-sidebar-hover"
//           >
//             {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
//           </Button>
//         </div>

//         {/* Navigation */}
//         <nav className="flex-1 space-y-1 p-3">
//           {navigation.map((item) => (
//             <NavLink
//               key={item.name}
//               to={item.href}
//               end={item.href === "/alumni"}
//               className={({ isActive }) =>
//                 cn(
//                   // ✅ Updated hover background to hover:bg-sidebar-hover
//                   "group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-sidebar-hover",
//                   isActive
//                     ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
//                     : "text-sidebar-foreground hover:text-sidebar-accent-foreground"
//                 )
//               }
//             >
//               <item.icon className="h-5 w-5 flex-shrink-0" />
//               {!collapsed && <span className="ml-3">{item.name}</span>}
//             </NavLink>
//           ))}

//           {/* Quick Actions */}
//           {!collapsed && (
//             <div className="pt-6">
//               <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60">
//                 NOTIFICATIONS
//               </h3>
//               {quickActions.map((item) => (
//                 <NavLink
//                   key={item.name}
//                   to={item.href}
//                   className="group flex items-center rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground transition-all hover:bg-sidebar-hover hover:text-sidebar-accent-foreground"
//                 >
//                   <item.icon className="h-5 w-5 flex-shrink-0" />
//                   <span className="ml-3">{item.name}</span>
//                 </NavLink>
//               ))}
//             </div>
//           )}
//         </nav>

//         {/* Settings */}
//         <div className="border-t border-sidebar-border p-3">
//           <NavLink
//             to="/settings"
//             className="group flex items-center rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground transition-all hover:bg-sidebar-hover hover:text-sidebar-accent-foreground"
//           >
//             <Settings className="h-5 w-5 flex-shrink-0" />
//             {!collapsed && <span className="ml-3">Settings</span>}
//           </NavLink>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useState } from "react";
import { 
  Home, 
  Briefcase, 
  Users, 
  Building2, 
  BarChart3, 
  Settings, 
  User,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronRight as ChevronRightIcon
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Mock state for company existence - in real app this would come from context/state
const hasCompany = true; // Change to false to see "Add Company" state

const navigation = [
  { name: "Home", href: "/alumni", icon: Home },
  { name: "Postings", href: "/alumni/postings", icon: Briefcase },
  { name: "Applications Overview", href: "/alumni/applications", icon: Users },
];

export function AlumniSidebar({ className }) {
  const [collapsed, setCollapsed] = useState(false);
  const [companyExpanded, setCompanyExpanded] = useState(false);
  const [postingsExpanded, setPostingsExpanded] = useState(false);

  return (
    <div 
      className={cn(
        "relative flex h-screen flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      {/* Sidebar Background */}
      <div className="absolute inset-0 gradient-sidebar" />
      
      {/* Content */}
      <div className="relative flex h-full flex-col">
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Building2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-sidebar-foreground">
                  SGSITS Alumni
                </h2>
                <p className="text-xs text-sidebar-foreground/70">Association</p>
              </div>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3">
          <div className="space-y-1">
            <NavLink
              to="/alumni"
              end
              className={({ isActive }) =>
                cn(
                  "group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-sidebar-accent",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                    : "text-sidebar-foreground hover:text-sidebar-accent-foreground"
                )
              }
            >
              <Home className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span className="ml-3">Home</span>}
            </NavLink>
            
            {/* Postings Expandable Section */}
            <div>
              <button
                onClick={() => setPostingsExpanded(!postingsExpanded)}
                className={cn(
                  "group flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground"
                )}
              >
                <Briefcase className="h-5 w-5 flex-shrink-0" />
                {!collapsed && (
                  <>
                    <span className="ml-3 flex-1 text-left">Postings</span>
                    {postingsExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRightIcon className="h-4 w-4" />
                    )}
                  </>
                )}
              </button>
              
              {!collapsed && postingsExpanded && (
                <div className="ml-8 mt-1 space-y-1">
                  <NavLink
                    to="/alumni/postings"
                    className={({ isActive }) =>
                      cn(
                        "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-sidebar-accent",
                        isActive
                          ? "bg-sidebar-primary text-sidebar-primary-foreground"
                          : "text-sidebar-foreground hover:text-sidebar-accent-foreground"
                      )
                    }
                  >
                    Active Postings
                  </NavLink>
                  <NavLink
                    to="/alumni/expired-postings"
                    className={({ isActive }) =>
                      cn(
                        "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-sidebar-accent",
                        isActive
                          ? "bg-sidebar-primary text-sidebar-primary-foreground"
                          : "text-sidebar-foreground hover:text-sidebar-accent-foreground"
                      )
                    }
                  >
                    Expired Postings
                  </NavLink>
                </div>
              )}
            </div>
            
            <NavLink
              to="/alumni/applications"
              className={({ isActive }) =>
                cn(
                  "group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-sidebar-accent",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                    : "text-sidebar-foreground hover:text-sidebar-accent-foreground"
                )
              }
            >
              <Users className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span className="ml-3">Applications Overview</span>}
            </NavLink>
            
            {/* Company Expandable Section */}
            <div>
              <button
                onClick={() => setCompanyExpanded(!companyExpanded)}
                className={cn(
                  "group flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground"
                )}
              >
                <Building2 className="h-5 w-5 flex-shrink-0" />
                {!collapsed && (
                  <>
                    <span className="ml-3 flex-1 text-left">Company</span>
                    {companyExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRightIcon className="h-4 w-4" />
                    )}
                  </>
                )}
              </button>
              
              {!collapsed && companyExpanded && (
                <div className="ml-8 mt-1 space-y-1">
                  <NavLink
                    to="/alumni/add-company"
                    className={({ isActive }) =>
                      cn(
                        "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-sidebar-accent",
                        isActive
                          ? "bg-sidebar-primary text-sidebar-primary-foreground"
                          : "text-sidebar-foreground hover:text-sidebar-accent-foreground"
                      )
                    }
                  >
                    Add New Company
                  </NavLink>
                  <NavLink
                    to="/alumni/companies"
                    className={({ isActive }) =>
                      cn(
                        "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-sidebar-accent",
                        isActive
                          ? "bg-sidebar-primary text-sidebar-primary-foreground"
                          : "text-sidebar-foreground hover:text-sidebar-accent-foreground"
                      )
                    }
                  >
                    My Companies
                  </NavLink>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Settings */}
        {/* <div className="border-t border-sidebar-border p-3">
          <NavLink
            to="/settings"
            className="group flex items-center rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <Settings className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span className="ml-3">Settings</span>}
          </NavLink>
        </div> */}
      </div>
    </div>
  );
}
