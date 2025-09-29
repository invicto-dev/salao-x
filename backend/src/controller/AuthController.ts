import { Request, Response } from "express";
import { AuthService } from "../services/AuthService";
import { z } from "zod";
import { prisma } from "../config/database";
import { AuthRequest } from "../middlewares/auth";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  senha: z.string().min(1, "Senha é obrigatória"),
});

export class AuthController {
  static async login(req: Request, res: Response) {
    const validatedData = loginSchema.parse(req.body);
    const result = await AuthService.login(validatedData);

    res.json({
      success: true,
      data: result,
    });
  }

  static async getProfile(req: AuthRequest, res: Response) {
    const user = await prisma.employee.findUnique({
      where: { id: req?.user?.id },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        ativo: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Usuário não encontrado",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  }
}
