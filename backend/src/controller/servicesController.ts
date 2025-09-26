import { Request, Response } from "express";

import { prisma } from "../config/database";

export class ServicesController {
  static async getServices(req: Request, res: Response) {
    const services = await prisma.service.findMany({
      include: { categoria: { select: { nome: true } } },
      orderBy: { nome: "asc" },
    });

    return res.status(200).json({
      success: true,
      data: services.map((s) => ({ ...s, categoria: s.categoria?.nome })),
    });
  }

  static async getService(req: Request, res: Response) {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Nenhum ID fornecido",
      });
    }

    const service = await prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        error: "Não foi possível encontrar um serviço com o ID fornecido",
      });
    }

    return res.status(200).json({
      success: true,
      data: service,
    });
  }

  static async createService(req: Request, res: Response) {
    const { body } = req.body;

    if (!body) {
      return res.status(400).json({
        success: false,
        error: "Nenhuma informação do serviço fornecida",
      });
    }

    const service = await prisma.service.create({
      data: body,
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        error: "Não foi possível criar o serviço",
      });
    }

    return res.status(200).json({
      success: true,
      data: service,
    });
  }

  static async deleteService(req: Request, res: Response) {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Nenhum ID fornecido",
      });
    }

    const service = await prisma.service.delete({
      where: { id },
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        error: "Não foi possível excluir o serviço com o ID fornecido",
      });
    }

    return res.status(200).json({
      success: true,
      data: service,
    });
  }

  static async updateService(req: Request, res: Response) {
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
        error: "Nenhuma informação do serviço fornecida",
      });
    }

    const service = await prisma.service.update({
      where: { id },
      data: body,
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        error: "Não foi possível encontrar o serviço com o ID fornecido",
      });
    }

    return res.status(200).json({
      success: true,
      data: service,
    });
  }
}
