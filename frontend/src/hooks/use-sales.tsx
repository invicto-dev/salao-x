import {
  createSale,
  getSale,
  getSales,
  updateSale,
  updateSaleStatus,
} from "@/api/sales";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { AxiosError } from "axios";

export const useSales = (params?: Params) => {
  return useQuery<Sale.Props[]>({
    queryKey: ["get-sales", params],
    queryFn: () => getSales(params),
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

export const useSaleCreate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: Partial<Sale.Props>) => {
      return await createSale(body);
    },
    onSuccess: (sale) => {
      const status = sale.status;
      queryClient.invalidateQueries({ queryKey: ["get-products"] });
      message.success(
        status === "PENDENTE"
          ? "Comanda aberta com sucesso."
          : "Venda registrada com sucesso."
      );
    },
    onError: (error: AxiosError<{ error: string }>) => {
      message.error(error.response.data.error);
    },
  });
};

export const useSaleUpdate = () => {
  const queryCliente = useQueryClient();
  const res = useMutation({
    mutationFn: async ({
      id,
      body,
    }: {
      id: string;
      body: Partial<Sale.Props>;
    }) => {
      return await updateSale(id, body);
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
      return await updateSaleStatus(id, body);
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
