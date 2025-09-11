import { Request, Response } from "express";

import { prisma } from "../config/database";

export class ProductsController {
  static async getProducts(req: Request, res: Response) {
    try {
      const products = await prisma.product.findMany();

      return res.status(200).json({
        success: true,
        data: products,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error,
      });
    }
  }

  static async getProduct(req: Request, res: Response) {
    try {
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
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error,
      });
    }
  }

  static async createProduct(req: Request, res: Response) {
    try {
      const { body } = req.body;

      if (!body) {
        return res.status(400).json({
          success: false,
          error: "Nenhuma informação do produto fornecida",
        });
      }

      const product = await prisma.product.create({
        data: body,
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          error: "Não foi possível criar o produto",
        });
      }

      return res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error,
      });
    }
  }

  static async deleteProduct(req: Request, res: Response) {
    try {
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
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error,
      });
    }
  }

  static async updateProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { body } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: "Nenhum ID fornecido",
        });
      }

      if (!body) {
        return res.status(400).json({
          success: false,
          error: "Nenhuma informação do produto fornecida",
        });
      }

      const product = await prisma.product.update({
        where: { id },
        data: body,
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          error: "Não foi possível encontrar o produto com o ID fornecido",
        });
      }

      return res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error,
      });
    }
  }
}
