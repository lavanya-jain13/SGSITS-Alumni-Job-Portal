import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

const ADMIN_DATA_QUERY_KEY = "adminData";

export function useAdminStats() {
  return useQuery({
    queryKey: [ADMIN_DATA_QUERY_KEY, "stats"],
    queryFn: apiClient.adminStats,
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: [ADMIN_DATA_QUERY_KEY, "users"],
    queryFn: async () => {
      const usersRes = await apiClient.adminUsers();
      const normalizedUsers = [
        ...(usersRes?.students || []).map((u) => ({
          id: u.user_id,
          name: u.name,
          role: "student",
          status: u.status || "approved",
          email: u.email,
        })),
        ...(usersRes?.alumni || []).map((u) => ({
          id: u.user_id,
          name: u.name,
          role: "alumni",
          status: u.status || "pending",
          email: u.email,
          companyId: u.company_id,
          companyName: u.company_name,
          companyStatus: u.company_status,
        })),
      ];
      return normalizedUsers;
    },
  });
}

export function useApproveAlumni() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId) => apiClient.adminVerifyAlumni(userId, "approved"),
    onSuccess: () => {
      queryClient.invalidateQueries([ADMIN_DATA_QUERY_KEY, "users"]);
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId) => apiClient.adminDeleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries([ADMIN_DATA_QUERY_KEY, "users"]);
    },
  });
}

export function usePromoteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId) => apiClient.adminPromoteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries([ADMIN_DATA_QUERY_KEY, "users"]);
    },
  });
}
