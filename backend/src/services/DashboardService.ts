import { prisma } from "../config/database";
import { SaleStatus, ApprovalStatus } from "@prisma/client";

export class DashboardService {
  static async getStats(startDate?: string, endDate?: string) {
    const start = startDate
      ? new Date(startDate)
      : new Date(new Date().setDate(new Date().getDate() - 30));
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
      (p) => p.estoqueAtual.toNumber() <= (p.estoqueMinimo || 0),
    ).length;

    // 3. Top 5 produtos (pela quantidade vendida)
    // Alterado para findMany + processamento em memória para evitar erro de ambiguidade de coluna 'subtotal' no Postgres
    const productItems = await prisma.saleItem.findMany({
      where: {
        venda: wherePeriod,
        produtoId: { not: null },
      },
      select: {
        nome: true,
        produtoId: true,
        quantidade: true,
        subtotal: true,
      },
    });

    const productMap = new Map<
      string,
      { nome: string; vendas: number; receita: number }
    >();
    productItems.forEach((item) => {
      const id = item.produtoId!;
      const current = productMap.get(id) || {
        nome: item.nome,
        vendas: 0,
        receita: 0,
      };
      // Conversão segura para Decimal ou Number
      const qtd = Number(item.quantidade);
      const sub = (item.subtotal as any).toNumber
        ? (item.subtotal as any).toNumber()
        : Number(item.subtotal);
      current.vendas += qtd;
      current.receita += sub;
      productMap.set(id, current);
    });
    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.vendas - a.vendas)
      .slice(0, 5);

    // 4. Top 5 serviços (pela quantidade vendida)
    const serviceItems = await prisma.saleItem.findMany({
      where: {
        venda: wherePeriod,
        servicoId: { not: null },
      },
      select: {
        nome: true,
        servicoId: true,
        quantidade: true,
        subtotal: true,
      },
    });

    const serviceMap = new Map<
      string,
      { nome: string; vendas: number; receita: number }
    >();
    serviceItems.forEach((item) => {
      const id = item.servicoId!;
      const current = serviceMap.get(id) || {
        nome: item.nome,
        vendas: 0,
        receita: 0,
      };
      const qtd = Number(item.quantidade);
      const sub = (item.subtotal as any).toNumber
        ? (item.subtotal as any).toNumber()
        : Number(item.subtotal);
      current.vendas += qtd;
      current.receita += sub;
      serviceMap.set(id, current);
    });
    const topServices = Array.from(serviceMap.values())
      .sort((a, b) => b.vendas - a.vendas)
      .slice(0, 5);

    return {
      faturamentoTotal: salesStats._sum.total?.toNumber() ?? 0,
      totalVendas: salesStats._count.id,
      estoqueCritico: criticalCount,
      topProdutos: topProducts,
      topServices: topServices,
    };
  }
}
