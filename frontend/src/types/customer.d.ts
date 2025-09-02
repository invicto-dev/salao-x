import dayjs from "dayjs";

export {};

declare global {
  namespace Customer {
    interface Props {
      id?: string;
      nome: string;
      telefone: string;
      email?: string;
      cpf?: string;
      aniversario?: string;
      observacoes?: string;
      ativo: boolean;
    }
  }
}
