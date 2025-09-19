export {};

declare global {
  namespace Sale {
    type CartType = "venda" | "pagamento";

    interface CartItem {
      id: string;
      nome: string;
      tipo: "produto" | "servico";
      preco: number;
      quantidade: number;
      funcionario?: string;
      comissao?: number;
    }

    interface ItemProps {
      produtoId?: string;
      servicoId?: string;
      quantidade: number;
      preco: number;
    }

    interface Props {
      id?: string;
      clienteId?: string;
      funcionarioId?: string;
      itens: ItemProps[];
      pagamentos: {
        metodoDePagamentoId: string;
        valor: number;
        observacao?: string;
      }[];
      desconto: number;
      acrescimo: number;
      status: "PENDENTE" | "PAGO" | "CANCELADO";
    }
  }
}
