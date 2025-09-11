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
      contarEstoque: boolean;
      estoque?: number;
      ativo: boolean;
      descricao?: string;
    }
  }
}
