import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(error); //logging

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        error: `Conflito de dados: O campo '${(
          error.meta?.target as string[]
        )?.join(", ")}' já existe.`,
      });
    }
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        error: "Operação falhou: O registro necessário não foi encontrado.",
      });
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      success: false,
      error: `Validação falhou: ${error.message}`,
    });
  }

  // Para outros erros conhecidos que você queira tratar
  // if (error instanceof MinhaClasseDeErroCustomizada) { ... }

  // Fallback para erros genéricos
  return res.status(500).json({
    success: false,
    error: error.message || "Ocorreu um erro inesperado no servidor.",
  });
}
