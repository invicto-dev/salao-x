import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/database";
import { JWT_SECRET } from "../config/database";
import { Employee, Role } from "@prisma/client";

export class AuthService {
  static async login(data: LoginRequest): Promise<LoginResponse> {
    const { email, senha } = data;

    // Buscar usuário
    const user = await prisma.employee.findUnique({
      where: { email },
    });

    if (!user || !user.ativo) {
      throw new Error("Credenciais inválidas");
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(senha, user.senha);
    if (!isValidPassword) {
      throw new Error("Credenciais inválidas");
    }

    // Gerar token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Remover senha do retorno
    const { senha: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword as Employee,
      token,
    };
  }
}
