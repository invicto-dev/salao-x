import http from "./http";

export const getProducts = async (): Promise<Product.Props[]> => {
  const response = await http.get("/products");
  return response.data.data;
};

export const getProduct = async (id: string): Promise<Product.Props> => {
  const response = await http.get(`/products/${id}`);
  return response.data.data;
};

export const createProduct = async (
  body: Product.Props
): Promise<Product.Props> => {
  const response = await http.post("/products", { body });
  return response.data.data;
};

export const updateProduct = async (
  id: string,
  body: Product.Props
): Promise<Product.Props> => {
  const response = await http.put(`/products/${id}`, { body });
  return response.data.data;
};

export const deleteProduct = async (id: string): Promise<Product.Props> => {
  const response = await http.delete(`/products/${id}`);
  return response.data.data;
};
