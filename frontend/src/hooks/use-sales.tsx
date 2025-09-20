import { createSale, getSale, getSales, updatesale } from "@/api/sales";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { AxiosError } from "axios";

export const useSales = () => {
  return useQuery<Sale.Props[]>({
    queryKey: ["get-sales"],
    queryFn: getSales,
  });
};

export const useSale = (id: string) => {
  return useQuery<Sale.Props>({
    queryKey: ["get-sale", id],
    queryFn: async () => {
      if (!id) return null;
      return await getSale(id);
    },
    enabled: !!id,
  });
};

export const useSaleCreate = () =>
  useMutation({
    mutationFn: async (body: Sale.Props) => {
      return await createSale(body);
    },
    onSuccess: () => {
      message.success("Venda registrada com sucesso.");
    },
    onError: (error: AxiosError<{ error: string }>) => {
      message.error(error.response.data.error);
      return error;
    },
  });

export const useSaleUpdateStatus = () => {
  const queryCliente = useQueryClient();
  const res = useMutation({
    mutationFn: async ({
      id,
      body,
    }: {
      id: string;
      body: { status: Sale.Props["status"] };
    }) => {
      return await updatesale(id, body);
    },
    onSuccess: () => {
      queryCliente.invalidateQueries({ queryKey: ["get-sales"] });
      message.success("Venda atualizada com sucesso.");
    },
    onError: (error: AxiosError<{ error: string }>) => {
      message.error(error.response.data.error);
      return error;
    },
  });

  return res;
};
