export {};

declare global {
  namespace Product {
    interface Props {
      id?: string;
      nome: string;
      codigo?: string;
      categoria: string;
      preco: number;
      custo: number;
      valorEmAberto?: boolean;
      estoqueAtual?: number;
      estoqueMinimo?: number;
      unidadeMedida: string;
      contarEstoque: boolean;
      ativo: boolean;
      descricao?: string;
    }
  }
}
