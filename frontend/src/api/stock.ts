import http from "./http";

// KPIs do dashboard
export const getStockKpis = async (): Promise<Stock.Kpis> => {
  const response = await http.get("/stock/kpis");
  return response.data.data;
};

// Movimentações recentes
export const getRecentMovements = async (
  limit = 5
): Promise<Stock.Movement[]> => {
  const response = await http.get(`/stock/movements/recent?limit=${limit}`);
  return response.data.data;
};

// Cria uma nova movimentação
export const createStockMovement = async (
  body: Stock.CreateMovementBody
): Promise<Stock.Movement> => {
  const response = await http.post("/stock/movements", body);
  return response.data.data;
};
