import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { AxiosError } from "axios";
import {
  getStockProducts,
  getStockKpis,
  getRecentMovements,
  createStockMovement,
} from "@/api/stock";

// Hook para buscar a lista de produtos em estoque (com filtros)
export const useStockProducts = (filters: {
  search?: string;
  categoryId?: string;
  contarEstoque?: boolean;
}) => {
  return useQuery<Stock.StockProduct[]>({
    queryKey: ["get-stock-products", filters],
    queryFn: () => getStockProducts(filters),
  });
};

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
      // Ao criar uma movimentação, tudo muda: estoque, kpis, lista de movimentos.
      // Invalidamos tudo para garantir que a UI esteja 100% atualizada.
      queryClient.invalidateQueries({ queryKey: ["get-stock-products"] });
      queryClient.invalidateQueries({ queryKey: ["get-stock-kpis"] });
      queryClient.invalidateQueries({ queryKey: ["get-recent-movements"] });
      message.success("Movimentação registrada com sucesso!");
    },
    onError: (error: AxiosError<{ error: string }>) => {
      message.error(
        error.response?.data?.error || "Falha ao registrar movimentação."
      );
    },
  });
};
