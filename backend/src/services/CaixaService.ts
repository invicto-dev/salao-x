import { prisma } from "../config/database";
import { CaixaStatus, CaixaMovimentacaoTipo } from "@prisma/client";

export class CaixaService {
  /**
   * Helper privado para buscar o caixa aberto. Lança um erro se não encontrar.
   * Usado internamente para evitar repetição.
   */
  static async getOpenCaixaOrFail() {
    const openCaixa = await prisma.caixa.findFirst({
      where: { status: CaixaStatus.ABERTO },
    });
    if (!openCaixa) {
      throw new Error("Nenhum caixa aberto encontrado.");
    }
    return openCaixa;
  }

  /**
   * Lógica centralizada para calcular os totais de um caixa.
   */
  static async calculateCaixaSummary(caixaId: string) {
    const cashPaymentMethod = await prisma.paymentMethod.findFirst({
      where: { isCash: true },
    });
    if (!cashPaymentMethod) {
      throw new Error("Método 'Dinheiro' não configurado.");
    }

    const salesInCashAgg = await prisma.salePayment.aggregate({
      _sum: { valor: true },
      where: {
        venda: { caixaId: caixaId },
        metodoDePagamentoId: cashPaymentMethod.id,
      },
    });
    const totalPagoEmDinheiro = salesInCashAgg._sum.valor?.toNumber() ?? 0;

    const changeGivenAgg = await prisma.sale.aggregate({
      _sum: { troco: true },
      where: { caixaId: caixaId },
    });
    const totalTrocoDevolvido = changeGivenAgg._sum.troco?.toNumber() ?? 0;

    const totalLiquidoVendasDinheiro =
      totalPagoEmDinheiro - totalTrocoDevolvido;

    const entradasAgg = await prisma.caixaMovimentacao.aggregate({
      _sum: { valor: true },
      where: { caixaId: caixaId, tipo: CaixaMovimentacaoTipo.ENTRADA },
    });
    const totalEntradas = entradasAgg._sum.valor?.toNumber() ?? 0;

    const saidasAgg = await prisma.caixaMovimentacao.aggregate({
      _sum: { valor: true },
      where: { caixaId: caixaId, tipo: CaixaMovimentacaoTipo.SAIDA },
    });
    const totalSaidas = saidasAgg._sum.valor?.toNumber() ?? 0;

    return {
      totalLiquidoVendasDinheiro,
      totalEntradas,
      totalSaidas,
    };
  }

  /**
   * Lógica para abrir um novo caixa.
   */
  static async open(data: Caixa.BodyOpen, funcionarioId: string) {
    const openCaixa = await prisma.caixa.findFirst({
      where: { status: CaixaStatus.ABERTO },
    });
    if (openCaixa) {
      throw new Error(
        "Já existe um caixa aberto. Feche o caixa atual antes de abrir um novo."
      );
    }

    return prisma.caixa.create({
      data: {
        ...data,
        status: CaixaStatus.ABERTO,
        funcionarioAberturaId: funcionarioId,
      },
    });
  }

  /**
   * Lógica para fechar o caixa aberto.
   */
  static async close(data: Caixa.BodyClose, funcionarioId: string) {
    return prisma.$transaction(async (tx) => {
      const openCaixa = await CaixaService.getOpenCaixaOrFail();
      const summary = await CaixaService.calculateCaixaSummary(openCaixa.id);

      const valorAbertura = openCaixa.valorAbertura.toNumber();

      const valorFechamentoCalculado =
        valorAbertura +
        summary.totalLiquidoVendasDinheiro +
        summary.totalEntradas -
        summary.totalSaidas;

      const diferenca =
        data.valorFechamentoInformado - valorFechamentoCalculado;

      return tx.caixa.update({
        where: { id: openCaixa.id },
        data: {
          ...data,
          status: CaixaStatus.FECHADO,
          dataFechamento: new Date(),
          funcionarioFechamentoId: funcionarioId,
          valorFechamentoCalculado,
          diferenca,
        },
      });
    });
  }

  /**
   * Lógica para movimentar o caixa (entrada/saída avulsa).
   */
  static async move(data: Caixa.BodyMoveCaixa, funcionarioId: string) {
    return prisma.$transaction(async (tx) => {
      const openCaixa = await CaixaService.getOpenCaixaOrFail();
      return tx.caixaMovimentacao.create({
        data: {
          ...data,
          caixaId: openCaixa.id,
          funcionarioId: funcionarioId,
        },
      });
    });
  }
}
