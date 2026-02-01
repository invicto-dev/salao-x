import {
  StockMovementType,
  StockMovementReason,
  ApprovalStatus,
  Prisma,
} from "@prisma/client";
import { prisma } from "../config/database";

export interface StockMovementPayload {
  produtoId: string;
  tipo: StockMovementType;
  motivo: StockMovementReason;
  quantidade: number;
  solicitadoPorId: string;
  observacao?: string;
  status?: ApprovalStatus;
  saleId?: string;
  custoUnitario?: number;
}

export class StockService {
  /**
   * Registra uma movimentação de estoque e atualiza o saldo do produto.
   * Pode ser executado dentro de uma transação existente.
   */
  static async registerMovement(
    payload: StockMovementPayload,
    tx?: Prisma.TransactionClient
  ) {
    const {
      produtoId,
      tipo,
      motivo,
      quantidade,
      solicitadoPorId,
      observacao,
      status = ApprovalStatus.APROVADO,
      saleId,
      custoUnitario,
    } = payload;

    const client = tx || prisma;

    let adjustment = new Prisma.Decimal(quantidade);
    if (tipo === StockMovementType.SAIDA) {
      adjustment = adjustment.negated();
    } else if (tipo === StockMovementType.AJUSTE) {
      adjustment = new Prisma.Decimal(quantidade);
    }

    const execute = async (t: Prisma.TransactionClient) => {
      // 1. Criar a movimentação
      const movement = await t.stockMovement.create({
        data: {
          produtoId,
          tipo,
          motivo,
          quantidade: adjustment,
          solicitadoPorId,
          observacao,
          status,
          saleId,
          custoUnitario,
        },
      });

      // 2. Se a movimentação for aprovada, atualizar o estoqueAtual no produto
      if (status === ApprovalStatus.APROVADO) {
        await t.product.update({
          where: { id: produtoId },
          data: {
            estoqueAtual: {
              increment: adjustment,
            },
          },
        });
      }

      return movement;
    };

    if (tx) {
      return execute(tx);
    }

    return await prisma.$transaction(async (t) => {
      return execute(t);
    });
  }

  /**
   * Recalcula o estoque atual de um produto baseado em todo o histórico.
   * Útil para auditoria ou correção de inconsistências.
   */
  static async syncStock(produtoId: string) {
    const aggregate = await prisma.stockMovement.aggregate({
      where: {
        produtoId,
        status: ApprovalStatus.APROVADO,
      },
      _sum: {
        quantidade: true,
      },
    });

    const total = aggregate._sum.quantidade || new Prisma.Decimal(0);

    await prisma.product.update({
      where: { id: produtoId },
      data: {
        estoqueAtual: total,
      },
    });

    return total;
  }
}
