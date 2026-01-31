import React, { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  createCategory,
  deleteCategory,
  getCategory,
  getCategories,
  updateCategory,
} from "@/api/categories";
import { NameInput } from "@/components/inputs/NameInput";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export const useCategories = (params?: any) => {
  return useQuery<any[]>({
    queryKey: ["get-categories", params],
    queryFn: () => getCategories(params),
  });
};

export const useCategory = (id: string) => {
  return useQuery<any>({
    queryKey: ["get-categories", id],
    queryFn: () => getCategory(id),
  });
};

export const useCategoryCreate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: any) => {
      return await createCategory(body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get-categories"] });
      toast.success("Categoria criada com sucesso.");
    },
    onError: (error: AxiosError<{ error: string }>) => {
      toast.error(error.response?.data?.error || "Erro ao criar categoria");
    },
  });
};

export const useCategoryUpdate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: any }) => {
      return await updateCategory(id, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get-categories"] });
      toast.success("Categoria atualizada com sucesso.");
    },
    onError: (error: AxiosError<{ error: string }>) => {
      toast.error(error.response?.data?.error || "Erro ao atualizar categoria");
    },
  });
};

export const useCategoryDelete = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return await deleteCategory(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get-categories"] });
      toast.success("Categoria excluída com sucesso.");
    },
    onError: (error: AxiosError<{ error: string }>) => {
      toast.error(error.response?.data?.error || "Erro ao excluir categoria");
    },
  });
};

const categorySchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  descricao: z.string().optional(),
  ativo: z.boolean().default(true),
});

export const useCategoryModal = (initialValues?: any) => {
  const [modalVisible, setModalVisible] = useState(false);
  const isEdit = Boolean(initialValues?.id);

  const { mutateAsync: create, isPending: isCreate } = useCategoryCreate();
  const { mutateAsync: update, isPending: isUpdate } = useCategoryUpdate();

  const form = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      nome: "",
      descricao: "",
      ativo: true,
    },
  });

  const toggle = () => setModalVisible((v) => !v);

  const handleCancel = () => {
    form.reset();
    setModalVisible(false);
  };

  useEffect(() => {
    if (modalVisible) {
      if (isEdit && initialValues) {
        form.reset({
          nome: initialValues.nome,
          descricao: initialValues.descricao || "",
          ativo: initialValues.ativo ?? true,
        });
      } else {
        form.reset({
          nome: "",
          descricao: "",
          ativo: true,
        });
      }
    }
  }, [modalVisible, initialValues, isEdit]);

  const onFinish = async (values: any) => {
    try {
      if (isEdit) {
        await update({ id: initialValues.id, body: values });
      } else {
        await create(values);
      }
      handleCancel();
    } catch (error) {
      console.error(error);
    }
  };

  const CategoryModal = (
    <Dialog open={modalVisible} onOpenChange={setModalVisible}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form id="category-form" onSubmit={form.handleSubmit(onFinish)} className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-3">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <NameInput placeholder="Ex: Serviços Capilares" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-col justify-end pb-2">
                 <FormField
                  control={form.control}
                  name="ativo"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2 space-y-0">
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="text-xs font-normal">Ativo</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea rows={3} placeholder="Descreva a categoria..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter>
          <Button variant="ghost" onClick={handleCancel}>Cancelar</Button>
          <Button type="submit" form="category-form" disabled={isCreate || isUpdate}>
            {(isCreate || isUpdate) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Salvar" : "Cadastrar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return {
    toggleModal: toggle,
    CategoryModal,
  };
};
