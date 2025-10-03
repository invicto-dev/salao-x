// NOVO ARQUIVO
import { Product } from "@prisma/client";

type ProductData = Omit<Product, "id" | "createdAt" | "updatedAt">;

declare global {
  namespace Product {
    interface CreatePayload extends Partial<ProductData> {
      nome: string;
      estoqueInicial?: number;
      user: { id: string };
    }
  }
}

export {};
