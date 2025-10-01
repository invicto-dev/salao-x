import { prisma } from "../config/database";
import {
  ApprovalStatus,
  CaixaStatus,
  PaymentMethod,
  SalePayment,
  SaleStatus,
  StockMovementReason,
  StockMovementType,
} from "@prisma/client";
import { AsaasService } from "./AsaasService";

/**
 * Service responsible for handling sales operations.
 *
 * Includes features such as:
 * - Retrieving sales (all or by ID)
 * - Creating new sales (with payments and stock movements)
 * - Updating the status of sales (including cancellation and stock reversal)
 */
export class SalesService {
  /**
   * Retrieves all sales from the database.
   *
   * @returns A list of sales with related customer, employee, items, and payments.
   */
  static async getAll() {
    return prisma.sale.findMany({
      include: {
        cliente: true,
        funcionario: true,
        itens: { include: { produto: true, servico: true } },
        pagamentos: { include: { metodoDePagamento: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Retrieves a specific sale by its ID.
   *
   * @param id - The sale ID.
   * @returns The sale with related entities.
   * @throws If the sale is not found.
   */
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

  /**
   * Creates a new sale with items, payments, and stock movements.
   *
   * Handles the following:
   * - Ensures there is an open cash register (`Caixa`).
   * - Validates and processes "crediário" (credit) payments through Asaas.
   * - Creates charges in Asaas and updates their references.
   * - Registers stock movements for product sales.
   *
   * @param payload - The sale creation payload.
   * @returns The newly created sale with its items and payments.
   * @throws If no open cash register exists, or if payment/customer validation fails.
   */
  static async create(payload: Sales.CreatePayload) {
    const { clienteId, funcionarioId, itens, pagamentos, user, ...saleData } =
      payload;

    const openCaixa = await prisma.caixa.findFirst({
      where: { status: CaixaStatus.ABERTO },
    });
    if (!openCaixa)
      throw new Error(
        "No open cash register found. Open a register to start sales."
      );

    const crediarioMethod = await prisma.paymentMethod.findUnique({
      where: { integration: "ASAAS_CREDIT" },
    });
    if (!crediarioMethod)
      throw new Error("Credit payment method not configured in the system.");

    const newSale = await prisma.$transaction(async (tx) => {
      const pagamentosParaCriar = [];
      const chargesToUpdate: { chargeId: string }[] = [];

      for (const pag of pagamentos) {
        if (pag.metodoDePagamentoId === crediarioMethod.id) {
          if (!clienteId)
            throw new Error("A customer must be selected for credit payments.");
          const cliente = await tx.customer.findUnique({
            where: { id: clienteId },
          });
          if (!cliente || !cliente.paymentDueDay || !cliente.cpf)
            throw new Error(
              "Customer not eligible for credit (must have CPF and Due Day defined)."
            );

          const asaasCustomerId = await AsaasService.getOrCreateCustomer(
            cliente
          );
          if (asaasCustomerId !== cliente.asaasCustomerId) {
            await tx.customer.update({
              where: { id: clienteId },
              data: { asaasCustomerId },
            });
          }

          const charge = await AsaasService.createCharge(
            asaasCustomerId,
            pag.valor,
            cliente.paymentDueDay,
            pag.installmentCount,
            Number(cliente.interest),
            Number(cliente.fine)
          );
          chargesToUpdate.push({ chargeId: charge.id });
          pagamentosParaCriar.push({
            metodoDePagamentoId: pag.metodoDePagamentoId,
            valor: pag.valor,
            observacao: pag.observacao || null,
            externalChargeId: charge.id,
            externalChargeUrl: charge.invoiceUrl,
            installmentCount: pag.installmentCount || null,
          });
        } else {
          pagamentosParaCriar.push({
            metodoDePagamentoId: pag.metodoDePagamentoId,
            valor: pag.valor,
            observacao: pag.observacao || null,
            installmentCount: pag.installmentCount || null,
          });
        }
      }

      const sale = await tx.sale.create({
        data: {
          ...saleData,
          clienteId,
          funcionarioId,
          status: SaleStatus.PAGO,
          caixaId: openCaixa.id,
          itens: {
            create: itens.map((item) => ({
              produtoId: item.produtoId,
              servicoId: item.servicoId,
              quantidade: item.quantidade,
              preco: item.preco,
              subtotal: item.preco * item.quantidade,
            })),
          },
          pagamentos: { create: pagamentosParaCriar },
        },
      });

      for (const chargeInfo of chargesToUpdate) {
        await AsaasService.updateChargeReference(chargeInfo.chargeId, sale.id);
      }

      const itensDeProduto = itens.filter((item) => item.produtoId);
      if (itensDeProduto.length > 0) {
        const movimentacoesDeEstoque = itensDeProduto.map((item) => ({
          produtoId: item.produtoId!,
          saleId: sale.id,
          quantidade: item.contarEstoque ? -Math.abs(item.quantidade) : 0,
          tipo: StockMovementType.SAIDA,
          motivo: StockMovementReason.VENDA,
          status: ApprovalStatus.APROVADO,
          solicitadoPorId: user.id,
        }));
        await tx.stockMovement.createMany({ data: movimentacoesDeEstoque });
      }

      return sale;
    });

    return prisma.sale.findUnique({
      where: { id: newSale.id },
      include: { itens: true, pagamentos: true },
    });
  }

  /**
   * Updates the status of a sale.
   *
   * - If status is `CANCELADO`:
   *   - Cancels any associated Asaas charges.
   *   - Reverses stock movements (products are returned to stock).
   *   - Updates sale status to `CANCELADO`.
   *
   * - Otherwise:
   *   - Simply updates the sale status.
   *
   * @param saleId - The sale ID.
   * @param payload - The update payload containing the new status and user info.
   * @returns The updated sale record.
   * @throws If the sale is not found or already canceled.
   */
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
