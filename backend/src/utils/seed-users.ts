import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed de usuarios no banco de dados...");

  const hashedPassword = await bcrypt.hash("root123", 10);

  const users = [
    {
      nome: "Super User",
      ativo: true,
      email: "super@user.com",
      senha: hashedPassword,
      role: Role.ROOT,
      funcao: "Usuário Root",
      telefone: "(11) 1234-5678",
      comissao: 0,
    },
    {
      nome: "Secretária",
      ativo: true,
      email: "secretaria@salaox.com",
      senha: hashedPassword,
      role: Role.SECRETARIO,
      funcao: "Secretária",
      telefone: "(11) 1234-5678",
      comissao: 0,
    },
  ];

  await prisma.employee.createMany({
    data: users,
  });

  console.log("✅ Usuários criados com sucesso!");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
