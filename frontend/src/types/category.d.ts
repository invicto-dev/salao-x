export {};

declare global {
  namespace Category {
    interface Props {
      id?: string;
      nome: string;
      descricao?: string;
      ativo: boolean;
    }
  }
}
