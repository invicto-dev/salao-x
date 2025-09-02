import http from "./http";

export const getCustomers = async (): Promise<Customer.Props[]> => {
  const response = await http.get("/customers");
  return response.data.data;
};

export const getCustomer = async (id: string): Promise<Customer.Props> => {
  const response = await http.get(`/customers/${id}`);
  return response.data.data;
};

export const createCustomer = async (
  body: Customer.Props
): Promise<Customer.Props> => {
  const response = await http.post("/customers", { body });
  return response.data.data;
};

export const updateCustomer = async (
  id: string,
  body: Customer.Props
): Promise<Customer.Props> => {
  const response = await http.put(`/customers/${id}`, { body });
  return response.data.data;
};

export const deleteCustomer = async (id: string): Promise<Customer.Props> => {
  const response = await http.delete(`/customers/${id}`);
  return response.data.data;
};
