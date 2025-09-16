import dayjs from "dayjs";

export {};

declare global {
  namespace Category {
    interface Props {
      id?: string;
      nome: string;
      description?: string;
      ativo: boolean;
    }
  }
}
