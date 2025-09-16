import http from "./http";

export const getCategories = async (): Promise<Category.Props[]> => {
  const response = await http.get("/categories");
  return response.data.data;
};

export const getCategory = async (id: string): Promise<Category.Props> => {
  const response = await http.get(`/categories/${id}`);
  return response.data.data;
};

export const createCategory = async (
  body: Category.Props
): Promise<Category.Props> => {
  const response = await http.post("/categories", body);
  return response.data.data;
};

export const updateCategory = async (
  id: string,
  body: Category.Props
): Promise<Category.Props> => {
  const response = await http.put(`/categories/${id}`, body);
  return response.data.data;
};

export const deleteCategory = async (id: string): Promise<Category.Props> => {
  const response = await http.delete(`/categories/${id}`);
  return response.data.data;
};
