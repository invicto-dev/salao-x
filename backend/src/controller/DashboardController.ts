import { Request, Response } from "express";
import { DashboardService } from "../services/DashboardService";

export class DashboardController {
  static async getStats(req: Request, res: Response) {
    const { startDate, endDate } = req.query;

    try {
      const stats = await DashboardService.getStats(
        startDate as string,
        endDate as string
      );

      return res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || "Erro ao buscar estatísticas do dashboard",
      });
    }
  }
}
