import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { Loader2, DollarSign, Info, AlertTriangle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  closeCaixa,
  getCaixas,
  getCaixaSummary,
  hasOpenCaixa,
  moveCaixa,
  openCaixa,
} from "@/api/caixa";
import { formatCurrency } from "@/utils/formatCurrency";
import { CurrencyInput } from "@/components/inputs/CurrencyInput";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

export const usecaixas = () => {
  return useQuery<any[]>({
    queryKey: ["get-caixas"],
    queryFn: getCaixas,
  });
};

export const useHasOpenCaixa = () => {
  return useQuery<any | null>({
    queryKey: ["has-open-caixa"],
    queryFn: hasOpenCaixa,
  });
};

export const useOpenCaixa = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ body }: { body: any }) => {
      return await openCaixa(body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["has-open-caixa"] });
      queryClient.invalidateQueries({ queryKey: ["get-caixas"] });
      toast.success("Caixa aberto com sucesso.");
    },
    onError: (error: AxiosError<{ error: string }>) => {
      toast.error(error.response?.data?.error || "Erro ao abrir caixa");
    },
  });
};

export const useCloseCaixa = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ body }: { body: any }) => {
      return await closeCaixa(body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["has-open-caixa"] });
      queryClient.invalidateQueries({ queryKey: ["get-caixas"] });
      toast.success("Caixa fechado com sucesso.");
    },
    onError: (error: AxiosError<{ error: string }>) => {
      toast.error(error.response?.data?.error || "Erro ao fechar caixa");
    },
  });
};

export const useMoveCaixa = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ body }: { body: any }) => {
      return await moveCaixa(body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get-caixas"] });
      queryClient.invalidateQueries({ queryKey: ["get-caixa-summary"] });
      toast.success("Movimentação realizada com sucesso.");
    },
    onError: (error: AxiosError<{ error: string }>) => {
      toast.error(error.response?.data?.error || "Erro na movimentação");
    },
  });
};

const openCaixaSchema = z.object({
  valorAbertura: z.coerce.number().min(0, "Valor deve ser zero ou maior"),
});

const closeCaixaSchema = z.object({
  valorFechamentoInformado: z.coerce.number().min(0, "Valor deve ser zero ou maior"),
  observacoes: z.string().optional(),
});

