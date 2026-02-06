import { useState } from "react";
import {
  Home,
  Briefcase,
  Users,
  Building2,
  User,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronRight as ChevronRightIcon,
  Menu,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

const hasCompany = true;

const navigation = [
  { name: "Home", href: "/alumni", icon: Home },
  { name: "Applications Overview", href: "/alumni/applications", icon: Users },
  { name: "Edit My Profile", href: "/alumni/profile", icon: User },
  // { name: "Settings", href: "/settings", icon: Settings },
];

function SidebarContent({ collapsed, onLinkClick }) {
  const [companyExpanded, setCompanyExpanded] = useState(false);
  const [postingsExpanded, setPostingsExpanded] = useState(false);

  return (
    <>
      {/* Header */}
      {/* <div className="flex h-16 items-center justify-start px-4 border-b border-sidebar-border">
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Building2 className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="text-sm font-semibold text-sidebar-foreground">
                SGSITS Alumni
              </h2>
              <p className="text-xs text-sidebar-foreground/70">Association</p>
            </div>
          )}
        </div>
      </div> */}

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.href === "/alumni"}
            onClick={onLinkClick}
            className={({ isActive }) =>
              cn(
                "group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-sidebar-accent",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                  : "text-sidebar-foreground hover:text-sidebar-accent-foreground",
              )
            }
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span className="ml-3">{item.name}</span>}
          </NavLink>
        ))}

        {/* Postings Expandable Section */}
        <div>
          <button
            onClick={() => setPostingsExpanded(!postingsExpanded)}
            className={cn(
              "group flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground",
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
                onClick={onLinkClick}
                className={({ isActive }) =>
                  cn(
                    "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-sidebar-accent",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:text-sidebar-accent-foreground",
                  )
                }
              >
                Active Postings
              </NavLink>
              <NavLink
                to="/alumni/expired-postings"
                onClick={onLinkClick}
                className={({ isActive }) =>
                  cn(
                    "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-sidebar-accent",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:text-sidebar-accent-foreground",
                  )
                }
              >
                Expired Postings
              </NavLink>
            </div>
          )}
        </div>

        {/* Company Expandable Section */}
        <div>
          <button
            onClick={() => setCompanyExpanded(!companyExpanded)}
            className={cn(
              "group flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground",
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
                onClick={onLinkClick}
                className={({ isActive }) =>
                  cn(
                    "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-sidebar-accent",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:text-sidebar-accent-foreground",
                  )
                }
              >
                Add New Company
              </NavLink>
              <NavLink
                to="/alumni/companies"
                onClick={onLinkClick}
                className={({ isActive }) =>
                  cn(
                    "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-sidebar-accent",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:text-sidebar-accent-foreground",
                  )
                }
              >
                My Companies
              </NavLink>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}

export function AlumniSidebar({ className }) {
  const [collapsed, setCollapsed] = useState(false);
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  const handleLinkClick = () => {
    if (isMobile) {
      setIsOpen(false); // Close the sheet on link click for mobile
    }
  };

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="text-sidebar-foreground hover:bg-sidebar-accent absolute top-4 left-4 z-50"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 bg-sidebar-background p-0">
          <div className="h-full flex flex-col">
            <div className="absolute inset-0 gradient-sidebar" />
            <div className="relative flex h-full flex-col">
              <SidebarContent collapsed={false} onLinkClick={handleLinkClick} />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      className={cn(
        "relative flex h-screen flex-col transition-all duration-300 gradient-sidebar text-sidebar-foreground",
        collapsed ? "w-16" : "w-64",
        className,
      )}
    >
      <div className="relative flex h-full flex-col z-10">
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
        <SidebarContent collapsed={collapsed} onLinkClick={handleLinkClick} />
      </div>
    </div>
  );
}
