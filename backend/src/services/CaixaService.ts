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
    // 1. Busca todos os métodos de pagamento ativos para mapeamento (Nome, isCash, etc)
    const paymentMethods = await prisma.paymentMethod.findMany({
      where: { ativo: true },
    });

    // Cria um Map para acesso rápido (O(1)) pelo ID
    const methodsMap = new Map(paymentMethods.map((pm) => [pm.id, pm]));

    // 2. Agrupa as vendas por método de pagamento e soma os valores
    const paymentsAgg = await prisma.salePayment.groupBy({
      by: ["metodoDePagamentoId"],
      _sum: { valor: true },
      where: { venda: { caixaId: caixaId } },
    });

    // 3. Busca o total de troco (geralmente subtraído apenas do dinheiro)
    const changeGivenAgg = await prisma.sale.aggregate({
      _sum: { troco: true },
      where: { caixaId: caixaId },
    });
    const totalTroco = changeGivenAgg._sum.troco?.toNumber() ?? 0;

    // 4. Processa o detalhamento por método
    let totalVendasGeral = 0;
    let saldoFisicoDinheiro = 0; // Dinheiro real na gaveta (Entradas + Vendas Dinheiro - Troco - Saídas)

    const resumoPorMetodo = paymentsAgg.map((item) => {
      const method = methodsMap.get(item.metodoDePagamentoId);
      const valorBruto = item._sum.valor?.toNumber() ?? 0;

      totalVendasGeral += valorBruto;

      let valorLiquido = valorBruto;

      // Se for dinheiro, aplicamos a lógica de subtrair o troco para saber o líquido desse método
      if (method?.isCash) {
        valorLiquido -= totalTroco;
        saldoFisicoDinheiro += valorLiquido;
      }

      return {
        metodoId: item.metodoDePagamentoId,
        nome: method?.nome ?? "Desconhecido",
        isCash: method?.isCash ?? false,
        valorBruto, // Valor total vendido
        valorLiquido, // Valor descontando troco (se aplicável)
      };
    });

    // 5. Movimentações (Entradas e Saídas)
    const movimentacoesAgg = await prisma.caixaMovimentacao.groupBy({
      by: ["tipo"],
      _sum: { valor: true },
      where: { caixaId: caixaId },
    });

    const totalEntradas =
      movimentacoesAgg
        .find((m) => m.tipo === "ENTRADA")
        ?._sum.valor?.toNumber() ?? 0;
    const totalSaidas =
      movimentacoesAgg
        .find((m) => m.tipo === "SAIDA")
        ?._sum.valor?.toNumber() ?? 0;

    // Atualiza o saldo físico com as movimentações manuais
    saldoFisicoDinheiro += totalEntradas - totalSaidas;

    return {
      resumoPorMetodo, // Array detalhado (Dinheiro, Pix, Crediário...)
      totalVendasGeral, // Soma de tudo que foi vendido
      totalTroco, // Quanto saiu de troco
      totalEntradas,
      totalSaidas,
      saldoFisicoDinheiro, // O valor exato que deve ter em espécie na gaveta
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
        summary.saldoFisicoDinheiro +
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
