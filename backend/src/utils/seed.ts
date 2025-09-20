import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...");

  // Criar configuração padrão
  await prisma.setting.upsert({
    where: { id: "configuracao-padrao" },
    update: {},
    create: {
      id: "configuracao-padrao",
      nomeEmpresa: "Salão da Rafa",
      cnpj: "13.123.456/0001-90",
      endereco: "Tv. Santa Luzia, 123",
      bairro: "Santa Luzia",
      cidade: "Oriximiná",
      cep: "13.123.456-000",
      telefone: "(11) 1234-5678",
      email: "salao@rafa.com",
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
      backupAutomatico: false,
      manterHistorico: 6,
      timezone: "America/Sao_Paulo",
    },
  });

  console.log("✅ Configuração padrão criada com sucesso!");

  // Criar categoria
  const categoriaCabelo = await prisma.category.create({
    data: {
      nome: "Cabelo",
      descricao: "Serviços relacionados a cabelo",
    },
  });

  console.log("✅ Categoria criada com sucesso!");

  // Criar produtos
  const shampoo = await prisma.product.create({
    data: {
      nome: "Shampoo Premium",
      preco: 49.9,
      custo: 20,
      descricao: "Shampoo para todos os tipos de cabelo",
      contarEstoque: true,
      estoque: 100,
    },
  });

  console.log("✅ Produto criado com sucesso!");

  // Criar serviços
  const corte = await prisma.service.create({
    data: {
      nome: "Corte de Cabelo",
      preco: 60,
      duracao: 45,
      descricao: "Corte de cabelo masculino/feminino",
      categoriaId: categoriaCabelo.id,
    },
  });

  console.log("✅ Serviço criado com categoria!");

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
