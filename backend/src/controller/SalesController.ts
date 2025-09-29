import { Request, Response } from "express";
import { prisma } from "../config/database";
import {
  ApprovalStatus,
  CaixaStatus,
  StockMovementReason,
  StockMovementType,
} from "@prisma/client";
import { AuthRequest } from "../middlewares/auth";

export class SalesController {
  static async getAll(req: Request, res: Response) {
    const vendas = await prisma.sale.findMany({
      include: {
        cliente: true,
        funcionario: true,
        itens: {
          include: { produto: true, servico: true },
        },
        pagamentos: { include: { metodoDePagamento: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json({ sucess: true, data: vendas });
  }

  static async getById(req: Request, res: Response) {
    const { id } = req.params;
    const venda = await prisma.sale.findUnique({
      where: { id },
      include: {
        cliente: true,
        funcionario: true,
        itens: { include: { produto: true, servico: true } },
        pagamentos: { include: { metodoDePagamento: true } },
      },
    });
    if (!venda) return res.status(404).json({ error: "Venda não encontrada" });

    res.status(200).json({ sucess: true, data: venda });
  }

  static async create(req: AuthRequest, res: Response) {
    const {
      clienteId,
      funcionarioId,
      itens,
      subtotal,
      total,
      troco,
      pagamentos,
      desconto,
      acrescimo,
      status,
    } = req.body;

    const user = req.user;
    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: "Usuário não autenticado." });
    }

    const openCaixa = await prisma.caixa.findFirst({
      where: { status: CaixaStatus.ABERTO },
    });

    if (!openCaixa) {
      return res.status(404).json({
        success: false,
        error: "Nenhum caixa aberto. Abra um caixa para iniciar as vendas.",
      });
    }

    const novaVenda = await prisma.$transaction(async (tx) => {
      const venda = await tx.sale.create({
        data: {
          clienteId,
          funcionarioId,
          subtotal,
          total,
          troco: troco || 0,
          desconto: desconto || 0,
          acrescimo: acrescimo || 0,
          status: status || "PAGO",
          caixaId: openCaixa.id,
          itens: {
            create: itens.map((item: any) => ({
              produtoId: item.produtoId,
              servicoId: item.servicoId,
              quantidade: item.quantidade,
              preco: item.preco,
              subtotal: item.preco * item.quantidade,
            })),
          },
          pagamentos: {
            create: pagamentos.map((pag: any) => ({
              metodoDePagamentoId: pag.metodoDePagamentoId,
              valor: pag.valor,
              observacao: pag.observacao || null,
            })),
          },
        },
      });

      const itensDeProduto = itens.filter((item: any) => item.produtoId);

      if (itensDeProduto.length > 0) {
        const movimentacoesDeEstoque = itensDeProduto.map((item: any) => ({
          produtoId: item.produtoId,
          saleId: venda.id,
          quantidade: item.contarEstoque ? -Math.abs(item.quantidade) : 0,
          tipo: "SAIDA",
          motivo: "VENDA",
          status: ApprovalStatus.APROVADO,
          solicitadoPorId: user.id,
        }));

        await tx.stockMovement.createMany({
          data: movimentacoesDeEstoque,
        });
      }

      return venda;
    });

    const vendaCompleta = await prisma.sale.findUnique({
      where: { id: novaVenda.id },
      include: {
        itens: true,
        pagamentos: true,
      },
    });

    res.status(201).json({ success: true, data: vendaCompleta });
  }

  static async updateStatus(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { status } = req.body;

    const user = req.user;
    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: "Usuário não autenticado." });
    }

    if (!["PENDENTE", "PAGO", "CANCELADO"].includes(status)) {
      return res.status(400).json({ error: "Status inválido" });
    }

    if (status === "CANCELADO") {
      const vendaCancelada = await prisma.$transaction(async (tx) => {
        const vendaExistente = await tx.sale.findUnique({
          where: { id },
          include: {
            itens: {
              where: { produtoId: { not: null } },
            },
          },
        });

        if (!vendaExistente) {
          throw new Error("Venda não encontrada.");
        }
        if (vendaExistente.status === "CANCELADO") {
          throw new Error("Esta venda já foi cancelada anteriormente.");
        }

        if (vendaExistente.itens.length > 0) {
          const movimentacoesDeRetorno = vendaExistente.itens.map((item) => ({
            produtoId: item.produtoId!,
            saleId: vendaExistente.id,
            quantidade: Math.abs(item.quantidade),
            tipo: StockMovementType.ENTRADA,
            motivo: StockMovementReason.CANCELAMENTO_VENDA,
            status: ApprovalStatus.APROVADO,
            solicitadoPorId: user.id,
          }));

          await tx.stockMovement.createMany({
            data: movimentacoesDeRetorno,
          });
        }

        const vendaAtualizada = await tx.sale.update({
          where: { id },
          data: { status: "CANCELADO" },
        });

        return vendaAtualizada;
      });

      return res.status(200).json({ success: true, data: vendaCancelada });
    } else {
      const venda = await prisma.sale.update({
        where: { id },
        data: { status },
      });
      res.status(200).json({ sucess: true, data: venda });
    }
  }
}
