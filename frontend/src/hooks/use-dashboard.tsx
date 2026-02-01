import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "@/api/dashboard";

export const useDashboard = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ["get-dashboard-stats", startDate, endDate],
    queryFn: () => getDashboardStats(startDate, endDate),
    select: (data) => data.data,
  });
};
