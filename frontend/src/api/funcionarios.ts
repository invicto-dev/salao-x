import http from "./http";

export const getFuncionarios = async (): Promise<Employee.Props[]> => {
  const response = await http.get("/funcionarios");
  return response.data.data;
};

export const getFuncionario = async (id: string): Promise<Employee.Props> => {
  const response = await http.get(`/funcionarios/${id}`);
  return response.data.data;
};

export const createFuncionario = async (
  body: Employee.Props
): Promise<Employee.Props> => {
  const response = await http.post("/funcionarios", { body });
  return response.data.data;
};

export const updateFuncionario = async (
  id: string,
  body: Employee.Props
): Promise<Employee.Props> => {
  const response = await http.put(`/funcionarios/${id}`, { body });
  return response.data.data;
};

export const deleteFuncionario = async (
  id: string
): Promise<Employee.Props> => {
  const response = await http.delete(`/funcionarios/${id}`);
  return response.data.data;
};
