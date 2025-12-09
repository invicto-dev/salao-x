import http from "./http";

export const getSales = async (params: Params): Promise<Sale.Props[]> => {
  const response = await http.get("/sales", { params });
  return response.data.data;
};

export const getSale = async (id: string): Promise<Sale.Props> => {
  const response = await http.get(`/sales/${id}`);
  return response.data.data;
};

export const createSale = async (
  body: Partial<Sale.Props>
): Promise<Sale.Props> => {
  const response = await http.post("/sales", body);
  return response.data.data;
};

export const updateSale = async (
  id: string,
  body: Partial<Sale.Props>
): Promise<Sale.Props> => {
  const response = await http.patch(`/sales/${id}`, body);
  return response.data.data;
};

export const updateSaleStatus = async (
  id: string,
  body: { status: Sale.Props["status"] }
): Promise<Sale.Props> => {
  const response = await http.patch(`/sales/${id}/status`, body);
  return response.data.data;
};
