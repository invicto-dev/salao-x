import { Request, Response } from "express";

import { prisma } from "../config/database";

export class FuncionariosController {
  static async getFuncionarios(req: Request, res: Response) {
    try {
      const funcionarios = await prisma.funcionarios.findMany();

      return res.status(200).json({
        success: true,
        data: funcionarios,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error,
      });
    }
  }

  static async getFuncionario(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: "Nenhum ID fornecido",
        });
      }

      const funcionario = await prisma.funcionarios.findUnique({
        where: { id },
      });

      if (!funcionario) {
        return res.status(404).json({
          success: false,
          error: "Não foi possível encontrar um funcionário com o ID fornecido",
        });
      }

      return res.status(200).json({
        success: true,
        data: funcionario,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error,
      });
    }
  }

  static async createFuncionario(req: Request, res: Response) {
    try {
      const { body } = req.body;

      if (!body) {
        return res.status(400).json({
          success: false,
          error: "Nenhuma informação do funcionário fornecida",
        });
      }

      const funcionario = await prisma.funcionarios.create({
        data: body,
      });

      if (!funcionario) {
        return res.status(404).json({
          success: false,
          error: "Não foi possível criar um funcionário",
        });
      }

      return res.status(200).json({
        success: true,
        data: funcionario,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error,
      });
    }
  }

  static async deleteFuncionario(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: "Nenhum ID fornecido",
        });
      }

      const funcionario = await prisma.funcionarios.delete({
        where: { id },
      });

      if (!funcionario) {
        return res.status(404).json({
          success: false,
          error: "Não foi possível excluir um funcionário com o ID fornecido",
        });
      }

      return res.status(200).json({
        success: true,
        data: funcionario,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error,
      });
    }
  }

  static async updateFuncionario(req: Request, res: Response) {
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
          error: "Nenhuma informação do funcionário fornecida",
        });
      }

      const funcionario = await prisma.funcionarios.update({
        where: { id },
        data: body,
      });

      if (!funcionario) {
        return res.status(404).json({
          success: false,
          error: "Não foi possível encontrar um funcionário com o ID fornecido",
        });
      }

      return res.status(200).json({
        success: true,
        data: funcionario,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error,
      });
    }
  }
}