export const useCaixaManager = () => {
  const [modalMode, setModalMode] = useState<"open" | "close" | null>(null);

  const { data: summary, isLoading: isLoadingSummary } =
    useQuery<any>({
      queryKey: ["get-caixa-summary"],
      queryFn: getCaixaSummary,
      enabled: modalMode === "close",
    });

  const { mutate: openCaixaMutate, isPending: isOpening } = useOpenCaixa();
  const { mutate: closeCaixaMutate, isPending: isClosing } = useCloseCaixa();

  const openForm = useForm({
    resolver: zodResolver(openCaixaSchema),
    defaultValues: { valorAbertura: 0 },
  });

  const closeForm = useForm({
    resolver: zodResolver(closeCaixaSchema),
    defaultValues: { valorFechamentoInformado: 0, observacoes: "" },
  });

  const handleOpen = () => setModalMode("open");
  const handleClose = () => setModalMode("close");
  const handleCancel = () => {
    openForm.reset();
    closeForm.reset();
    setModalMode(null);
  };

  const onOpenSubmit = (values: any) => {
    openCaixaMutate(
      { body: { valorAbertura: values.valorAbertura } },
      { onSuccess: handleCancel }
    );
  };

  const onCloseSubmit = (values: any) => {
    closeCaixaMutate(
      {
        body: {
          valorFechamentoInformado: values.valorFechamentoInformado,
          observacoes: values.observacoes,
        },
      },
      { onSuccess: handleCancel }
    );
  };

  const totalEsperadoEmCaixa =
    (summary?.valorAbertura || 0) + (summary?.saldoFisicoDinheiro || 0);

  const CaixaManagerModal = (
    <Dialog open={modalMode !== null} onOpenChange={(val) => !val && handleCancel()}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>{modalMode === "open" ? "Abrir Caixa" : "Fechar Caixa"}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6 pt-2">
          {modalMode === "open" && (
            <Form {...openForm}>
              <form id="open-caixa-form" onSubmit={openForm.handleSubmit(onOpenSubmit)} className="space-y-6">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Informação</AlertTitle>
                  <AlertDescription>
                    Insira o valor inicial (fundo de troco) para abrir o caixa e iniciar as vendas.
                  </AlertDescription>
                </Alert>
                <FormField
                  control={openForm.control}
                  name="valorAbertura"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor de Abertura</FormLabel>
                      <FormControl>
                        <CurrencyInput {...field} autoFocus />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          )}

          {modalMode === "close" && (
            isLoadingSummary ? (
              <div className="flex flex-col justify-center items-center py-20 gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Calculando totais...</p>
              </div>
            ) : (
              <Form {...closeForm}>
                <form id="close-caixa-form" onSubmit={closeForm.handleSubmit(onCloseSubmit)} className="space-y-6">
                  <div className="border rounded-lg p-5 space-y-4 bg-muted/20">
                    <h4 className="font-semibold flex items-center gap-2">
                      <DollarSign className="size-4" />
                      Conferência Física (Gaveta)
                    </h4>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground uppercase">Valor Abertura</p>
                        <p className="font-medium">{formatCurrency(summary?.valorAbertura)}</p>
                      </div>

                      {summary?.resumoPorMetodo?.filter((m: any) => m.isCash).map((metodo: any) => (
                        <div className="space-y-1" key={metodo.metodoId}>
                          <p className="text-xs text-muted-foreground uppercase">(+) Vendas {metodo.nome}</p>
                          <p className="font-medium">{formatCurrency(metodo.valorLiquido)}</p>
                        </div>
                      ))}

                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground uppercase">(+) Entradas</p>
                        <p className="font-medium">{formatCurrency(summary?.totalEntradas)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-destructive uppercase">(-) Saídas</p>
                        <p className="font-medium text-destructive">{formatCurrency(summary?.totalSaidas)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-destructive uppercase">(-) Troco Devolvido</p>
                        <p className="font-medium text-destructive">{formatCurrency(summary?.totalTroco)}</p>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Valor esperado na gaveta:</span>
                      <span className="text-xl font-bold text-emerald-600">
                        {formatCurrency(totalEsperadoEmCaixa)}
                      </span>
                    </div>
                  </div>

                  <div className="bg-muted/10 p-4 rounded-lg border">
                    <h5 className="text-sm font-semibold mb-3">Outros Recebimentos (Digital)</h5>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {summary?.resumoPorMetodo?.filter((m: any) => !m.isCash).map((metodo: any) => (
                        <div key={metodo.metodoId}>
                          <p className="text-[10px] text-muted-foreground uppercase">{metodo.nome}</p>
                          <p className="text-sm font-medium">{formatCurrency(metodo.valorBruto)}</p>
                        </div>
                      ))}
                      {summary?.resumoPorMetodo?.filter((m: any) => !m.isCash).length === 0 && (
                        <p className="text-xs text-muted-foreground col-span-full italic">Nenhuma venda digital registrada.</p>
                      )}
                    </div>
                  </div>

                  <Alert variant="warning" className="bg-amber-50 border-amber-200 text-amber-900">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertTitle>Atenção</AlertTitle>
                    <AlertDescription>
                      Conte o dinheiro físico da gaveta e informe abaixo para fechar.
                    </AlertDescription>
                  </Alert>

                  <FormField
                    control={closeForm.control}
                    name="valorFechamentoInformado"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor Contado em Dinheiro</FormLabel>
                        <FormControl>
                          <CurrencyInput {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={closeForm.control}
                    name="observacoes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observações</FormLabel>
                        <FormControl>
                          <Textarea rows={2} placeholder="Justificativas, quebras de caixa, etc..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            )
          )}
        </ScrollArea>

        <DialogFooter className="p-6 border-t">
          <Button variant="ghost" onClick={handleCancel}>Cancelar</Button>
          {modalMode === "open" ? (
            <Button onClick={openForm.handleSubmit(onOpenSubmit)} disabled={isOpening}>
              {isOpening && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Abrir Caixa
            </Button>
          ) : (
            <Button onClick={closeForm.handleSubmit(onCloseSubmit)} disabled={isClosing || isLoadingSummary}>
              {isClosing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmar Fechamento
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return {
    openCaixaModal: handleOpen,
    closeCaixaModal: handleClose,
    CaixaManagerModal,
  };
};
