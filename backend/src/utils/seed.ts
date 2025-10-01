import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed de usuarios no banco de dados...");

  console.log("Gerando métodos de pagamento padrões...");

  await prisma.paymentMethod.upsert({
    where: { nome: "Dinheiro" },
    update: {},
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

  await prisma.setting.upsert({
    where: { id: "configuracao-padrao" },
    update: {},
    create: {
      id: "configuracao-padrao",
      nomeEmpresa: "Salão X Dev",
      cnpj: "13.123.456/0001-90",
      endereco: "Tv. Santa Luzia, 123",
      bairro: "Santa Luzia",
      cidade: "Oriximiná",
      cep: "13.123.456-000",
      telefone: "(11) 1234-5678",
      email: "salaox@dev.com",
      site: "https://salao-x.vercel.app",
      horarioFuncionamento: {
        "segunda-feira": "08:00",
        "terca-feira": "08:00",
        "quarta-feira": "08:00",
        "quinta-feira": "08:00",
        "sexta-feira": "08:00",
        sabado: "08:00",
        domingo: "08:00",
      },
      intervaloPadrao: 30,
      antecedenciaMinima: 15,
      notificarAgendamentos: false,
      notificarEstoqueBaixo: false,
      notificarAniversarios: false,
      whatsappAtivo: false,
      emailAtivo: false,
      timezone: "America/Sao_Paulo",
    },
  });

  console.log("✅ Configuração padrão criada com sucesso!");

  console.log("Gerando o usuario root...");

  const hashedRootPassword = await bcrypt.hash("root123", 10);

  const users = [
    {
      nome: "Usuário Root",
      ativo: true,
      email: "usuario@root.com",
      senha: hashedRootPassword,
      role: Role.ROOT,
      funcao: "Usuário Root",
      telefone: "(11) 1234-5678",
      comissao: 0,
    },
  ];

  await prisma.employee.createMany({
    data: users,
  });

  console.log("✅ Usuário criado com sucesso!");

  console.log("Root credenciais:");
  console.log("Email: usuario@root.com");
  console.log("Senha: root123");

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
