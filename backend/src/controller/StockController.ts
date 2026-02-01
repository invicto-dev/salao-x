import { Request, Response } from "express";
import { prisma } from "../config/database";
import { ApprovalStatus, Prisma, Role } from "@prisma/client";
import { AuthRequest } from "../middlewares/auth";
import { StockService } from "../services/StockService";
import bcrypt from "bcryptjs";

export class StockController {
  /**
   * Retorna os KPIs do dashboard de estoque.
   */
  static async getKpis(req: Request, res: Response) {
    const products = await prisma.product.findMany({
      where: { contarEstoque: true, ativo: true },
    });

    if (products.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          totalProdutos: 0,
          valorTotalEstoque: 0,
          produtosEstoqueBaixo: 0,
        },
      });
    }

    let valorTotalEstoque = 0;
    let produtosEstoqueBaixo = 0;

    for (const product of products) {
      const estoqueAtual = product.estoqueAtual.toNumber();
      valorTotalEstoque += estoqueAtual * (product.custo?.toNumber() ?? 0);
      if (
        product.estoqueMinimo &&
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
   * Cria uma nova movimentação de estoque com validação hierárquica.
   */
  static async createMovement(req: AuthRequest, res: Response) {
    const { managerPassword, ...movementData } = req.body;

    if (!movementData || Object.keys(movementData).length === 0) {
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

    // Validação Hierárquica
    const isManager = [Role.ROOT, Role.ADMIN, Role.GERENTE].includes(user.role);
    if (!isManager) {
      if (!managerPassword) {
        return res.status(403).json({
          success: false,
          error: "Senha de gerente obrigatória para esta operação.",
          requireManagerPassword: true,
        });
      }

      // Verificar senha do gerente
      const managers = await prisma.employee.findMany({
        where: {
          role: { in: [Role.ROOT, Role.ADMIN, Role.GERENTE] },
          ativo: true,
        },
      });

      let authorized = false;
      for (const manager of managers) {
        if (await bcrypt.compare(managerPassword, manager.senha)) {
          authorized = true;
          break;
        }
      }

      if (!authorized) {
        return res.status(401).json({
          success: false,
          error: "Senha de gerente inválida.",
        });
      }
    }

    const settings = await prisma.setting.findFirst();
    let status: ApprovalStatus = ApprovalStatus.APROVADO;
    if (settings?.exigirAprovacaoEstoque) {
      status = ApprovalStatus.PENDENTE;
    }

    try {
      const newMovement = await StockService.registerMovement({
        ...movementData,
        solicitadoPorId: user.id,
        status: status,
      });

      return res.status(201).json({ success: true, data: newMovement });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
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

    const updatedMovement = await prisma.$transaction(async (tx) => {
      const updated = await tx.stockMovement.update({
        where: { id: movementId },
        data: {
          status: newStatus,
          aprovadoPorId: approver.id,
          dataAprovacao: new Date(),
          motivoRejeicao:
            newStatus === ApprovalStatus.REJEITADO ? rejectionReason : null,
        },
      });

      // Se aprovado, atualizar o estoqueAtual no produto
      if (newStatus === ApprovalStatus.APROVADO) {
        await tx.product.update({
          where: { id: updated.produtoId },
          data: {
            estoqueAtual: {
              increment: updated.quantidade,
            },
          },
        });
      }

      return updated;
    });

    return res.status(200).json({ success: true, data: updatedMovement });
  }
}
