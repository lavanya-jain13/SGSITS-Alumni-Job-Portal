import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectAuth, logout, updateUser } from "@/store/authSlice";
import { useEffect, useRef, useState } from "react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/api";

/* ---------------- NAV ITEMS ---------------- */

const navigation = [
  { name: "Complete Profile", href: "/student/profile", icon: User },
  { name: "View Jobs", href: "/student/jobs", icon: Briefcase },
  { name: "Recent Applications", href: "/student/applications", icon: Clock },
];

/* ---------------- SIDEBAR ---------------- */

function StudentSidebarNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { user } = useSelector(selectAuth);
  const [profileVisible, setProfileVisible] = useState(false);
  const [visibilityLoading, setVisibilityLoading] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  useEffect(() => {
    let mounted = true;
    apiFetch("/student/profile")
      .then((res) => {
        if (!mounted) return;
        const visible =
          typeof res?.profile?.consent_profile_visibility === "boolean"
            ? res.profile.consent_profile_visibility
            : false;
        setProfileVisible(visible);
      })
      .catch(() => {
        if (!mounted) return;
        setProfileVisible(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleProfileVisibleChange = async (checked) => {
    const prev = profileVisible;
    setProfileVisible(checked);
    setVisibilityLoading(true);
    try {
      await apiFetch("/student/profile", {
        method: "PUT",
        body: JSON.stringify({ profileVisibility: checked }),
      });
      toast({
        title: "Profile visibility updated",
      });
    } catch (err) {
      setProfileVisible(prev);
      toast({
        title: "Update failed",
        description: err?.message || "Could not update profile visibility.",
        variant: "destructive",
      });
    } finally {
      setVisibilityLoading(false);
    }
  };

  // ✅ SINGLE SOURCE OF TRUTH
  const userName = user?.student_name?.split(" ")[0] || "Student";

  return (
    <div className="w-64 bg-[#072442] min-h-screen flex flex-col text-white p-4">
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="w-10 h-10 rounded-full bg-yellow-100 text-black flex items-center justify-center font-bold">
          A
        </div>
        <div className="flex flex-col items-center">
          <span className="text-m font-bold">Student</span>
          <span className="text-m font-bold">Dashboard</span>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {navigation.map((item) => (
          <button
            key={item.name}
            onClick={() => navigate(item.href)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition",
              location.pathname === item.href
                ? "bg-purple-400/30"
                : "hover:bg-purple-400/20",
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </button>
        ))}
      </nav>

      <div className="mt-auto border-t border-purple-300/20 p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full text-gray-800 flex items-center justify-center">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <span>{userName}</span>
              </div>
              <User className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Account</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <div className="flex justify-between items-center px-2 py-2">
              <span className="text-sm">Profile Visible</span>
              <Switch
                checked={profileVisible}
                disabled={visibilityLoading}
                onCheckedChange={handleProfileVisibleChange}
              />
            </div>

            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-600 cursor-pointer"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

/* ---------------- MAIN DASHBOARD ---------------- */

export default function StudentDashboardLayout() {
  const dispatch = useDispatch();
  const { user } = useSelector(selectAuth);
  const fetchedOnce = useRef(false);

  // ✅ ALWAYS SYNC PROFILE ON DASHBOARD LOAD
  useEffect(() => {
    if (fetchedOnce.current) return;
    fetchedOnce.current = true;

    fetch("http://localhost:5004/api/student/profile", {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Profile API failed");
        return res.json();
      })
      .then((data) => {
        dispatch(updateUser({ student_name: data.profile.name }));
      })
      .catch((err) => console.error("Failed to load student profile:", err));
  }, [dispatch]);

  const userName = user?.student_name || "Student";

  return (
    <div className="flex min-h-screen bg-gray-100">
      <StudentSidebarNav />

      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm p-6 flex justify-between">
          <h1 className="text-2xl font-bold">Welcome back, {userName}!</h1>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <Lightbulb className="h-5 w-5 mr-2" />
                Tips
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <ul className="text-sm space-y-2">
                <li>💡 Complete your profile</li>
                <li>🚀 Check new job postings</li>
                <li>📝 Keep your resume updated</li>
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
