import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { LogOut, Search } from "lucide-react";
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

export default function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { search } = useLocation();
  const { user } = useSelector(selectAuth);
  const [term, setTerm] = useState("");

  // Keep header input in sync with URL query (?search=)
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

  return (
    <header className="bg-primary text-primary-foreground p-4">
      <div className="max-w-7xl mx-auto flex items-center gap-4">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-2xl mx-auto"
          role="search"
        >
          <div className="relative flex items-center">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search jobs, companies..."
              className="pl-10 pr-24 bg-white/10 border-white/20 text-white placeholder:text-white/90 focus:bg-white/20"
            />
            <Button
              type="submit"
              variant="secondary"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8"
              size="sm"
            >
              Search
            </Button>
          </div>
        </form>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-white/10"
              aria-label="Profile menu"
            >
              <Avatar className="h-9 w-9 border border-white/30">
                <AvatarFallback className="bg-white/10 text-white">
                  {(user?.name || user?.email || "😊").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[180px]">
            <DropdownMenuLabel>Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
