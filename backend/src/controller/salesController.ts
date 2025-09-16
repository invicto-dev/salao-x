import { Request, Response } from "express";
import { prisma } from "../config/database";

export class SalesController {
  // Listar todas as vendas
  static async getAll(req: Request, res: Response) {
    try {
      const vendas = await prisma.sale.findMany({
        include: {
          cliente: true,
          funcionario: true,
          itens: {
            include: { produto: true, servico: true },
          },
          pagamentos: { include: { metodoDePagamento: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      res.json(vendas);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erro ao buscar vendas" });
    }
  }

  // Buscar venda por ID
  static async getById(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const venda = await prisma.sale.findUnique({
        where: { id },
        include: {
          cliente: true,
          funcionario: true,
          itens: { include: { produto: true, servico: true } },
          pagamentos: { include: { metodoDePagamento: true } },
        },
      });
      if (!venda)
        return res.status(404).json({ error: "Venda não encontrada" });
      res.json(venda);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erro ao buscar venda" });
    }
  }

  // Criar nova venda
  static async create(req: Request, res: Response) {
    const { clienteId, funcionarioId, itens, pagamentos, desconto, acrescimo } =
      req.body;

    try {
      // Calcular total da venda
      let total = itens.reduce(
        (acc: number, item: any) => acc + item.preco * item.quantidade,
        0
      );
      if (desconto) total -= desconto;
      if (acrescimo) total += acrescimo;

      const venda = await prisma.sale.create({
        data: {
          clienteId,
          funcionarioId,
          total,
          desconto: desconto || 0,
          acrescimo: acrescimo || 0,
          status: "PENDENTE",
          itens: {
            create: itens.map((item: any) => ({
              produtoId: item.produtoId,
              servicoId: item.servicoId,
              quantidade: item.quantidade,
              preco: item.preco,
              subtotal: item.preco * item.quantidade,
            })),
          },
          pagamentos: {
            create: pagamentos.map((pag: any) => ({
              metodoDePagamentoId: pag.metodoDePagamentoId,
              valor: pag.valor,
              observacao: pag.observacao || null,
            })),
          },
        },
        include: {
          itens: true,
          pagamentos: true,
        },
      });

      res.status(201).json(venda);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erro ao criar venda" });
    }
  }

  // Atualizar venda (ex: apenas status)
  static async updateStatus(req: Request, res: Response) {
    const { id } = req.params;
    const { status } = req.body;

    if (!["PENDENTE", "PAGO", "CANCELADO"].includes(status)) {
      return res.status(400).json({ error: "Status inválido" });
    }

    try {
      const venda = await prisma.sale.update({
        where: { id },
        data: { status },
      });
      res.json(venda);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erro ao atualizar venda" });
    }
  }
}
