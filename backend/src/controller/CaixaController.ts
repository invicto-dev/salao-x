import { Request, Response } from "express";
import { prisma } from "../config/database";
import {
  closeCaixaSchema,
  createCaixaSchema,
  moveCaixaSchema,
} from "../schemas/zod/caixaSchemas";
import { AuthRequest } from "../middlewares/auth";
import { CaixaMovimentacaoTipo, CaixaStatus } from "@prisma/client";

export class CaixaController {
  static async getAll(req: Request, res: Response) {
    const caixas = await prisma.caixa.findMany({
      orderBy: {
        dataFechamento: "asc",
      },
    });

    return res.status(200).json({
      sucess: true,
      data: caixas,
    });
  }

  static async open(req: AuthRequest, res: Response) {
    const validateData = createCaixaSchema.parse(req.body);

    const user = req.user;
    if (!user) {
      return res.status(401).json({
        sucess: false,
        error: "Você não está autenticado.",
      });
    }

    const openCaixa = await prisma.caixa.findFirst({
      where: { status: CaixaStatus.ABERTO },
    });

    if (openCaixa) {
      return res.status(409).json({
        success: false,
        error:
          "Já existe um caixa aberto. Feche o caixa atual antes de abrir um novo.",
      });
    }

    const newCaixa = await prisma.caixa.create({
      data: {
        ...validateData,
        status: CaixaStatus.ABERTO,
        funcionarioAberturaId: user.id,
      },
    });

    return res.status(200).json({
      success: true,
      data: newCaixa,
    });
  }

  static async hasSessionOpen(req: Request, res: Response) {
    const openCaixa = await prisma.caixa.findFirst({
      where: {
        status: CaixaStatus.ABERTO,
      },
    });

    return res.status(200).json({
      sucess: true,
      data: openCaixa,
    });
  }

  static async close(req: AuthRequest, res: Response) {
    const validateData = closeCaixaSchema.parse(req.body);
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        sucess: false,
        error: "Você não está autenticado.",
      });
    }

    const closedCaixa = await prisma.$transaction(async (tx) => {
      const openCaixa = await tx.caixa.findFirst({
        where: { status: CaixaStatus.ABERTO },
      });

      if (!openCaixa) {
        throw new Error("Você não tem um caixa aberto.");
      }

      const cashPaymentMethod = await tx.paymentMethod.findFirst({
        where: { isCash: true },
      });

      if (!cashPaymentMethod) {
        throw new Error(
          "Não foi possível encontrar o método de pagamento 'Dinheiro'."
        );
      }

      const salesInCash = await tx.salePayment.aggregate({
        _sum: { valor: true },
        where: {
          venda: { caixaId: openCaixa.id },
          metodoDePagamentoId: cashPaymentMethod.id,
        },
      });

      const totalSalesInCash = salesInCash._sum.valor
        ? salesInCash._sum.valor.toNumber()
        : 0;

      const totalEntradas = await tx.caixaMovimentacao.aggregate({
        _sum: { valor: true },
        where: { caixaId: openCaixa.id, tipo: CaixaMovimentacaoTipo.ENTRADA },
      });
      const valorTotalEntradas = totalEntradas._sum.valor
        ? totalEntradas._sum.valor.toNumber()
        : 0;

      const totalSaidas = await tx.caixaMovimentacao.aggregate({
        _sum: { valor: true },
        where: { caixaId: openCaixa.id, tipo: CaixaMovimentacaoTipo.SAIDA },
      });
      const valorTotalSaidas = totalSaidas._sum.valor
        ? totalSaidas._sum.valor.toNumber()
        : 0;

      const valorFechamentoCalculado =
        openCaixa.valorAbertura.toNumber() +
        totalSalesInCash +
        valorTotalEntradas -
        valorTotalSaidas;

      const diferenca =
        validateData.valorFechamentoInformado - valorFechamentoCalculado;

      const updateCaixa = await tx.caixa.update({
        where: { id: openCaixa.id },
        data: {
          ...validateData,
          status: CaixaStatus.FECHADO,
          dataFechamento: new Date(),
          funcionarioFechamentoId: user.id,
          valorFechamentoCalculado,
          diferenca,
        },
      });

      return updateCaixa;
    });

    return res.status(200).json({
      success: true,
      data: closedCaixa,
    });
  }

  static async move(req: AuthRequest, res: Response) {
    const validateData = moveCaixaSchema.parse(req.body);
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Você não está autenticado.",
      });
    }

    const newMovement = await prisma.$transaction(async (tx) => {
      const openCaixa = await tx.caixa.findFirst({
        where: { status: CaixaStatus.ABERTO },
      });

      if (!openCaixa) {
        throw new Error(
          "Você não tem um caixa aberto para fazer movimentações."
        );
      }

      const movement = await tx.caixaMovimentacao.create({
        data: {
          ...validateData,
          caixaId: openCaixa.id,
          funcionarioId: user.id,
        },
      });

      return movement;
    });

    return res.status(201).json({ success: true, data: newMovement });
  }
}
