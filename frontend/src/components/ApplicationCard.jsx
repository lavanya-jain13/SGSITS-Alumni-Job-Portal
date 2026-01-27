import { Card, CardContent } from "@/components/ui/card";
import { Building, Clock, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ApplicationCard({
  id,
  title,
  company,
  timeAgo,
  status,
}) {
  const getStatusColor = (currentStatus) => {
    switch (currentStatus) {
      case "Reviewed":
        return "bg-blue-100 text-blue-800";
      case "Applied":
        return "bg-yellow-100 text-yellow-800";
      case "Interview":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 bg-[#170438] border-[#072442] text-white">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center text-gray-300">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="text-sm text-gray-400 flex items-center gap-1">
                <Building className="h-4 w-4" />
                {company}
              </p>
            </div>
          </div>
          <Badge className={getStatusColor(status)}>{status}</Badge>
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-400 mt-4">
          <Clock className="h-4 w-4" />
          Applied {timeAgo}
        </div>
      </CardContent>
    </Card>
  );
}
