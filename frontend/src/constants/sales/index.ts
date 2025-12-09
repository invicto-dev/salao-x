export const PDV_SESSION_KEY = "pdv-session-data";

export const INITIAL_STATE = (sale?: Sale.Props): Sale.SessionProps => {
  if (sale) {
    return {
      saleId: sale.id,
      clienteSelecionado: sale.cliente,
      pagamentos: [],
      desconto: { value: 0, type: "PORCENTAGEM" },
      acrescimo: { value: 0, type: "PORCENTAGEM" },
      carrinho: {
        mode: "sale",
        content: sale.itens?.map((item) => ({
          id: item.produtoId || item.servicoId,
          nome: item.produto?.nome || item.servico?.nome,
          tipo: item.produto ? "produto" : "servico",
          preco: item.preco,
          quantidade: item.quantidade,
        })),
      },
    };
  } else {
    return {
      saleId: undefined,
      clienteSelecionado: null,
      pagamentos: [],
      desconto: { value: 0, type: "PORCENTAGEM" },
      acrescimo: { value: 0, type: "PORCENTAGEM" },
      carrinho: {
        mode: "sale",
        content: [],
      },
    };
  }
};
