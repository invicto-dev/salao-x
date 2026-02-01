import api from "./http";

export const getDashboardStats = async (startDate?: string, endDate?: string) => {
  const response = await api.get("/dashboard/stats", {
    params: { startDate, endDate },
  });
  return response.data;
};
