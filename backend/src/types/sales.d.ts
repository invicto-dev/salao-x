// NOVO ARQUIVO
import { SaleStatus } from "@prisma/client";

declare global {
  namespace Sales {
    interface ItemPayload {
      produtoId?: string;
      servicoId?: string;
      quantidade: number;
      preco: number;
      contarEstoque?: boolean;
    }

    interface PaymentPayload {
      metodoDePagamentoId: string;
      installmentCount?: number;
      valor: number;
      observacao?: string;
    }

    interface CreatePayload {
      clienteId?: string;
      funcionarioId?: string;
      subtotal: number;
      total: number;
      troco?: number;
      desconto?: number;
      acrescimo?: number;
      itens: ItemPayload[];
      pagamentos: PaymentPayload[];
      user: { id: string };
    }

    interface UpdateStatusPayload {
      status: SaleStatus;
      user: { id: string };
    }
  }
}

export {};
