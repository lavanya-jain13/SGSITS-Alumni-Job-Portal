import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search } from "lucide-react";

export function UserManagement({
  users = [],
  loading = false,
  onApproveAlumni,
  onDeleteUser,
  onPromoteUser,
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const term = searchTerm.toLowerCase();
      return (
        user.name?.toLowerCase().includes(term) ||
        user.role?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term)
      );
    });
  }, [users, searchTerm]);

  const getStatusVariant = (status) => {
    switch (status) {
      case "approved":
      case "active":
        return "default";
      case "pending":
        return "secondary";
      case "rejected":
      case "inactive":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
      case "active":
        return "bg-success text-success-foreground";
      case "pending":
        return "bg-warning text-warning-foreground";
      case "rejected":
      case "inactive":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">User Management</h2>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search users"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 max-w-sm"
        />
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
            <TableHead className="font-semibold">Name</TableHead>
            <TableHead className="font-semibold">Role</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Actions</TableHead>
          </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id} className="hover:bg-muted/50">
                <TableCell>
                  <div>
                    <div className="font-medium text-foreground">{user.name}</div>
                    {user.email && (
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-medium text-foreground">
                    {user.role}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={getStatusVariant(user.status?.toLowerCase())}
                    className={`${getStatusColor(user.status?.toLowerCase())} font-medium`}
                  >
                    {user.status || "pending"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {user.role === "alumni" &&
                      (user.status || "pending").toLowerCase() === "pending" &&
                      onApproveAlumni && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={loading}
                          onClick={() => onApproveAlumni(user.id)}
                          className="text-success border-success hover:bg-success hover:text-success-foreground"
                        >
                          Approve
                        </Button>
                      )}
                    {user.role !== "admin" && onPromoteUser && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={loading}
                        onClick={() => onPromoteUser(user.id)}
                      >
                        Promote to Admin
                      </Button>
                    )}
                    {onDeleteUser && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={loading}
                        onClick={() => onDeleteUser(user.id)}
                        className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
