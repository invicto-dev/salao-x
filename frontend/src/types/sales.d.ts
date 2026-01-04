export {};

declare global {
  namespace Sale {
    type CartType = "sale" | "payment";
    type increaseOrDecrease = {
      value: number;
      type: "PORCENTAGEM" | "VALOR";
    };

    interface CartItem {
      id: string;
      nome: string;
      tipo: "produto" | "servico" | "increaseOrDecrease";
      preco: number;
      quantidade: number;
      funcionario?: string;
      comissao?: number;
      contarEstoque?: boolean;
    }

    interface ItemProps {
      nome?: string;
      produtoId?: string;
      produto?: Product.Props;
      servicoId?: string;
      servico?: Service.Props;
      subtotal?: number;
      quantidade: number;
      preco: number;
      desconto?: increaseOrDecrease["value"];
      descontoTipo?: increaseOrDecrease["type"];
      acrescimo?: increaseOrDecrease["value"];
      acrescimoTipo?: increaseOrDecrease["type"];
    }

    interface SessionProps {
      saleId?: string;
      clienteSelecionado?: Customer.Props;
      carrinho?: {
        mode: CartType;
        content: Sale.CartItem[];
      };
      pagamentos?: Sale.Props["pagamentos"];
      desconto?: increaseOrDecrease;
      acrescimo?: increaseOrDecrease;
    }

    interface Props {
      id?: string;
      clienteId?: string;
      cliente?: Customer.Props;
      funcionarioId?: string;
      itens: ItemProps[];
      pagamentos: {
        externalChargeUrl?: string;
        metodoDePagamentoId: string;
        metodoDePagamento?: PaymentMethod.Props;
        installmentCount?: number;
        valor: number;
        observacao?: string;
      }[];
      desconto?: increaseOrDecrease;
      acrescimo?: increaseOrDecrease;
      total?: number;
      subtotal?: number;
      troco?: number;
      status: "PENDENTE" | "PAGO" | "CANCELADO";
      createdAt?: string;
      updatedAt?: string;
    }
  }
}
