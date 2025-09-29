import http from "./http";

export const getPaymentMethods = async (): Promise<PaymentMethod.Props[]> => {
  const response = await http.get("/payment-methods");
  return response.data.data;
};

export const getPaymentMethod = async (
  id: string
): Promise<PaymentMethod.Props> => {
  const response = await http.get(`/payment-methods/${id}`);
  return response.data.data;
};

export const createPaymentMethod = async (
  body: PaymentMethod.Props
): Promise<PaymentMethod.Props> => {
  const response = await http.post("/payment-methods", body);
  return response.data.data;
};

export const updatePaymentMethod = async (
  id: string,
  body: PaymentMethod.Props
): Promise<PaymentMethod.Props> => {
  const response = await http.put(`/payment-methods/${id}`, body);
  return response.data.data;
};

export const deletePaymentMethod = async (
  id: string
): Promise<PaymentMethod.Props> => {
  const response = await http.delete(`/payment-methods/${id}`);
  return response.data.data;
};
