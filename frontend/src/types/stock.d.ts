declare namespace Stock {
  // O que a lista de produtos em estoque retorna
  export interface StockProduct extends Product.Props {
    estoqueAtual: number;
  }

  // O que os KPIs retornam
  export interface Kpis {
    totalProdutos: number;
    valorTotalEstoque: number;
    produtosEstoqueBaixo: number;
  }

  export interface Movement {
    id: string;
    produto: { nome: string };
    tipo: "ENTRADA" | "SAIDA" | "AJUSTE";
    motivo:
      | "COMPRA"
      | "VENDA"
      | "QUEBRA"
      | "VENCIMENTO"
      | "DEVOLUCAO"
      | "AJUSTE_INVENTARIO";
    quantidade: number;
    createdAt: string;
    solicitadoPor: { nome: string };
    aprovadoPor?: { nome: string } | null;
    status: "PENDENTE" | "APROVADO" | "REJEITADO";
  }

  export interface CreateMovementBody {
    produtoId: string;
    tipo: "ENTRADA" | "SAIDA" | "AJUSTE";
    motivo:
      | "COMPRA"
      | "VENDA"
      | "QUEBRA"
      | "VENCIMENTO"
      | "DEVOLUCAO"
      | "AJUSTE_INVENTARIO";
    quantidade: number;
    custoUnitario?: number;
    observacao?: string;
    managerPassword?: string;
  }
}
