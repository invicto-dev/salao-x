import http from "./http";

export const getSales = async (): Promise<Sale.Props[]> => {
  const response = await http.get("/sales");
  return response.data.data;
};

export const getSale = async (id: string): Promise<Sale.Props> => {
  const response = await http.get(`/sales/${id}`);
  return response.data.data;
};

export const createSale = async (body: Sale.Props): Promise<Sale.Props> => {
  const response = await http.post("/sales", body);
  return response.data.data;
};

export const updatesale = async (
  id: string,
  body: { status: Sale.Props["status"] }
): Promise<Sale.Props> => {
  const response = await http.patch(`/sales/${id}/status`, body);
  return response.data.data;
};
