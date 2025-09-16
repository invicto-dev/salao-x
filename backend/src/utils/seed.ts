import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...");

  // Criar funcionários
  await prisma.funcionarios.createMany({
    data: [
      {
        nome: "Victor Hugo",
        email: "victor@hugo.com",
        telefone: "(11) 1234-5678",
        funcao: "Diretor de Negócios",
        comissao: 10,
        ativo: true,
      },
      {
        nome: "Vicente Hugo",
        email: "vicente@hugo.com",
        telefone: "(11) 1234-5678",
        funcao: "Diretor de Negócios",
        comissao: 10,
        ativo: true,
      },
    ],
  });

  console.log("✅ Funcionários criados com sucesso!");

  // Criar clientes
  await prisma.customer.createMany({
    data: [
      {
        nome: "Rafael Hugo",
        email: "rafaek@hugo.com",
        telefone: "(11) 1234-5678",
        cpf: "123.456.789-01",
        ativo: true,
      },
      {
        nome: "Pablo Marcal",
        email: "pablo@marcal.com",
        telefone: "(11) 1234-5678",
        cpf: "123.456.789-02",
        ativo: true,
      },
    ],
  });

  console.log("✅ Clientes criados com sucesso!");

  // Criar configurações padrão
  await prisma.configuracoes.upsert({
    where: { id: new Date().toISOString() },
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

  console.log("✅ Cofiguração padrão criada com sucesso!");
  // Criar categoria
  const categoriaCabelo = await prisma.category.create({
    data: {
      nome: "Cabelo",
      descricao: "Serviços relacionados a cabelo",
    },
  });

  console.log("✅ Categoria criada com sucesso!");

  // Criar produto sem categoria
  await prisma.product.create({
    data: {
      nome: "Shampoo Premium",
      preco: 49.9,
      custo: 20,
      descricao: "Shampoo para todos os tipos de cabelo",
      contarEstoque: true,
      estoque: 100,
    },
  });

  console.log("✅ Produto criado sem categoria!");

  // Criar serviço vinculado à categoria
  await prisma.service.create({
    data: {
      nome: "Corte de Cabelo",
      preco: 60,
      duracao: 45,
      descricao: "Corte de cabelo masculino/feminino",
      categoriaId: categoriaCabelo.id, // vincula
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
