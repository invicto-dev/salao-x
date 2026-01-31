import { getConfiguracoes, updateConfiguracoes } from "@/api/configuracoes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";

// obter configurações
export const useConfiguracoes = () => {
  return useQuery<Salon.Config>({
    queryKey: ["get-configuracoes"],
    queryFn: getConfiguracoes,
  });
};

// atualizar configurações
export const useConfiguracoesUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: Salon.Config }) => {
      return await updateConfiguracoes({ id, body });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get-configuracoes"] });
      toast.success("Configurações atualizadas.");
    },
    onError: (error: AxiosError<{ error: string }>) => {
      toast.error(error.response.data.error);
    },
  });
};
