import http from "./http";

export const getFuncionarios = async (): Promise<Employee.Props[]> => {
  const response = await http.get("/employees");
  return response.data.data;
};

export const getFuncionario = async (id: string): Promise<Employee.Props> => {
  const response = await http.get(`/employees/${id}`);
  return response.data.data;
};

export const createFuncionario = async (
  body: Employee.Props
): Promise<Employee.Props> => {
  const response = await http.post("/employees", body); 
  return response.data.data;
};


export const updateFuncionario = async (
  id: string,
  body: Employee.Props
): Promise<Employee.Props> => {
  const response = await http.put(`/employees/${id}`, { body });
  return response.data.data;
};

export const deleteFuncionario = async (
  id: string
): Promise<Employee.Props> => {
  const response = await http.delete(`/employees/${id}`);
  return response.data.data;
};
