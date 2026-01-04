import { Prisma } from "@prisma/client";
import { prisma } from "../config/database";

export class ServicesService {
  /**
   * Gera o próximo código sequencial para um serviço.
   * Ex: Se o último for SERV-1023, este retornará SERV-1024.
   * @private
   */
  static async generateNextServiceCode(): Promise<string> {
    const lastService = await prisma.service.findFirst({
      where: {
        codigo: {
          startsWith: "SERV-",
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    let nextNumber = 1000;
    if (lastService && lastService.codigo) {
      const lastNumber = parseInt(lastService.codigo.split("-")[1]);
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }

    return `SERV-${nextNumber}`;
  }

  static async getAll(params: Service.Params) {
    const { search, status } = params;

    const whereClause: Prisma.ServiceWhereInput = {};

    if (status) whereClause.ativo = status == "true";
    if (search && search.trim() !== "") {
      whereClause.OR = [
        { nome: { contains: search, mode: "insensitive" } },
        { codigo: { contains: search, mode: "insensitive" } },
      ];
    }

    const services = await prisma.service.findMany({
      where: whereClause,
      include: { categoria: { select: { nome: true } } },
      orderBy: { nome: "asc" },
    });

    if (services.length === 0) {
      return [];
    }
    return services.map((s) => ({ ...s, categoria: s.categoria?.nome }));
  }
}
