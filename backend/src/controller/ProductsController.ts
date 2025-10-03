import { Request, Response } from "express";

import { prisma } from "../config/database";
import {
  ApprovalStatus,
  StockMovementReason,
  StockMovementType,
} from "@prisma/client";
import { AuthRequest } from "../middlewares/auth";
import { productImportQueue } from "../lib/queue";
import { ProductService } from "../services/ProductService";

export class ProductsController {
  static async importCSV(req: AuthRequest, res: Response) {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "Nenhum arquivo enviado.",
      });
    }

    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, error: "Usuário não autenticado." });
    }

    const newJob = await prisma.importJob.create({
      data: {
        originalFilename: req.file.originalname,
        storedFilename: req.file.filename,
        status: "PENDENTE",
        createdByUserId: req.user.id,
      },
    });

    await productImportQueue.add("process-csv-file", {
      jobId: newJob.id,
    });

    return res.status(202).json({
      sucess: true,
      message: "A importação foi iniciada e será processada em segundo plano.",
      data: {
        jobId: newJob.id,
      },
    });
  }

  static async getProducts(req: Request, res: Response) {
    const { search, categoryId, contarEstoque } = req.query;

    const products = await prisma.product.findMany({
      where: {
        nome: { contains: search as string, mode: "insensitive" },
        categoriaId: categoryId as string,
        contarEstoque: contarEstoque ? contarEstoque === "true" : undefined,
      },
      include: { categoria: { select: { nome: true } } },
      orderBy: { nome: "asc" },
    });

    if (products.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const productIds = products.map((p) => p.id);
    const stockAggregates = await prisma.stockMovement.groupBy({
      by: ["produtoId"],
      _sum: { quantidade: true },
      where: {
        produtoId: { in: productIds },
        status: ApprovalStatus.APROVADO,
      },
    });

    const stockMap = new Map<string, number>();
    stockAggregates.forEach((agg) => {
      stockMap.set(agg.produtoId, agg._sum.quantidade?.toNumber() ?? 0);
    });

    const productsWithStock = products.map((product) => ({
      ...product,
      estoqueAtual: stockMap.get(product.id) ?? 0,
      categoria: product.categoria?.nome,
    }));

    return res.status(200).json({
      success: true,
      data: productsWithStock,
    });
  }

  static async getProduct(req: Request, res: Response) {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Nenhum ID fornecido",
      });
    }

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Não foi possível encontrar um produto com o ID fornecido",
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
    });
  }

  static async createProduct(req: AuthRequest, res: Response) {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, error: "Usuário não autenticado." });
    }

    const payload: Product.CreatePayload = {
      ...req.body,
      user: { id: req.user.id },
    };

    const newProduct = await ProductService.create(payload);

    return res.status(201).json({ success: true, data: newProduct });
  }

  static async deleteProduct(req: Request, res: Response) {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Nenhum ID fornecido",
      });
    }

    const product = await prisma.product.delete({
      where: { id },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Não foi possível excluir o produto com o ID fornecido",
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
    });
  }

  static async updateProduct(req: Request, res: Response) {
    const { id } = req.params;
    const { ...productData } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Nenhum ID fornecido",
      });
    }

    if (!productData) {
      return res.status(400).json({
        success: false,
        error: "Nenhuma informação do produto fornecida",
      });
    }

    const updateProduct = await prisma.product.update({
      where: { id },
      data: productData,
    });

    if (!updateProduct) {
      return res.status(404).json({
        success: false,
        error: "Não foi possível encontrar o produto com o ID fornecido",
      });
    }

    return res.status(200).json({
      success: true,
      data: updateProduct,
    });
  }
}
