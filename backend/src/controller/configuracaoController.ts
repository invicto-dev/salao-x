import { Request, Response } from "express";

import { prisma } from "../config/database";

export class ConfiguracaoController {
  static async getConfig(req: Request, res: Response) {
    try {
      const config = await prisma.setting.findFirst();
      if (!config) {
        return res.status(404).json({
          success: false,
          error: "Nenhuma configuração encontrada",
        });
      }

      return res.status(200).json({
        success: true,
        data: config,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error,
      });
    }
  }

  static async updateConfig(req: Request, res: Response) {
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
          error: "Nenhuma configuração fornecida",
        });
      }
      const config = await prisma.setting.update({
        where: { id },
        data: body,
      });

      if (!config) {
        return res.status(404).json({
          success: false,
          error: "Não foi possível encontrar a configuração com o ID fornecido",
        });
      }

      return res.status(200).json({
        success: true,
        data: config,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error,
      });
    }
  }
}
