import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const StatusBadge = ({ status }) => {
  let colorClass = "";
  switch (status.toLowerCase()) {
    case "reviewed":
      colorClass = "bg-blue-500 hover:bg-blue-600 text-white";
      break;
    case "applied":
      colorClass = "bg-yellow-500 hover:bg-yellow-600 text-white";
      break;
    case "interview":
      colorClass = "bg-green-500 hover:bg-green-600 text-white";
      break;
    case "rejected":
      colorClass = "bg-red-500 hover:bg-red-600 text-white";
      break;
    case "offered":
      colorClass = "bg-purple-500 hover:bg-purple-600 text-white";
      break;
    default:
      colorClass = "bg-gray-500 hover:bg-gray-600 text-white";
  }

  return (
    <Badge className={cn("px-3 py-1 text-xs font-semibold", colorClass)}>
      {status}
    </Badge>
  );
};

export default StatusBadge;
