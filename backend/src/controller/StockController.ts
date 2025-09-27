import { Request, Response } from "express";
import { prisma } from "../config/database"; // Assumindo que seu prisma client está aqui
import { ApprovalStatus, Role } from "@prisma/client";
import { AuthRequest } from "../middlewares/auth";

export class StockController {
  /**
   * Lista produtos com estoque calculado.
   */
  static async getProductsStock(req: Request, res: Response) {
    const { search, categoryId, contarEstoque } = req.query;

    const products = await prisma.product.findMany({
      where: {
        nome: { contains: search as string, mode: "insensitive" },
        categoriaId: categoryId as string,
        ativo: true,
        contarEstoque: contarEstoque ? contarEstoque === "true" : undefined,
      },
      include: { categoria: { select: { nome: true } } },
      orderBy: { nome: "asc" },
    });

    if (products.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const productIds = products.map((p) => p.id);
    const stockAggregates = await prisma.stockMovement.groupBy({
      by: ["produtoId"],
      _sum: { quantidade: true },
      where: {
        produtoId: { in: productIds },
        status: ApprovalStatus.APROVADO,
      },
    });

    const stockMap = new Map<string, number>();
    stockAggregates.forEach((agg) => {
      stockMap.set(agg.produtoId, agg._sum.quantidade?.toNumber() ?? 0);
    });

    const productsWithStock = products.map((product) => ({
      ...product,
      estoqueAtual: stockMap.get(product.id) ?? 0,
      categoria: product.categoria?.nome,
    }));

    return res.status(200).json({ success: true, data: productsWithStock });
  }

  /**
   * Retorna os KPIs do dashboard de estoque.
   */
  static async getKpis(req: Request, res: Response) {
    const products = await prisma.product.findMany({
      where: { contarEstoque: true, ativo: true },
    });

    const productIds = products.map((p) => p.id);
    if (productIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          totalProdutos: 0,
          valorTotalEstoque: 0,
          produtosEstoqueBaixo: 0,
        },
      });
    }

    const stockAggregates = await prisma.stockMovement.groupBy({
      by: ["produtoId"],
      _sum: { quantidade: true },
      where: {
        produtoId: { in: productIds },
        status: ApprovalStatus.APROVADO,
      },
    });

    const stockMap = new Map<string, number>();
    stockAggregates.forEach((agg) =>
      stockMap.set(agg.produtoId, agg._sum.quantidade?.toNumber() ?? 0)
    );

    let valorTotalEstoque = 0;
    let produtosEstoqueBaixo = 0;

    for (const product of products) {
      const estoqueAtual = stockMap.get(product.id) ?? 0;
      valorTotalEstoque += estoqueAtual * (product.custo?.toNumber() ?? 0);
      if (
        product.estoqueMinimo &&
        estoqueAtual > 0 &&
        estoqueAtual <= product.estoqueMinimo
      ) {
        produtosEstoqueBaixo++;
      }
    }

    const kpis = {
      totalProdutos: products.length,
      valorTotalEstoque,
      produtosEstoqueBaixo,
    };

    return res.status(200).json({ success: true, data: kpis });
  }

  static async getRecentMovements(req: Request, res: Response) {
    const limit = parseInt(req.query.limit as string);

    if (isNaN(limit)) {
      return res
        .status(400)
        .json({ success: false, error: "Limite inválido." });
    }

    const movements = await prisma.stockMovement.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        produto: { select: { nome: true } },
        createdAt: true,
        solicitadoPor: { select: { nome: true } },
        aprovadoPor: { select: { nome: true } },
        tipo: true,
        quantidade: true,
        status: true,
        motivo: true,
        motivoRejeicao: true,
        saleId: true,
        observacao: true,
      },
    });

    return res.status(200).json({ success: true, data: movements });
  }

  /**
   * Cria uma nova movimentação de estoque.
   */
  static async createMovement(req: AuthRequest, res: Response) {
    const body = req.body;

    if (!body || Object.keys(body).length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "Nenhuma informação fornecida." });
    }

    const user = req.user;
    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: "Usuário não autenticado." });
    }

    const settings = await prisma.setting.findFirst();

    let status: ApprovalStatus = ApprovalStatus.APROVADO;
    if (settings?.exigirAprovacaoEstoque /*  && user.role !== Role.ADMIN */) {
      status = ApprovalStatus.PENDENTE;
    }

    // Garante que a quantidade de saída seja negativa
    if (body.tipo === "SAIDA" && body.quantidade > 0) {
      body.quantidade = -Math.abs(body.quantidade);
    }

    const newMovement = await prisma.stockMovement.create({
      data: {
        ...body,
        solicitadoPorId: user.id,
        status: status,
      },
    });

    return res.status(201).json({ success: true, data: newMovement });
  }

  /**
   * Aprova ou rejeita uma movimentação de estoque.
   */
  static async approveOrRejectMovement(req: Request, res: Response) {
    const { id: movementId } = req.params;
    const { action, rejectionReason } = req.body;
    const approver = (req as any).user; // O middleware isAdmin já garante que é um admin

    if (!action || (action === "REJEITAR" && !rejectionReason)) {
      return res.status(400).json({
        success: false,
        error: "Ação (e motivo da rejeição, se aplicável) são obrigatórios.",
      });
    }

    const movement = await prisma.stockMovement.findUnique({
      where: { id: movementId },
    });
    if (!movement) {
      return res
        .status(404)
        .json({ success: false, error: "Movimentação não encontrada." });
    }
    if (movement.status !== ApprovalStatus.PENDENTE) {
      return res.status(400).json({
        success: false,
        error: `Esta movimentação não está pendente (status atual: ${movement.status}).`,
      });
    }

    const newStatus =
      action === "APROVAR" ? ApprovalStatus.APROVADO : ApprovalStatus.REJEITADO;

    const updatedMovement = await prisma.stockMovement.update({
      where: { id: movementId },
      data: {
        status: newStatus,
        aprovadoPorId: approver.id,
        dataAprovacao: new Date(),
        motivoRejeicao:
          newStatus === ApprovalStatus.REJEITADO ? rejectionReason : null,
      },
    });

    return res.status(200).json({ success: true, data: updatedMovement });
  }
}
