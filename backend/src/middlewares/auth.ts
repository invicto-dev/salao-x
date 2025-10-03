import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/database";
import { prisma } from "../config/database";
import { Role } from "@prisma/client";
import { hasPermission } from "../utils/permissions";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];


  if (!token) {
    return res.status(401).json({ error: "Token de acesso requerido" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    const user = await prisma.employee.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true, ativo: true },
    });

    if (!user || !user.ativo) {
      return res.status(401).json({ error: "Usuário inválido ou inativo" });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    return res.status(403).json({ error: "Token inválido" });
  }
};

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user?.role) {
    return res
      .status(403)
      .json({ sucess: false, error: "Usuário sem permissão definida" });
  }

  if (hasPermission(req.user.role as Role, Role.ADMIN)) {
    return res
      .status(403)
      .json({ sucess: false, error: "Acesso negado. Apenas administradores." });
  }
  next();
};

export const requireOwnerOrAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const { employeeId } = req.params;

  if (!req.user?.role) {
    return res
      .status(403)
      .json({ sucess: false, error: "Usuário sem permissão definida" });
  }

  if (
    hasPermission(req.user?.role as Role, Role.ADMIN) &&
    req.user?.id !== employeeId
  ) {
    return res.status(403).json({ success: false, error: "Acesso negado." });
  }
  next();
};
