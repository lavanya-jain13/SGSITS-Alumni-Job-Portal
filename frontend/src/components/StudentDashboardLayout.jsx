import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectAuth, logout } from "@/store/authSlice";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Lightbulb, User, LogOut, Eye, Briefcase, Clock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Complete Profile", href: "/student/profile", icon: User },
  { name: "View Jobs", href: "/student/jobs", icon: Briefcase },
  { name: "Recent Applications", href: "/student/applications", icon: Clock },
];

function StudentSidebarNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(selectAuth);
  const [profileVisible, setProfileVisible] = useState(true);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const userName = user?.name || "Student";

  return (
    <div className="w-64 bg-[#170438] min-h-screen flex flex-col text-white p-4">
      {/* Logo and Name */}
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold">
          J
        </div>
        <span className="text-xl font-bold">JobPortal</span>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 space-y-2">
        {navigation.map((item) => (
          <button
            key={item.name}
            onClick={() => navigate(item.href)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
              location.pathname === item.href
                ? "bg-purple-400/30 text-white"
                : "text-white/80 hover:bg-purple-400/20",
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="font-medium">{item.name}</span>
          </button>
        ))}
      </nav>

      {/* Account Dropdown */}
      <div className="mt-auto p-2 border-t border-purple-300/20">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full flex justify-between items-center text-white/80 hover:bg-purple-400/20 hover:text-white"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-800 font-medium">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium">{userName}</span>
              </div>
              <User className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-white p-2 rounded-lg shadow-lg">
            <DropdownMenuLabel>Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Profile Visible</span>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-purple-600" />
                  <Switch
                    checked={profileVisible}
                    onCheckedChange={setProfileVisible}
                    className="data-[state=checked]:bg-purple-600"
                  />
                  <span className="text-xs text-purple-600 font-medium">
                    {profileVisible ? "On" : "Off"}
                  </span>
                </div>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export default function StudentDashboardLayout() {
  const { user } = useSelector(selectAuth);
  const userName = user?.name || "Student";

  return (
    <div className="flex min-h-screen bg-gray-100">
      <StudentSidebarNav />
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm p-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Welcome back, {userName}!</h1>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 text-purple-600 border-purple-200 hover:bg-purple-50">
                <Lightbulb className="h-5 w-5" />
                Tips
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-white p-4 rounded-lg shadow-lg border border-purple-100">
              <h4 className="font-bold text-lg text-purple-700 mb-2">Pro Tips for Students</h4>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>💡 Complete your profile to get personalized job recommendations.</li>
                <li>🚀 Regularly check new job postings in the 'View Jobs' section.</li>
                <li>📝 Keep your resume updated for quick applications.</li>
                <li>⭐ Apply to jobs that best match your skills and desired roles.</li>
              </ul>
            </PopoverContent>
          </Popover>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
