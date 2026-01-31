import {
  createProduct,
  deleteProduct,
  getProduct,
  getProducts,
  importProducts,
  updateProduct,
} from "../api/products";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";

export const useProducts = (filters: {
  search?: string;
  categoryId?: string;
  status?: string;
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
      queryClient.invalidateQueries({
        queryKey: ["get-stock-products"],
      });
      toast.success("Produto criado com sucesso.");
    },
    onError: (error: AxiosError<{ error: string }>) => {
      toast.error(error.response.data.error);
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
      queryClient.invalidateQueries({
        queryKey: ["get-stock-products"],
      });
      toast.success("Produto atualizado com sucesso.");
    },
    onError: (error: AxiosError<{ error: string }>) => {
      toast.error(error.response.data.error);
    },
  });

  return res;
};

export const useProductDelete = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return await deleteProduct(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["get-products"],
      });
      queryClient.invalidateQueries({
        queryKey: ["get-stock-products"],
      });
      toast.success("Produto excluído com sucesso.");
    },
    onError: (error: AxiosError<{ error: string }>) => {
      toast.error(error.response.data.error);
    },
  });
};

export const useImportProducts = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      return await importProducts(file);
    },
    onSuccess: (res) => {
      toast.success(res.message);
    },
    onError: (error: AxiosError<{ error: string }>) => {
      toast.error(error.response.data.error);
    },
  });
};
