import { Request, Response } from "express";
import { SaleStatus } from "@prisma/client";
import { AuthRequest } from "../middlewares/auth";
import { SalesService } from "../services/SalesService";

export class SalesController {
  static async getAll(req: Request, res: Response) {
    const sales = await SalesService.getAll(req.query);
    res.status(200).json({ success: true, data: sales });
  }

  static async getById(req: Request, res: Response) {
    const { id } = req.params;
    const sale = await SalesService.getById(id);
    res.status(200).json({ success: true, data: sale });
  }

  static async create(req: AuthRequest, res: Response) {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, error: "Usuário não autenticado." });
    }

    const payload: Sales.CreatePayload = {
      ...req.body,
      user: { id: req.user.id },
    };

    const newSale = await SalesService.create(payload);
    res.status(201).json({ success: true, data: newSale });
  }

  static async update(req: AuthRequest, res: Response) {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, error: "Usuário não autenticado." });
    }

    const { id } = req.params;

    const payload: Sales.CreatePayload = {
      ...req.body,
      user: { id: req.user.id },
    };

    const updatedSale = await SalesService.update(id, payload);
    res.status(200).json({ success: true, data: updatedSale });
  }

  static async updateStatus(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { status } = req.body as { status: SaleStatus };

    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, error: "Usuário não autenticado." });
    }

    if (!Object.values(SaleStatus).includes(status)) {
      return res.status(400).json({ error: "Status inválido" });
    }

    const payload: Sales.UpdateStatusPayload = {
      status,
      user: { id: req.user.id },
    };

    const updatedSale = await SalesService.updateStatus(id, payload);
    res.status(200).json({ success: true, data: updatedSale });
  }
}
