import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Users, FileText, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "@/store/authSlice";

export function QuickAccess() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <Card className="gradient-card shadow-glow">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Quick Access</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          size="sm" 
          className="w-full"
          onClick={() => navigate("/alumni/postings")}
        >
          <Plus className="h-4 w-4 mr-2" />
          Post New Job
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={() => navigate("/alumni/postings")}
        >
          <Users className="h-4 w-4 mr-2" />
          View All Postings
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={() => navigate("/alumni/applications")}
        >
          <Users className="h-4 w-4 mr-2" />
          Applications Overview
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={() => navigate("/alumni/add-company")}
        >
          <FileText className="h-4 w-4 mr-2" />
          Edit Company
        </Button>

        <Button 
          variant="ghost"
          size="sm"
          className="w-full justify-start text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </CardContent>
    </Card>
  );
}
