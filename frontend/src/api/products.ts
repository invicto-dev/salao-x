import http from "./http";

// Tipos para os parâmetros das queries
interface GetStockProductsParams {
  search?: string;
  categoryId?: string;
  contarEstoque?: boolean;
}

export const getProducts = async (
  params: GetStockProductsParams
): Promise<Product.Props[]> => {
  const response = await http.get("/products", { params });
  return response.data.data;
};

export const getProduct = async (id: string): Promise<Product.Props> => {
  const response = await http.get(`/products/${id}`);
  return response.data.data;
};

export const createProduct = async (
  body: Product.Props
): Promise<Product.Props> => {
  const response = await http.post("/products", body);
  return response.data.data;
};

export const updateProduct = async (
  id: string,
  body: Product.Props
): Promise<Product.Props> => {
  const response = await http.put(`/products/${id}`, body);
  return response.data.data;
};

export const deleteProduct = async (id: string): Promise<Product.Props> => {
  const response = await http.delete(`/products/${id}`);
  return response.data.data;
};
