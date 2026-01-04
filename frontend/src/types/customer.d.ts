import dayjs from "dayjs";

export {};

declare global {
  namespace Customer {
    interface Body {
      nome?: string;
      telefone: string;
      email?: string;
      cpfCnpj?: string;
      aniversario?: string;
      observacoes?: string;
      ativo: boolean;
      creditLimit?: number;
      paymentDueDay?: number;
      assasCustomerId?: string;
      fine?: number;
      interest?: number;
    }
    interface Props extends Body {
      id?: string;
      createdAt: Date;
      updatedAt: Date;
    }
  }
}
