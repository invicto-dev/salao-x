import {
  createProduct,
  deleteProduct,
  getProduct,
  getProducts,
  updateProduct,
} from "../api/products";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { AxiosError } from "axios";

export const useProducts = (filters: {
  search?: string;
  categoryId?: string;
  contarEstoque?: boolean;
}) => {
  return useQuery<Product.Props[]>({
    queryKey: ["get-products", filters],
    queryFn: () => getProducts(filters),
  });
};

export const useProduct = (id: string) => {
  return useQuery<Product.Props>({
    queryKey: ["get-product", id],
    queryFn: () => getProduct(id),
  });
};

export const useProductCreate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: Product.Props) => {
      return await createProduct(body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["get-products"],
      });
      message.success("Produto criado com sucesso.");
    },
    onError: (error: AxiosError<{ error: string }>) => {
      message.error(error.response.data.error);
      return error;
    },
  });
};

export const useProductUpdate = () => {
  const queryClient = useQueryClient();
  const res = useMutation({
    mutationFn: async ({ id, body }: { id: string; body: Product.Props }) => {
      return await updateProduct(id, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["get-products"],
      });
      message.success("Produto atualizado com sucesso.");
    },
    onError: (error: AxiosError<{ error: string }>) => {
      message.error(error.response.data.error);
    },
  });

  return res;
};

export const useProductDelete = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      return await deleteProduct(id);
    },
    onSuccess: () => {
      message.success("Produto excluído com sucesso.");
    },
    onError: (error: AxiosError<{ error: string }>) => {
      message.error(error.response.data.error);
    },
  });
};
