import { AlumniSidebar } from "@/components/alumni/AlumniSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, User } from "lucide-react";
import { Outlet, useLocation } from "react-router-dom";
import { ProfileView } from "../alumni/ProfileView";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout, selectAuth } from "@/store/authSlice";
import { useSelector } from "react-redux";

export function AlumniLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(selectAuth);
  const displayName =
    user?.name ||
    (user?.email ? user.email.split("@")[0] : "Profile");
  // ✅ Pages that have their own search bars
  const pagesWithOwnSearch = [
    "/alumni/postings",    // ActivePostings.jsx
    "/alumni/applications",  // JobApplicants.jsx
  ];

  // ✅ Hide global search on these pages
  const shouldHideGlobalSearch = pagesWithOwnSearch.some((path) =>
    location.pathname.startsWith(path)
  );

  return (
    <div className="flex h-screen w-full bg-background text-foreground">
      {/* Sidebar */}
      <AlumniSidebar />

      {/* Main Section */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex h-16 items-center justify-end border-b border-border px-6 bg-card shadow-sm">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="relative flex items-center gap-2 text-foreground hover:text-primary-foreground"
              onClick={() => navigate("/alumni/profile-view")}
            >
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {user?.email ? user.email.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-medium leading-none">
                    {displayName}
                  </div>
                  <div className="text-xs text-muted-foreground leading-none">
                    Alumni
                  </div>
                </div>
              </div>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 text-foreground hover:text-primary-foreground"
              onClick={() => {
                dispatch(logout());
                navigate("/login");
              }}
            >
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-background p-6 transition-colors duration-300">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
