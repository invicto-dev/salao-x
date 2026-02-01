import {
  StockMovementType,
  StockMovementReason,
  ApprovalStatus,
  Prisma,
} from "@prisma/client";
import { prisma } from "../config/database";
import { StockService } from "./StockService";

/**
 * Service responsible for managing products and their stock movements.
 *
 * Provides methods to:
 * - Create products
 * - Automatically register an initial stock entry if provided
 *
 * All operations are executed within a transaction to ensure data consistency.
 */
export class ProductService {
  /**
   * Gera o próximo código sequencial para um produto.
   * Ex: Se o último for PROD-1023, este retornará PROD-1024.
   * @private
   */
  private static async generateNextProductCode(): Promise<string> {
    const lastProduct = await prisma.product.findFirst({
      where: {
        codigo: {
          startsWith: "PROD-",
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    let nextNumber = 1001;
    if (lastProduct && lastProduct.codigo) {
      const lastNumber = parseInt(lastProduct.codigo.split("-")[1]);
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }

    return `PROD-${nextNumber}`;
  }

  /**
   * Creates a new product and, if an initial stock quantity is provided,
   * registers an "Entrada" stock movement.
   *
   * - The whole operation runs inside a transaction to ensure atomicity.
   * - If the user is not provided, the operation will fail.
   *
   * @param payload - Object containing product data, optional initial stock, and user information.
   * @returns The created product entity.
   * @throws If the user ID is missing or the transaction fails.
   *
   *
   */
  static async create(payload: Product.CreatePayload) {
    const { estoqueInicial, user, ...productData } = payload;

    if (!user || !user.id) {
      throw new Error("User ID is required to create a product.");
    }

    if (!productData.codigo || productData.codigo.trim() === "") {
      productData.codigo = await this.generateNextProductCode();
    }

    const newProduct = await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          ...productData,
          estoqueAtual: 0, // Será atualizado pelo StockService.registerMovement
        },
      });

      // If initial stock is provided, register stock movement
      if (estoqueInicial && estoqueInicial > 0) {
        await StockService.registerMovement(
          {
            produtoId: product.id,
            quantidade: estoqueInicial,
            tipo: StockMovementType.ENTRADA,
            motivo: StockMovementReason.AJUSTE_INVENTARIO,
            status: ApprovalStatus.APROVADO,
            observacao: "Initial stock added at product creation.",
            solicitadoPorId: user.id,
          },
          tx
        );
      }

      return product;
    });

    return newProduct;
  }

  static async getAll(params: Product.Params) {
    const { search, categoryId, status, contarEstoque } = params;

    const whereClause: Prisma.ProductWhereInput = {};

    if (status) whereClause.ativo = status == "true";
    if (categoryId) whereClause.categoriaId = categoryId;
    if (contarEstoque) whereClause.contarEstoque = contarEstoque === "true";
    if (search && search.trim() !== "") {
      whereClause.OR = [
        { nome: { contains: search, mode: "insensitive" } },
        { codigo: { contains: search, mode: "insensitive" } },
      ];
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: { categoria: { select: { nome: true } } },
      orderBy: { nome: "asc" },
    });

    return products.map((product) => ({
      ...product,
      estoqueAtual: product.estoqueAtual?.toNumber() ?? 0,
      categoria: product.categoria?.nome,
    }));
  }
}
