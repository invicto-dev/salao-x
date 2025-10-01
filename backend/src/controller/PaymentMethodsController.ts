import { Request, Response } from "express";

import { prisma } from "../config/database";
import { SettingsService } from "../services/SettingsService";

export class PaymentMethodsController {
  static async getPaymentMethods(req: Request, res: Response) {
    const settings = await SettingsService.get();

    const paymentMethods = await prisma.paymentMethod.findMany({
      orderBy: { nome: "asc" },
    });

    let dataToReturn = paymentMethods;

    if (!settings?.asaasActive) {
      dataToReturn = paymentMethods.filter(
        (p) => p.integration !== "ASAAS_CREDIT"
      );
    }

    return res.status(200).json({
      success: true,
      data: dataToReturn,
    });
  }

  static async getPaymentMethod(req: Request, res: Response) {
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
  }

  static async createPaymentMethod(req: Request, res: Response) {
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
  }

  static async deletePaymentMethod(req: Request, res: Response) {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Nenhum ID fornecido",
      });
    }

    const paymentMethodToDelete = await prisma.paymentMethod.findUnique({
      where: { id },
    });
    if (paymentMethodToDelete?.isCash || paymentMethodToDelete?.integration) {
      return res.status(403).json({
        success: false,
        error:
          "Este método de pagamento é um padrão do sistema e não pode ser excluído.",
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
  }

  static async updatePaymentMethod(req: Request, res: Response) {
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

    const paymentMethodToUpdate = await prisma.paymentMethod.findUnique({
      where: { id },
    });
    if (paymentMethodToUpdate?.isCash || paymentMethodToUpdate?.integration) {
      return res.status(403).json({
        success: false,
        error:
          "Este método de pagamento é um padrão do sistema e não pode ser atualizado.",
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
  }
}
