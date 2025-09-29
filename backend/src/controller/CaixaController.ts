import { Request, Response } from "express";
import { prisma } from "../config/database";
import {
  closeCaixaSchema,
  createCaixaSchema,
  moveCaixaSchema,
} from "../schemas/zod/caixaSchemas";
import { AuthRequest } from "../middlewares/auth";
import { CaixaService } from "../services/CaixaService";

export class CaixaController {
  static async getOpenCaixaSummary(req: AuthRequest, res: Response) {
    const openCaixa = await prisma.caixa.findFirst({
      where: { status: "ABERTO" },
    });
    if (!openCaixa) {
      throw new Error("Nenhum caixa aberto encontrado.");
    }

    const summary = await CaixaService.calculateCaixaSummary(openCaixa.id);
    const valorAbertura = openCaixa.valorAbertura.toNumber();

    return res.status(200).json({
      success: true,
      data: {
        valorAbertura,
        ...summary,
        valorFechamentoCalculado:
          valorAbertura +
          summary.totalLiquidoVendasDinheiro +
          summary.totalEntradas -
          summary.totalSaidas,
      },
    });
  }

  static async open(req: AuthRequest, res: Response) {
    const validatedData = createCaixaSchema.parse(req.body);
    const newCaixa = await CaixaService.open(validatedData, req.user!.id);
    return res.status(201).json({ success: true, data: newCaixa });
  }

  static async close(req: AuthRequest, res: Response) {
    const validatedData = closeCaixaSchema.parse(req.body);
    const closedCaixa = await CaixaService.close(validatedData, req.user!.id);
    return res.status(200).json({ success: true, data: closedCaixa });
  }

  static async move(req: AuthRequest, res: Response) {
    const validatedData = moveCaixaSchema.parse(req.body);
    const newMovement = await CaixaService.move(validatedData, req.user!.id);
    return res.status(201).json({ success: true, data: newMovement });
  }

  static async getAll(req: Request, res: Response) {
    const caixas = await prisma.caixa.findMany({
      orderBy: { dataAbertura: "desc" },
    });
    return res.status(200).json({ sucess: true, data: caixas });
  }

  static async hasSessionOpen(req: Request, res: Response) {
    const openCaixa = await prisma.caixa.findFirst({
      where: { status: "ABERTO" },
    });
    return res.status(200).json({ sucess: true, data: openCaixa });
  }
}
