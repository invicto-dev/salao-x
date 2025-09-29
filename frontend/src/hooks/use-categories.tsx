import {
  createCategory,
  deleteCategory,
  getCategory,
  getCategories,
  updateCategory,
} from "@/api/categories";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { AxiosError } from "axios";

export const useCategories = () => {
  return useQuery<Category.Props[]>({
    queryKey: ["get-categories"],
    queryFn: getCategories,
  });
};

export const useCategory = (id: string) => {
  return useQuery<Category.Props>({
    queryKey: ["get-categories", id],
    queryFn: () => getCategory(id),
  });
};

export const useCategoryCreate = () => {
  const queryClient = useQueryClient();
  const res = useMutation({
    mutationFn: async (body: Category.Props) => {
      return await createCategory(body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get-categories"] });
      message.success("Categoria criada com sucesso.");
    },
    onError: (error: AxiosError<{ error: string }>) => {
      message.error(error.response.data.error);
      return error;
    },
  });

  return res;
};

export const useCategoryUpdate = () => {
  const queryClient = useQueryClient();
  const res = useMutation({
    mutationFn: async ({ id, body }: { id: string; body: Category.Props }) => {
      return await updateCategory(id, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get-categories"] });
      message.success("Categoria atualizada com sucesso.");
    },
    onError: (error: AxiosError<{ error: string }>) => {
      message.error(error.response.data.error);
    },
  });

  return res;
};

export const useCategoryDelete = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return await deleteCategory(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get-categories"] });
      message.success("Categoria excluída com sucesso.");
    },
    onError: (error: AxiosError<{ error: string }>) => {
      message.error(error.response.data.error);
    },
  });
};
