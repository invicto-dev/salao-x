export {};

declare global {
  namespace Employee {
    interface Props {
      id: string;
      nome: string;
      email: string;
      telefone: string;
      funcao: string;
      comissao: number;
      ativo: boolean;
      role: "ROOT" | "ADMIN" | "GERENTE" | "SECRETARIO" | "FUNCIONARIO";
      senha: string;
    }
  }
}
