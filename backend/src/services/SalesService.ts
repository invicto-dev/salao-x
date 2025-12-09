import { prisma } from "../config/database";
import {
  ApprovalStatus,
  Prisma,
  SaleStatus,
  StockMovementReason,
  StockMovementType,
} from "@prisma/client";
import { AsaasService } from "./AsaasService";
import { CaixaService } from "./CaixaService";

export class SalesService {
  static async getAll(params: Params) {
    const { search, status } = params;
    const whereClause: Prisma.SaleWhereInput = {};

    if (search && search.trim() !== "") {
      whereClause.OR = [
        { id: { contains: search, mode: "insensitive" } },
        { cliente: { nome: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (status) whereClause.status = params.status as SaleStatus;

    return prisma.sale.findMany({
      where: whereClause,
      include: {
        cliente: true,
        funcionario: true,
        itens: { include: { produto: true, servico: true } },
        pagamentos: { include: { metodoDePagamento: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getById(id: string) {
    const sale = await prisma.sale.findUnique({
      where: { id },
      include: {
        cliente: true,
        funcionario: true,
        itens: { include: { produto: true, servico: true } },
        pagamentos: { include: { metodoDePagamento: true } },
      },
    });

    if (!sale) throw new Error("Sale not found");
    return sale;
  }

  private static async _finalizeSaleTransaction(
    tx: Prisma.TransactionClient,
    {
      saleId,
      pagamentos,
      clienteId,
      itens,
      user,
    }: {
      saleId: string;
      pagamentos: Sales.PaymentPayload[];
      clienteId?: string;
      itens: Sales.ItemPayload[];
      user: { id: string };
    }
  ) {
    const crediarioMethod = await tx.paymentMethod.findUnique({
      where: { integration: "ASAAS_CREDIT" },
    });
    if (!crediarioMethod)
      throw new Error("Método de pagamento de crediário não configurado.");

    const paymentsToCreate = [];

    for (const pag of pagamentos) {
      if (pag.metodoDePagamentoId === crediarioMethod.id) {
        if (!clienteId)
          throw new Error(
            "Cliente é obrigatório para pagamentos em crediário."
          );
        const cliente = await tx.customer.findUnique({
          where: { id: clienteId },
        });

        if (!cliente || !cliente.paymentDueDay || !cliente.cpfCnpj)
          throw new Error(
            `Você deve informar um cliente e configura-lo corretamente para vender com o metodo de pagamento ${crediarioMethod.nome}.`
          );

        const asaasCustomerId = await AsaasService.getOrCreateCustomer(cliente);
        if (asaasCustomerId !== cliente.asaasCustomerId) {
          await tx.customer.update({
            where: { id: clienteId },
            data: { asaasCustomerId },
          });
        }

        const charge = await AsaasService.createCharge(
          saleId,
          asaasCustomerId,
          pag.valor,
          cliente.paymentDueDay,
          pag.installmentCount,
          Number(cliente.interest),
          Number(cliente.fine)
        );
        paymentsToCreate.push({
          metodoDePagamentoId: pag.metodoDePagamentoId,
          valor: pag.valor,
          observacao: pag.observacao || null,
          externalChargeId: charge.id,
          externalChargeUrl: charge.invoiceUrl,
          installmentCount: pag.installmentCount || null,
        });
      } else {
        paymentsToCreate.push({
          metodoDePagamentoId: pag.metodoDePagamentoId,
          valor: pag.valor,
          observacao: pag.observacao || null,
          installmentCount: pag.installmentCount || null,
        });
      }
    }

    await tx.sale.update({
      where: { id: saleId },
      data: { pagamentos: { create: paymentsToCreate } },
    });

    const productItems = itens.filter((item) => item.produtoId);

    if (productItems.length > 0) {
      const stockMovements = productItems.map((item) => ({
        produtoId: item.produtoId!,
        saleId,
        quantidade: item.contarEstoque ? -Math.abs(item.quantidade) : 0,
        tipo: StockMovementType.SAIDA,
        motivo: StockMovementReason.VENDA,
        status: ApprovalStatus.APROVADO,
        solicitadoPorId: user.id,
      }));
      await tx.stockMovement.createMany({ data: stockMovements });
    }
  }

  private static _calculateTransactionDetails(
    itens: Sales.ItemPayload[],
    desconto?: Sales.increaseOrDecrease,
    acrescimo?: Sales.increaseOrDecrease
  ) {
    const finalItens = [
      ...itens.map((item) => ({
        ...item,
        subtotal: item.preco * item.quantidade,
      })),
    ];

    const subtotal = finalItens.reduce((acc, item) => acc + item.subtotal, 0);
    let total = subtotal;

    if (desconto && desconto.value > 0) {
      const discountValue =
        desconto.type === "VALOR"
          ? desconto.value
          : (subtotal * desconto.value) / 100;
      total -= discountValue;
      finalItens.push({
        nome: `Desconto`,
        quantidade: 1,
        preco: -discountValue,
        subtotal: -discountValue,
      });
    }

    if (acrescimo && acrescimo.value > 0) {
      const surchargeValue =
        acrescimo.type === "VALOR"
          ? acrescimo.value
          : (subtotal * acrescimo.value) / 100;
      total += surchargeValue;
      finalItens.push({
        nome: `Acréscimo`,
        quantidade: 1,
        preco: surchargeValue,
        subtotal: surchargeValue,
      });
    }

    return { finalItens, subtotal, total };
  }

  static async create(payload: Sales.CreatePayload) {
    const {
      clienteId,
      itens,
      pagamentos,
      user,
      acrescimo,
      desconto,
      ...saleData
    } = payload;

    const openCaixa = await CaixaService.getOpenCaixaOrFail();

    const { finalItens, subtotal, total } = this._calculateTransactionDetails(
      itens,
      desconto,
      acrescimo
    );

    const newSale = await prisma.$transaction(async (tx) => {
      const sale = await tx.sale.create({
        data: {
          ...saleData,
          clienteId,
          status: saleData.status || SaleStatus.PAGO,
          caixaId: openCaixa.id,
          subtotal,
          total,
          itens: {
            create: finalItens.map(({ contarEstoque, ...item }) => item),
          },
          funcionarioId: user.id,
        },
      });

      if (
        sale.status === SaleStatus.PAGO &&
        pagamentos &&
        pagamentos.length > 0
      ) {
        await this._finalizeSaleTransaction(tx, {
          saleId: sale.id,
          pagamentos,
          clienteId,
          itens,
          user,
        });
      }

      return sale;
    });

    return prisma.sale.findUnique({
      where: { id: newSale.id },
      include: { itens: true, pagamentos: true },
    });
  }

  static async update(payload: Sales.CreatePayload) {
    const {
      clienteId,
      itens,
      pagamentos,
      user,
      acrescimo,
      desconto,
      ...saleData
    } = payload;
  }

  static async finalize(
    saleId: string,
    payload: { pagamentos: Sales.PaymentPayload[]; user: { id: string } }
  ) {
    const { pagamentos, user } = payload;

    return prisma.$transaction(async (tx) => {
      const saleToFinalize = await tx.sale.findUnique({
        where: { id: saleId },
        include: { itens: true },
      });

      if (!saleToFinalize) throw new Error("Venda não encontrada.");
      if (saleToFinalize.status !== SaleStatus.PENDENTE)
        throw new Error("Esta venda não pode ser finalizada.");

      // Mapeia os itens para o formato que _finalizeSaleTransaction espera
      const saleItemsPayload = saleToFinalize.itens.map((item) => ({
        ...item,
        preco: Number(item.preco),
      }));

      // Reutiliza a mesma lógica de finalização!
      await this._finalizeSaleTransaction(tx, {
        saleId,
        pagamentos,
        clienteId: saleToFinalize.clienteId || undefined,
        itens: saleItemsPayload,
        user,
      });

      // Atualiza o status da venda para PAGO
      await tx.sale.update({
        where: { id: saleId },
        data: { status: SaleStatus.PAGO },
      });

      return tx.sale.findUnique({
        where: { id: saleId },
        include: { itens: true, pagamentos: true },
      });
    });
  }

  static async updateStatus(
    saleId: string,
    payload: Sales.UpdateStatusPayload
  ) {
    const { status, user } = payload;

    if (status === SaleStatus.CANCELADO) {
      return prisma.$transaction(async (tx) => {
        const saleToCancel = await tx.sale.findUnique({
          where: { id: saleId },
          include: {
            itens: { where: { produtoId: { not: null } } },
            pagamentos: true,
          },
        });

        if (!saleToCancel) throw new Error("Sale not found.");
        if (saleToCancel.status === SaleStatus.CANCELADO)
          throw new Error("This sale has already been canceled.");

        const pagamentosAsaas = saleToCancel.pagamentos.filter(
          (p) => p.externalChargeId
        );

        for (const pag of pagamentosAsaas) {
          await AsaasService.cancelCharge(pag.externalChargeId!);
        }

        if (saleToCancel.itens.length > 0) {
          const stockReversals = saleToCancel.itens.map((item) => ({
            produtoId: item.produtoId!,
            saleId: saleToCancel.id,
            quantidade: Math.abs(item.quantidade),
            tipo: StockMovementType.ENTRADA,
            motivo: StockMovementReason.CANCELAMENTO_VENDA,
            status: ApprovalStatus.APROVADO,
            solicitadoPorId: user.id,
          }));
          await tx.stockMovement.createMany({ data: stockReversals });
        }

        return tx.sale.update({
          where: { id: saleId },
          data: { status: SaleStatus.CANCELADO },
        });
      });
    } else {
      return prisma.sale.update({
        where: { id: saleId },
        data: { status },
      });
    }
  }
}
