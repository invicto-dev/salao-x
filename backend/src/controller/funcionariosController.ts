import { Request, Response } from "express";

import { prisma } from "../config/database";
import { Role } from "@prisma/client";

export class FuncionariosController {
  static async getFuncionarios(req: Request, res: Response) {
    const funcionarios = await prisma.employee.findMany();

    return res.status(200).json({
      success: true,
      data: funcionarios,
    });
  }

  static async getFuncionario(req: Request, res: Response) {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Nenhum ID fornecido",
      });
    }

    const funcionario = await prisma.employee.findUnique({
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
  }

  static async createFuncionario(req: Request, res: Response) {
    const { body } = req.body;

    if (!body) {
      return res.status(400).json({
        success: false,
        error: "Nenhuma informação do funcionário fornecida",
      });
    }

    const funcionario = await prisma.employee.create({
      data: {
        ...body,
        Role: Role.FUNCIONARIO,
      },
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
  }

  static async deleteFuncionario(req: Request, res: Response) {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Nenhum ID fornecido",
      });
    }

    const funcionario = await prisma.employee.delete({
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
  }

  static async updateFuncionario(req: Request, res: Response) {
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

    const funcionario = await prisma.employee.update({
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
  }
}
