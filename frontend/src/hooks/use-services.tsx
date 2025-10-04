import {
  createService,
  deleteService,
  getService,
  getServices,
  updateService,
} from "../api/services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { AxiosError } from "axios";

export const useServices = (params: { search?: string; status?: string }) => {
  return useQuery<Service.Props[]>({
    queryKey: ["get-services"],
    queryFn: () => getServices(params),
  });
};

export const useService = (id: string) => {
  return useQuery<Service.Props>({
    queryKey: ["get-service", id],
    queryFn: () => getService(id),
  });
};

export const useServiceCreate = () => {
  const queryClient = useQueryClient();
  const res = useMutation({
    mutationFn: async (body: Service.Props) => {
      return await createService(body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get-services"] });
      message.success("Serviço criado com sucesso.");
    },
    onError: (error: AxiosError<{ error: string }>) => {
      message.error(error.response.data.error);
      return error;
    },
  });

  return res;
};

export const useServiceUpdate = () => {
  const queryClient = useQueryClient();
  const res = useMutation({
    mutationFn: async ({ id, body }: { id: string; body: Service.Props }) => {
      return await updateService(id, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get-services"] });
      message.success("Serviço atualizado com sucesso.");
    },
    onError: (error: AxiosError<{ error: string }>) => {
      message.error(error.response.data.error);
    },
  });

  return res;
};

export const useServiceDelete = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return await deleteService(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get-services"] });
      message.success("Serviço excluído com sucesso.");
    },
    onError: (error: AxiosError<{ error: string }>) => {
      message.error(error.response.data.error);
    },
  });
};
