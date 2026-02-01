import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed de usuarios no banco de dados...");

  console.log("Gerando Configuração padrão...");
  await prisma.setting.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      nomeEmpresa: "",
      cnpj: null,
      asaasActive: false,
    },
  });
  console.log("✅ Configurações garantidas.");

  // --------------------------------------------------------
  // 1. MÉTODOS DE PAGAMENTO
  // --------------------------------------------------------
  console.log("Gerando métodos de pagamento padrões...");

  await prisma.paymentMethod.upsert({
    where: { nome: "Dinheiro" },
    update: {}, // Se já existe, não faz nada
    create: {
      nome: "Dinheiro",
      descricao: "Pagamento em espécie",
      isCash: true,
      ativo: true,
    },
  });
  console.log("✅ Método de pagamento 'Dinheiro' garantido.");

  await prisma.paymentMethod.upsert({
    where: { integration: "ASAAS_CREDIT" },
    update: {},
    create: {
      nome: "Crediário (Asaas)",
      descricao: "Venda a prazo com gestão de cobranças via Asaas",
      ativo: true,
      integration: "ASAAS_CREDIT",
    },
  });
  console.log("✅ Método de pagamento 'Crediário (Asaas)' garantido.");

  // --------------------------------------------------------
  // 2. USUÁRIO ROOT
  // --------------------------------------------------------
  console.log("Gerando o usuario root...");

  const rootEmail = "usuario@root.com";
  // Senha padrão apenas para criação. Se o usuário já existir, mantemos a senha atual dele.
  const hashedRootPassword = await bcrypt.hash("root123", 10);

  await prisma.employee.upsert({
    where: { email: rootEmail },
    // UPDATE vazio: Se o usuário já existe, NÃO altera nada (preserva senha alterada pelo user)
    // Se quiser resetar a senha toda vez que reiniciar, coloque { senha: hashedRootPassword } aqui dentro.
    update: {},
    create: {
      nome: "Usuário Root",
      ativo: true,
      email: rootEmail,
      senha: hashedRootPassword,
      role: Role.ROOT,
      funcao: "Usuário Root",
      telefone: "(11) 1234-5678",
      comissao: 0,
    },
  });

  console.log("✅ Usuário Root garantido!");
  console.log("-----------------------------------------");
  console.log("🔐 Credenciais de Acesso:");
  console.log(`📧 Email: ${rootEmail}`);
  console.log(`🔑 Senha: root123 (se for o primeiro acesso)`);
  console.log("-----------------------------------------");

  console.log("\n🎉 Seed concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
