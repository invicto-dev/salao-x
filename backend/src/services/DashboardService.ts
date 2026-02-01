import { prisma } from "../config/database";
import { SaleStatus, ApprovalStatus } from "@prisma/client";

export class DashboardService {
  static async getStats(startDate?: string, endDate?: string) {
    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
    const end = endDate ? new Date(endDate) : new Date();

    const wherePeriod: any = {
      createdAt: {
        gte: start,
        lte: end,
      },
      status: SaleStatus.PAGO,
    };

    // 1. Faturamento total e total de vendas
    const salesStats = await prisma.sale.aggregate({
      where: wherePeriod,
      _sum: {
        total: true,
      },
      _count: {
        id: true,
      },
    });

    // 2. Produtos com estoque crítico (estoqueAtual <= estoqueMinimo)
    // Isso é um snapshot, ignoramos o período para esta métrica específica pois estoque é atual.
    const criticalProducts = await prisma.product.findMany({
      where: {
        ativo: true,
        contarEstoque: true,
      },
    });
    const criticalCount = criticalProducts.filter(
      (p) => p.estoqueAtual.toNumber() <= (p.estoqueMinimo || 0)
    ).length;

    // 3. Top 5 produtos (pela quantidade vendida)
    const topProducts = await prisma.saleItem.groupBy({
      by: ['nome', 'produtoId'],
      where: {
        venda: wherePeriod,
        produtoId: { not: null }
      },
      _sum: {
        quantidade: true,
        subtotal: true
      },
      orderBy: {
        _sum: {
          quantidade: 'desc'
        }
      },
      take: 5
    });

    // 4. Top 5 serviços (pela quantidade vendida)
    const topServices = await prisma.saleItem.groupBy({
      by: ['nome', 'servicoId'],
      where: {
        venda: wherePeriod,
        servicoId: { not: null }
      },
      _sum: {
        quantidade: true,
        subtotal: true
      },
      orderBy: {
        _sum: {
          quantidade: 'desc'
        }
      },
      take: 5
    });

    return {
      faturamentoTotal: salesStats._sum.total?.toNumber() ?? 0,
      totalVendas: salesStats._count.id,
      estoqueCritico: criticalCount,
      topProdutos: topProducts.map(p => ({
        nome: p.nome,
        vendas: p._sum.quantidade,
        receita: p._sum.subtotal?.toNumber() ?? 0
      })),
      topServicos: topServices.map(s => ({
        nome: s.nome,
        vendas: s._sum.quantidade,
        receita: s._sum.subtotal?.toNumber() ?? 0
      }))
    };
  }
}
