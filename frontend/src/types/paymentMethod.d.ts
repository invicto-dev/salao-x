export {};

declare global {
  namespace PaymentMethod {
    interface Props {
      id?: string;
      nome: string;
      descricao?: string;
      ativo: boolean;
      chavePix?: string;
    }
  }
}
