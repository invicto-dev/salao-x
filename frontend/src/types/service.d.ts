export {};

declare global {
  namespace Service {
    interface Props {
      id?: string;
      nome: string;
      codigo?: string;
      categoria: string;
      valorEmAberto: boolean;
      preco: number;
      duracao: date;
      ativo: boolean;
      descricao?: string;
    }
  }
}
