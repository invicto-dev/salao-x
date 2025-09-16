import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...");

  // Criar funcionários individualmente para pegar os IDs
  const victor = await prisma.employee.create({
    data: {
      nome: "Victor Hugo",
      email: "victor@hugo.com",
      telefone: "(11) 1234-5678",
      funcao: "Diretor de Negócios",
      comissao: 10,
      ativo: true,
    },
  });

  const vicente = await prisma.employee.create({
    data: {
      nome: "Vicente Hugo",
      email: "vicente@hugo.com",
      telefone: "(11) 1234-5678",
      funcao: "Gerente Comercial",
      comissao: 8,
      ativo: true,
    },
  });

  console.log("✅ Funcionários criados com sucesso!");

  // Criar clientes
  const rafael = await prisma.customer.create({
    data: {
      nome: "Rafael Hugo",
      email: "rafaek@hugo.com",
      telefone: "(11) 1234-5678",
      cpf: "123.456.789-01",
      ativo: true,
    },
  });

  const pablo = await prisma.customer.create({
    data: {
      nome: "Pablo Marcal",
      email: "pablo@marcal.com",
      telefone: "(11) 1234-5678",
      cpf: "123.456.789-02",
      ativo: true,
    },
  });

  console.log("✅ Clientes criados com sucesso!");

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

  // Criar formas de pagamento
  const dinheiro = await prisma.paymentMethod.create({
    data: { nome: "Dinheiro" },
  });

  const pix = await prisma.paymentMethod.create({
    data: { nome: "Pix", chavePix: "123.456.789-00" },
  });

  console.log("✅ Formas de pagamento criadas com sucesso!");

  // Criar uma venda vinculada a funcionário e cliente
  const venda = await prisma.sale.create({
    data: {
      clienteId: rafael.id,
      funcionarioId: victor.id,
      total: 109.9,
      desconto: 10,
      acrescimo: 0,
      status: "PENDENTE",
      itens: {
        create: [
          {
            produtoId: shampoo.id,
            quantidade: 1,
            preco: 49.9,
            subtotal: 49.9,
          },
          {
            servicoId: corte.id,
            quantidade: 1,
            preco: 60,
            subtotal: 60,
          },
        ],
      },
      pagamentos: {
        create: [
          {
            metodoDePagamentoId: dinheiro.id,
            valor: 50,
          },
          {
            metodoDePagamentoId: pix.id,
            valor: 49.9,
          },
        ],
      },
    },
  });

  console.log("✅ Venda criada com sucesso!");
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
