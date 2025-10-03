import bcrypt from "bcryptjs";

import { Request, Response } from "express";

import { prisma } from "../config/database";
import { Role } from "@prisma/client";
import { AuthRequest } from "../middlewares/auth";
import { hierarchyPositionCheck } from "../utils/permissions";
import { validatePassword } from "../utils/validatePassword";

export class FuncionariosController {
  static async getFuncionarios(req: Request, res: Response) {
    const funcionarios = await prisma.employee.findMany({
      orderBy: { nome: "asc" },
    });

    return res.status(200).json({
      success: true,
      data: funcionarios,
    });
  }

  static async getFuncionario(req: Request, res: Response) {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Nenhum ID fornecido",
      });
    }

    const funcionario = await prisma.employee.findUnique({
      where: { id },
    });

    if (!funcionario) {
      return res.status(404).json({
        success: false,
        error: "Não foi possível encontrar um funcionário com o ID fornecido",
      });
    }

    return res.status(200).json({
      success: true,
      data: funcionario,
    });
  }

  static async createFuncionario(req: Request, res: Response) {
    try {
      const body = req.body;
  
      if (!body) {
        return res.status(400).json({
          success: false,
          error: "Nenhuma informação do funcionário fornecida",
        });
      }
  
      if (!body.senha) {
        return res.status(400).json({
          success: false,
          error: "Senha é obrigatória",
        });
      }
  
      const { valid, errors } = validatePassword(body.senha);
  
      if (!valid) {
        return res.status(400).json({
          success: false,
          errors,
        });
      }
  
      const hashedPassword = await bcrypt.hash(body.senha, 10);
  
      const funcionario = await prisma.employee.create({
        data: {
          ...body,
          senha: hashedPassword,
        },
      });
  
      return res.status(200).json({
        success: true,
        data: funcionario,
      });
    } catch (err: any) {
      console.error("❌ Erro ao criar funcionário:", err);
      return res.status(500).json({
        success: false,
        error: "Erro interno ao criar funcionário",
      });
    }
  }
  
  
  
  static async deleteFuncionario(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Usuário não autenticado.",
      });
    }

    if (id === user.id) {
      return res.status(403).json({
        success: false,
        error: "Você não pode excluir seu próprio usuário.",
      });
    }

    const funcionario = await prisma.employee.findUnique({
      where: { id },
    });

    if (!funcionario) {
      return res.status(404).json({
        success: false,
        error: "Não foi possível encontrar o funcionário com o ID fornecido",
      });
    }

    if (funcionario.role === Role.ROOT) {
      return res.status(403).json({
        success: false,
        error: "O usuário ROOT não pode ser excluído.",
      });
    }

    if (hierarchyPositionCheck(user.role as Role, funcionario.role as Role)) {
      return res.status(403).json({
        success: false,
        error:
          "Você não tem permissão para excluir um usuário com função igual ou superior à sua.",
      });
    }

    await prisma.employee.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: "Funcionário excluído com sucesso.",
    });
  }

  static async updateFuncionario(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { body } = req.body;
    const user = req.user;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Nenhum ID fornecido",
      });
    }

    if (!body) {
      return res.status(400).json({
        success: false,
        error: "Nenhuma informação do funcionário fornecida",
      });
    }

    const funcionario = await prisma.employee.findUnique({
      where: { id },
    });

    if (!funcionario) {
      return res.status(404).json({
        success: false,
        error: "Não foi possível encontrar o funcionário com o ID fornecido",
      });
    }

    if (hierarchyPositionCheck(user?.role as Role, funcionario.role as Role)) {
      return res.status(403).json({
        success: false,
        error:
          "Você não tem permissão para editar um usuário com função igual ou superior à sua.",
      });
    }

    await prisma.employee.update({
      where: { id },
      data: body,
    });

    if (!funcionario) {
      return res.status(404).json({
        success: false,
        error: "Não foi possível encontrar um funcionário com o ID fornecido",
      });
    }

    return res.status(200).json({
      success: true,
      data: funcionario,
    });
  }

  static async adminChangePassword(req: Request, res: Response) {
    const { userId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res
        .status(400)
        .json({ success: false, error: "Senha muito curta" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.employee.update({
      where: { id: userId },
      data: { senha: hashedPassword },
    });
    res.json({ success: true, message: "Senha alterada com sucesso" });
  }

  /* static async changePassword(req: AuthRequest, res: Response) {
    try {
      const validatedData = changePasswordSchema.parse(req.body);

      // Buscar usuário atual
      const user = await prisma.employee.findUnique({
        where: { id: req.user!.id },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: "Usuário não encontrado",
        });
      }

      // Verificar senha atual
      const isValidPassword = await bcrypt.compare(
        validatedData.currentPassword,
        user.senha
      );
      if (!isValidPassword) {
        return res.status(400).json({
          success: false,
          error: "Senha atual incorreta",
        });
      }

      // Hash da nova senha
      const hashedPassword = await bcrypt.hash(validatedData.newPassword, 10);

      // Atualizar senha
      await prisma.user.update({
        where: { id: req.user!.id },
        data: { password: hashedPassword },
      });

      res.json({
        success: true,
        message: "Senha alterada com sucesso",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : "Erro ao alterar senha",
      });
    }
  } */
}
