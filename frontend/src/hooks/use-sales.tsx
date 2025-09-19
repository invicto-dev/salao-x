import { createSale, getSales } from "@/api/sales";
import { useMutation, useQuery } from "@tanstack/react-query";
import { message } from "antd";
import { AxiosError } from "axios";

export const useSale = () =>
  useQuery<Sale.Props[]>({
    queryKey: ["get-sales"],
    queryFn: getSales,
  });

export const useSaleCreate = () => {
  const res = useMutation({
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

  return res;
};
