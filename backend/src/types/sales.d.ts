// NOVO ARQUIVO
import { SaleStatus } from "@prisma/client";

declare global {
  namespace Sales {
    type increaseOrDecrease = {
      value: number;
      type: "PORCENTAGEM" | "VALOR";
    };
    interface ItemPayload {
      nome: string;
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
      troco?: number;
      status?: SaleStatus;
      itens: ItemPayload[];
      pagamentos: PaymentPayload[];
      user: { id: string };
      acrescimo?: increaseOrDecrease;
      desconto?: increaseOrDecrease;
    }

    interface UpdateStatusPayload {
      status: SaleStatus;
      user: { id: string };
    }
  }
}

export {};
