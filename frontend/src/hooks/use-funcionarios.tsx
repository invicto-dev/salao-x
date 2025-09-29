import {
  createFuncionario,
  deleteFuncionario,
  getFuncionario,
  getFuncionarios,
  updateFuncionario,
} from "@/api/funcionarios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { AxiosError } from "axios";

export const useFuncionarios = () => {
  return useQuery<Employee.Props[]>({
    queryKey: ["get-funcionarios"],
    queryFn: getFuncionarios,
  });
};

export const useFuncionario = (id: string) => {
  return useQuery<Employee.Props>({
    queryKey: ["get-funcionario", id],
    queryFn: () => getFuncionario(id),
  });
};

export const useFuncionarioCreate = () => {
  const queryClient = useQueryClient();
  const res = useMutation({
    mutationFn: async (body: Employee.Props) => {
      return await createFuncionario(body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get-funcionarios"] });
      message.success("Funcionário criado com sucesso.");
    },
    onError: (error: AxiosError<{ error: string }>) => {
      message.error(error.response.data.error);
      return error;
    },
  });

  return res;
};

export const useFuncionarioUpdate = () => {
  const queryClient = useQueryClient();
  const res = useMutation({
    mutationFn: async ({ id, body }: { id: string; body: Employee.Props }) => {
      return await updateFuncionario(id, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get-funcionarios"] });
      message.success("Funcionário atualizado com sucesso.");
    },
    onError: (error: AxiosError<{ error: string }>) => {
      message.error(error.response.data.error);
    },
  });

  return res;
};

export const useFuncionarioDelete = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return await deleteFuncionario(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get-funcionarios"] });
      message.success("Funcionário excluído com sucesso.");
    },
    onError: (error: AxiosError<{ error: string }>) => {
      message.error(error.response.data.error);
    },
  });
};
