import {
  createPaymentMethod,
  deletePaymentMethod,
  getPaymentMethod,
  getPaymentMethods,
  updatePaymentMethod,
} from "@/api/paymentMethods";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { AxiosError } from "axios";

export const usePaymentMethods = () => {
  return useQuery<PaymentMethod.Props[]>({
    queryKey: ["get-payment-methods"],
    queryFn: getPaymentMethods,
  });
};

export const usePaymentMethod = (id: string) => {
  return useQuery<PaymentMethod.Props>({
    queryKey: ["get-payment-methods", id],
    queryFn: () => getPaymentMethod(id),
  });
};

export const usePaymentMethodCreate = () => {
  const queryClient = useQueryClient();
  const res = useMutation({
    mutationFn: async (body: PaymentMethod.Props) => {
      return await createPaymentMethod(body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get-payment-methods"] });
      message.success("Metodo de pagemento criado com sucesso.");
    },
    onError: (error: AxiosError<{ error: string }>) => {
      message.error(error.response.data.error);
      return error;
    },
  });

  return res;
};

export const usePaymentMethodUpdate = () => {
  const queryClient = useQueryClient();
  const res = useMutation({
    mutationFn: async ({
      id,
      body,
    }: {
      id: string;
      body: PaymentMethod.Props;
    }) => {
      return await updatePaymentMethod(id, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get-payment-methods"] });
      message.success("Metodo de pagemento atualizado com sucesso.");
    },
    onError: (error: AxiosError<{ error: string }>) => {
      message.error(error.response.data.error);
    },
  });

  return res;
};

export const usePaymentMethodDelete = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      return await deletePaymentMethod(id);
    },
    onSuccess: () => {
      message.success("Metodo de pagemento excluído com sucesso.");
    },
    onError: (error: AxiosError<{ error: string }>) => {
      message.error(error.response.data.error);
    },
  });
};
