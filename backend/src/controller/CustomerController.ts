import { Request, Response } from "express";

import { prisma } from "../config/database";
import { Prisma } from "@prisma/client";

export class CustomersController {
  static async getCustomers(req: Request, res: Response) {
    const search = req.query.search as string;

    const whereClause: Prisma.CustomerWhereInput = {};
    if (search && search.trim() !== "") {
      whereClause.OR = [
        { nome: { contains: search, mode: "insensitive" } },
        { cpfCnpj: { contains: search, mode: "insensitive" } },
        { telefone: { contains: search, mode: "insensitive" } },
      ];
    }
    const customers = await prisma.customer.findMany({
      where: whereClause,
      orderBy: { nome: "asc" },
    });

    return res.status(200).json({
      success: true,
      data: customers,
    });
  }

  static async getCustomer(req: Request, res: Response) {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Nenhum ID fornecido",
      });
    }

    const customer = await prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: "Não foi possível encontrar um cliente com o ID fornecido",
      });
    }

    return res.status(200).json({
      success: true,
      data: customer,
    });
  }

  static async createCustomer(req: Request, res: Response) {
    const { body } = req.body;

    if (!body) {
      return res.status(400).json({
        success: false,
        error: "Nenhuma informação do cliente fornecida",
      });
    }

    const customer = await prisma.customer.create({
      data: body,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: "Não foi possível criar um cliente",
      });
    }

    return res.status(200).json({
      success: true,
      data: customer,
    });
  }

  static async deleteCustomer(req: Request, res: Response) {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Nenhum ID fornecido",
      });
    }

    const customer = await prisma.customer.delete({
      where: { id },
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: "Não foi possível excluir um cliente com o ID fornecido",
      });
    }

    return res.status(200).json({
      success: true,
      data: customer,
    });
  }

  static async updateCustomer(req: Request, res: Response) {
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
        error: "Nenhuma informação do cliente fornecida",
      });
    }

    const customer = await prisma.customer.update({
      where: { id },
      data: body,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: "Não foi possível encontrar um cliente com o ID fornecido",
      });
    }

    return res.status(200).json({
      success: true,
      data: customer,
    });
  }
}
