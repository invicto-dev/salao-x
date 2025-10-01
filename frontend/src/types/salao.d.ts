export {};

declare global {
  namespace Salon {
    interface Horario {
      inicio: string; // ex: "08:00"
      fim: string; // ex: "18:00"
    }

    type DiaSemana =
      | "segunda"
      | "terca"
      | "quarta"
      | "quinta"
      | "sexta"
      | "sabado"
      | "domingo";

    interface Config {
      id?: string;
      // Informações da Empresa
      nomeEmpresa: string;
      cnpj: string;
      endereco: string;
      bairro: string;
      cidade: string;
      cep: string;
      telefone: string;
      email: string;
      site?: string;

      // Configurações de Negócio
      horarioFuncionamento: Record<DiaSemana, Horario>;
      intervaloPadrao: number; // minutos
      antecedenciaMinima: number; // minutos

      // Notificações
      notificarAgendamentos: boolean;
      notificarEstoqueBaixo: boolean;
      notificarAniversarios: boolean;
      whatsappAtivo: boolean;
      emailAtivo: boolean;

      // Sistema
      manterHistorico: number;
      timezone: string;
    }
  }
}
