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
      contarEstoque?: boolean;
    }

    interface ItemProps {
      produtoId?: string;
      produto?: Product.Props;
      servicoId?: string;
      servico?: Service.Props;
      subtotal?: number;
      quantidade: number;
      preco: number;
    }

    interface Props {
      id?: string;
      clienteId?: string;
      cliente?: Customer.Props;
      funcionarioId?: string;
      itens: ItemProps[];
      pagamentos: {
        metodoDePagamentoId: string;
        metodoDePagamento?: PaymentMethod.Props;
        valor: number;
        observacao?: string;
      }[];
      desconto: number;
      acrescimo: number;
      total?: number;
      subtotal?: number;
      troco?: number;
      status: "PENDENTE" | "PAGO" | "CANCELADO";
      createdAt?: string;
      updatedAt?: string;
    }
  }
}
