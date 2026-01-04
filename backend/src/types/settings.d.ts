declare global {
  namespace Settings {
    type Day =
      | "segunda"
      | "terca"
      | "quarta"
      | "quinta"
      | "sexta"
      | "sabado"
      | "domingo";

    type Hour = {
      start: Date;
      end: Date;
    };

    interface Payload {
      nomeEmpresa: string;
      cnpj?: string;
      endereco?: string;
      bairro?: string;
      cidade?: string;
      cep?: string;
      telefone?: string;
      email?: string;
      site?: string;
      horarioFuncionamento: Record<Day, Hour>;
      intervaloPadrao?: number;
      antecedenciaMinima?: number;
      notificarAgendamentos?: boolean;
      notificarEstoqueBaixo?: boolean;
      notificarAniversarios?: boolean;
      whatsappAtivo?: boolean;
      emailAtivo?: boolean;
      timezone?: string;
      currency?: string;
      asaasActive?: boolean;
      asaasApiKey?: string;
      asaasEnvironment?: string;
    }
  }
}

export {};
