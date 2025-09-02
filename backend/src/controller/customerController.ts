import { Request, Response } from "express";

import { prisma } from "../config/database";

export class CustomersController {
  static async getCustomers(req: Request, res: Response) {
    try {
      const customers = await prisma.customer.findMany();

      return res.status(200).json({
        success: true,
        data: customers,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error,
      });
    }
  }

  static async getCustomer(req: Request, res: Response) {
    try {
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
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error,
      });
    }
  }

  static async createCustomer(req: Request, res: Response) {
    try {
      console.log(req.body);
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
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error,
      });
    }
  }

  static async deleteCustomer(req: Request, res: Response) {
    try {
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
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error,
      });
    }
  }

  static async updateCustomer(req: Request, res: Response) {
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
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error,
      });
    }
  }
}
