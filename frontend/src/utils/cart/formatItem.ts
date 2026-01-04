export const formatItem = (item: Sale.CartItem) => {
  switch (item.tipo) {
    case "produto":
      return {
        nome: item.nome,
        produtoId: item.id,
        preco: item.preco,
        quantidade: item.quantidade,
        contarEstoque: item.contarEstoque,
      };
    case "servico":
      return {
        nome: item.nome,
        servicoId: item.id,
        preco: item.preco,
        quantidade: item.quantidade,
      };
  }
};
