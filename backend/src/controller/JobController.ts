// NOVO ARQUIVO
import { Request, Response } from "express";
import { prisma } from "../config/database";

export class JobController {
  static async getJobStatus(req: Request, res: Response) {
    try {
      const { jobId } = req.params;
      const job = await prisma.importJob.findUnique({
        where: { id: jobId },
      });

      if (!job) {
        return res.status(404).json({
          success: false,
          error: "Trabalho em segundo plano não encontrado.",
        });
      }

      return res.status(200).json({ success: true, data: job });
    } catch (error: any) {
      return res
        .status(500)
        .json({ success: false, error: "Erro ao buscar status do trabalho." });
    }
  }
}
