import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { LogOut, Search, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout, selectAuth } from "@/store/authSlice";
import { Switch } from "@/components/ui/switch"; // Assuming Switch component exists

export default function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { search } = useLocation();
  const { user } = useSelector(selectAuth);
  const [term, setTerm] = useState("");
  const [profileVisible, setProfileVisible] = useState(true); // State for profile visibility toggle

  useEffect(() => {
    const params = new URLSearchParams(search);
    setTerm(params.get("search") || "");
  }, [search]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const value = term.trim();
    const next = value ? `/jobs?search=${encodeURIComponent(value)}` : "/jobs";
    navigate(next);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const handleToggleProfileVisibility = () => {
    setProfileVisible((prev) => !prev);
    // TODO: Add actual API call to update user's profile visibility preference
    console.log("Profile visibility toggled to:", !profileVisible);
  };

  const firstInitial = (user?.name || user?.email || "S").charAt(0).toUpperCase();

  return (
    <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between shadow-sm">
      {/* Logo/Brand Name (as per screenshot) - left side */}
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-full bg-[#072442] flex items-center justify-center text-white font-bold text-lg">
          {firstInitial}
        </div>
        <span className="text-xl font-bold text-gray-800">JobPortal</span>
      </div>

      {/* Search Bar - middle */}
      <form onSubmit={handleSubmit} className="flex-1 max-w-md mx-auto" role="search">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search jobs, companies..."
            className="pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:border-[#072442] focus:ring-1 focus:ring-[#072442] bg-gray-50"
          />
        </div>
      </form>

      {/* Right side actions - Tips, Profile Dropdown */}
      <div className="flex items-center gap-4">
        <Button variant="outline" className="rounded-full px-4 py-2 text-sm text-gray-700 border-gray-300 hover:bg-gray-100">
          💡 Tips
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full w-10 h-10 text-gray-600 hover:bg-gray-100"
              aria-label="Profile menu"
            >
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-gray-200 text-gray-600">
                  {(user?.name || user?.email || "😊").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60 p-2 shadow-lg rounded-lg bg-white">
            <DropdownMenuLabel className="text-sm font-semibold text-gray-800 px-2 pt-1 pb-2">Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="-mx-2 my-1 h-px bg-gray-100" />
            <DropdownMenuItem className="flex items-center justify-between px-2 py-1.5 cursor-pointer hover:bg-gray-50 rounded-md">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                {profileVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                <span>Profile Visible</span>
              </div>
              <Switch
                checked={profileVisible}
                onCheckedChange={handleToggleProfileVisibility}
                className="data-[state=checked]:bg-[#072442] data-[state=unchecked]:bg-gray-200"
              />
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 px-2 py-1.5 cursor-pointer text-red-600 hover:bg-red-50 rounded-md">
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
