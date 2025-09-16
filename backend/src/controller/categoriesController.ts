import { Request, Response } from "express";

import { prisma } from "../config/database";

export class CategoriesController {
  static async getCategories(req: Request, res: Response) {
    try {
      const categories = await prisma.category.findMany();

      return res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error,
      });
    }
  }

  static async getCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: "Nenhum ID fornecido",
        });
      }

      const category = await prisma.category.findUnique({
        where: { id },
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          error: "Não foi possível encontrar uma categoria com o ID fornecido",
        });
      }

      return res.status(200).json({
        success: true,
        data: category,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error,
      });
    }
  }

  static async createCategory(req: Request, res: Response) {
    try {
      const body = req.body;

      if (!body) {
        return res.status(400).json({
          success: false,
          error: "Nenhuma informação da categoria fornecida",
        });
      }

      const category = await prisma.category.create({
        data: body,
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          error: "Não foi possível criar a categoria",
        });
      }

      return res.status(200).json({
        success: true,
        data: category,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error,
      });
    }
  }

  static async deleteCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: "Nenhum ID fornecido",
        });
      }

      const category = await prisma.category.delete({
        where: { id },
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          error: "Não foi possível excluir a categoria com o ID fornecido",
        });
      }

      return res.status(200).json({
        success: true,
        data: category,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error,
      });
    }
  }

  static async updateCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const body = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: "Nenhum ID fornecido",
        });
      }

      if (!body) {
        return res.status(400).json({
          success: false,
          error: "Nenhuma informação da categoria fornecida",
        });
      }

      const category = await prisma.category.update({
        where: { id },
        data: body,
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          error: "Não foi possível encontrar a categoria com o ID fornecido",
        });
      }

      return res.status(200).json({
        success: true,
        data: category,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error,
      });
    }
  }
}
