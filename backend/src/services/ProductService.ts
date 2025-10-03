import {
  StockMovementType,
  StockMovementReason,
  ApprovalStatus,
} from "@prisma/client";
import { prisma } from "../config/database";

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

    const newProduct = await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: productData,
      });

      // If initial stock is provided, register stock movement
      if (estoqueInicial && estoqueInicial > 0) {
        await tx.stockMovement.create({
          data: {
            produtoId: product.id,
            quantidade: estoqueInicial,
            tipo: StockMovementType.ENTRADA,
            motivo: StockMovementReason.AJUSTE_INVENTARIO,
            status: ApprovalStatus.APROVADO,
            observacao: "Initial stock added at product creation.",
            solicitadoPorId: user.id,
          },
        });
      }

      return product;
    });

    return newProduct;
  }
}
