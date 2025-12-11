import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Phone, MapPin, Building2, Calendar, Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useSelector } from "react-redux";
import { selectAuth } from "@/store/authSlice";
import { apiClient } from "@/lib/api";

export function ProfileView() {
  const navigate = useNavigate();
  const { user } = useSelector(selectAuth);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Fetch latest alumni profile + company from backend so we don't rely on stale Redux state
        const [profileRes, companiesRes] = await Promise.all([
          apiClient.getAlumniProfile(),
          apiClient.getMyCompanies().catch(() => ({ companies: [] })),
        ]);

        if (!mounted) return;
        const company = companiesRes?.companies?.[0];

        setProfileData({
          name:
            profileRes?.profile?.name ||
            profileRes?.user?.email?.split("@")[0] ||
            "",
          email: profileRes?.user?.email || "",
          phone: profileRes?.profile?.phone || "",
          location: company?.office_location || "",
          company: company?.name || "",
          position: profileRes?.profile?.current_title || "",
          graduationYear: profileRes?.profile?.grad_year || "",
          bio: profileRes?.profile?.about || "",
          avatar: "",
        });
      } catch (_err) {
        setProfileData(null); // fall back to auth state on error
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const profile = useMemo(() => {
    const live = profileData || {};
    const name = user?.name || user?.email?.split("@")[0] || "Alumni";
    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

    return {
      name: live.name || name,
      email: live.email || user?.email || "",
      phone: live.phone || user?.phone || "",
      location: live.location || user?.location || "",
      company: live.company || user?.company || "",
      position: live.position || user?.position || "",
      graduationYear: live.graduationYear || user?.grad_year || "",
      bio: live.bio || user?.bio || "Add a short bio in your profile.",
      avatar: live.avatar || user?.avatar || "",
      initials,
    };
  }, [user, profileData]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
        <Button onClick={() => navigate("/alumni/profile")}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Profile
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="md:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-32 w-32 mb-4">
                <AvatarImage src={profile.avatar} />
                <AvatarFallback className="text-2xl">{profile.initials}</AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-bold text-foreground mb-1">{profile.name}</h2>
              <p className="text-muted-foreground mb-4">{profile.position}</p>
              <Badge variant="secondary" className="mb-4">
                Class of {profile.graduationYear}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Details Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">About</h3>
              <p className="text-foreground">{profile.bio}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="text-foreground">{profile.email}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Company</p>
                    <p className="text-foreground">{profile.company}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Graduation Year</p>
                    <p className="text-foreground">{profile.graduationYear}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
