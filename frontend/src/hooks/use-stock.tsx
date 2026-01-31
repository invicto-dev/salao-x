import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";
import {
  getStockKpis,
  getRecentMovements,
  createStockMovement,
} from "@/api/stock";

// Hook para buscar os KPIs
export const useStockKpis = () => {
  return useQuery<Stock.Kpis>({
    queryKey: ["get-stock-kpis"],
    queryFn: getStockKpis,
  });
};

// Hook para buscar movimentações recentes
export const useRecentStockMovements = (limit = 5) => {
  return useQuery<Stock.Movement[]>({
    queryKey: ["get-recent-movements", limit],
    queryFn: () => getRecentMovements(limit),
  });
};

// Hook para criar uma nova movimentação de estoque
export const useStockMovementCreate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Stock.CreateMovementBody) => createStockMovement(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get-stock-kpis"] });
      queryClient.invalidateQueries({ queryKey: ["get-recent-movements"] });
      toast.success("Movimentação registrada com sucesso!");
    },
    onError: (error: AxiosError<{ error: string }>) => {
      toast.error(
        error.response?.data?.error || "Falha ao registrar movimentação."
      );
    },
  });
};
