export {};

declare global {
  namespace Caixa {
    interface Props {
      id: string;
      dataAbertura: Date;
      dataFechamento?: Date;
      valorAbertura: number;
      valorFechamentoInformado?: number;
      valorFechamentoCalculado?: number;
      diferenca?: number;
      status: CaixaStatus;
      observacoes?: string;
      funcionarioAberturaId: string;
      funcionarioAbertura: Employee.Props;
      funcionarioFechamentoId: string;
      funcionarioFechamento: Employee.Props;
      movimentacoes: CaixaMovimentacao[];
      createdAt: Date;
      updatedAt: Date;
    }

    type CaixaStatus = "ABERTO" | "FECHADO";
    type CaixaMovimentacaoTipo = "ENTRADA" | "SAIDA";

    interface CaixaMovimentacao {
      id: string;
      valor: number;
      tipo: CaixaMovimentacaoTipo;
      motivo: string;
      caixaId: string;
      funcionarioId: string;
      funcionario: Employee.Props;
      createdAt: Date;
      updatedAt: Date;
    }

    export interface MetodoResumo {
      metodoId: string;
      nome: string;
      isCash: boolean;
      valorBruto: number;
      valorLiquido: number;
    }

    export interface SummaryResponse {
      resumoPorMetodo: MetodoResumo[];
      totalVendasGeral: number;
      totalTroco: number;
      totalEntradas: number;
      totalSaidas: number;
      saldoFisicoDinheiro: number;
      valorAbertura: number;
    }

    interface BodyOpen {
      valorAbertura: number;
      observacoes?: string;
    }

    interface BodyClose {
      valorFechamentoInformado: number;
      observacoes?: string;
    }

    interface BodyMoveCaixa {
      tipo: CaixaMovimentacaoTipo;
      valor: number;
      motivo: string;
    }
  }
}
