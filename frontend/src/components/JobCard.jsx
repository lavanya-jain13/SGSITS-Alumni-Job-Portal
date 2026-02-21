import { useState } from "react";
import { MapPin, Clock, ChevronRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import ApplicationModal from "@/components/ApplicationModals";

const typeColors = {
  "Full-time": "bg-orange-100 text-orange-800 border-orange-200",
  Internship: "bg-blue-100 text-blue-800 border-blue-200",
  Contract: "bg-green-100 text-green-800 border-green-200",
};

export default function JobCard({ id = "1", title, company, location, type }) {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    if (!id) {
      navigate("/jobs");
      return;
    }
    navigate(`/jobs/${id}`);
  };

  const jobDetails = { id, title, company, location, type };

  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer group relative overflow-hidden"
      onClick={handleViewDetails}
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-white via-gray-400 to-white" />
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                {title}
              </h3>
              <p className="text-muted-foreground">{company}</p>
            </div>
            <Heart className="h-5 w-5 text-gray-400 hover:text-red-500 cursor-pointer" />
          </div>

          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <MapPin className="h-4 w-4" />
              <span>{location}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Badge variant="secondary" className={typeColors[type]}>
              {type}
            </Badge>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewDetails();
                }}
              >
                View Details
              </Button>

            <Button
              size="sm"
              className="bg-[#072442] hover:bg-[#32649b]/90 text-white"
              onClick={(e) => {
                e.stopPropagation();
                handleViewDetails();
              }}
            >
              Apply Now
            </Button>
            </div>
          </div>
        </div>
      </CardContent>

      {/* ApplicationModal left here for future apply flow */}
      <ApplicationModal
        isOpen={false}
        onClose={() => {}}
        jobDetails={jobDetails}
      />
    </Card>
  );
}
