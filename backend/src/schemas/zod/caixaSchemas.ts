import { z } from "zod";

export const createCaixaSchema = z.object({
  valorAbertura: z.number({
    required_error: "O valor de abertura é obrigatório.",
    invalid_type_error: "O valor de abertura deve ser um número.",
  }),
  observacoes: z.string().optional(),
});

export const closeCaixaSchema = z.object({
  valorFechamentoInformado: z
    .number({
      required_error: "O valor de fechamento é obrigatório.",
      invalid_type_error: "O valor de fechamento deve ser um número.",
    })
    .positive("O valor de fechamento deve ser positivo."),
  observacoes: z.string().optional(),
});

export const moveCaixaSchema = z.object({
  tipo: z.enum(["ENTRADA", "SAIDA"]),
  valor: z.number().positive(),
  motivo: z.string(),
});
