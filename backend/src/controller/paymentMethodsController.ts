import { Request, Response } from "express";

import { prisma } from "../config/database";

export class PaymentMethodsController {
  static async getPaymentMethods(req: Request, res: Response) {
    try {
      const paymentMethods = await prisma.paymentMethod.findMany();

      return res.status(200).json({
        success: true,
        data: paymentMethods,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error,
      });
    }
  }

  static async getPaymentMethod(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: "Nenhum ID fornecido",
        });
      }

      const paymentMethod = await prisma.paymentMethod.findUnique({
        where: { id },
      });

      if (!paymentMethod) {
        return res.status(404).json({
          success: false,
          error:
            "Não foi possível encontrar um metodo de pagamento com o ID fornecido",
        });
      }

      return res.status(200).json({
        success: true,
        data: paymentMethod,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error,
      });
    }
  }

  static async createPaymentMethod(req: Request, res: Response) {
    try {
      const body = req.body;

      if (!body) {
        return res.status(400).json({
          success: false,
          error: "Nenhuma informação do metodo de pagamento fornecida",
        });
      }

      const paymentMethod = await prisma.paymentMethod.create({
        data: body,
      });

      if (!paymentMethod) {
        return res.status(404).json({
          success: false,
          error: "Não foi possível criar o metodo de pagamento",
        });
      }

      return res.status(200).json({
        success: true,
        data: paymentMethod,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error,
      });
    }
  }

  static async deletePaymentMethod(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: "Nenhum ID fornecido",
        });
      }

      const paymentMethod = await prisma.paymentMethod.delete({
        where: { id },
      });

      if (!paymentMethod) {
        return res.status(404).json({
          success: false,
          error:
            "Não foi possível excluir o metodo de pagamento com o ID fornecido",
        });
      }

      return res.status(200).json({
        success: true,
        data: paymentMethod,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.meta.cause,
      });
    }
  }

  static async updatepaymentMethod(req: Request, res: Response) {
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
          error: "Nenhuma informação do metodo de pagamento fornecida",
        });
      }

      const paymentMethod = await prisma.paymentMethod.update({
        where: { id },
        data: body,
      });

      if (!paymentMethod) {
        return res.status(404).json({
          success: false,
          error:
            "Não foi possível encontrar o metodo de pagamento com o ID fornecido",
        });
      }

      return res.status(200).json({
        success: true,
        data: paymentMethod,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error,
      });
    }
  }
}
