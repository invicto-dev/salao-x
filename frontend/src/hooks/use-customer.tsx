import {
  createCustomer,
  deleteCustomer,
  getCustomer,
  getCustomers,
  updateCustomer,
} from "@/api/customer";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";

export const useCustomers = (params?: Params) => {
  return useQuery<Customer.Props[]>({
    queryKey: ["get-customers", params],
    queryFn: () => getCustomers(params),
  });
};

export const useCustomer = (id: string) => {
  return useQuery<Customer.Props>({
    queryKey: ["get-customer", id],
    queryFn: () => getCustomer(id),
  });
};

export const useCustomerCreate = () => {
  const queryClient = useQueryClient();
  const res = useMutation({
    mutationFn: async (body: Customer.Body) => {
      return await createCustomer(body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get-customers"] });
      toast.success("Cliente criado com sucesso.");
    },
    onError: (error: AxiosError<{ error: string }>) => {
      toast.error(error.response.data.error);
      return error;
    },
  });

  return res;
};

export const useCustomerUpdate = () => {
  const queryClient = useQueryClient();
  const res = useMutation({
    mutationFn: async ({ id, body }: { id: string; body: Customer.Body }) => {
      return await updateCustomer(id, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get-customers"] });
      toast.success("Cliente atualizado com sucesso.");
    },
    onError: (error: AxiosError<{ error: string }>) => {
      toast.error(error.response.data.error);
    },
  });

  return res;
};

export const useCustomerDelete = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return await deleteCustomer(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get-customers"] });
      toast.success("Cliente excluído com sucesso.");
    },
    onError: (error: AxiosError<{ error: string }>) => {
      toast.error(error.response.data.error);
    },
  });
};
