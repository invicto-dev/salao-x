import { Prisma } from "@prisma/client";
import { prisma } from "../config/database";

export class CategoriesService {
  static async getAll(params: Params) {
    const { search, status } = params;

    const whereClause: Prisma.CategoryWhereInput = {};

    if (status) whereClause.ativo = status == "true";
    if (search && search.trim() !== "") {
      whereClause.OR = [
        { nome: { contains: search, mode: "insensitive" } },
        { descricao: { contains: search, mode: "insensitive" } },
      ];
    }

    const categories = await prisma.category.findMany({
      where: whereClause,
      orderBy: { nome: "asc" },
    });

    if (categories.length === 0) {
      return [];
    }
    return categories;
  }
}
