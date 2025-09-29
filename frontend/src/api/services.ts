import http from "./http";

export const getServices = async (): Promise<Service.Props[]> => {
  const response = await http.get("/services");
  return response.data.data;
};

export const getService = async (id: string): Promise<Service.Props> => {
  const response = await http.get(`/services/${id}`);
  return response.data.data;
};

export const createService = async (
  body: Service.Props
): Promise<Service.Props> => {
  const response = await http.post("/services", { body });
  return response.data.data;
};

export const updateService = async (
  id: string,
  body: Service.Props
): Promise<Service.Props> => {
  const response = await http.put(`/services/${id}`, { body });
  return response.data.data;
};

export const deleteService = async (id: string): Promise<Service.Props> => {
  const response = await http.delete(`/services/${id}`);
  return response.data.data;
};
