import React, { useState } from "react";
import { ArrowLeft, MinusCircle, Receipt, Loader2, Plus, Minus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { CurrencyInput } from "../../inputs/CurrencyInput";
import { formatCurrency } from "@/utils/formatCurrency";
import { CardWithDisabled } from "../../cards/cardWithDisabled";
import { useFinishedCommand, useSaleCreate } from "@/hooks/use-sales";
import { formatItem } from "@/utils/cart/formatItem";
import { usePaymentMethods } from "@/hooks/use-payment-methods";
import { useReciboVenda } from "@/hooks/use-recibo-venda";
import { getSale } from "@/api/sales";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PaymentsProps {
  total: number;
  salesSession: any;
  updateSaleSession: (updates: any) => void;
  clearCart: () => void;
}

const paymentAmountSchema = z.object({
  valor: z.coerce.number().min(0.01, "O valor deve ser maior que zero"),
});

export const Payments: React.FC<PaymentsProps> = ({
  total,
  salesSession,
  updateSaleSession,
  clearCart,
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mutateAsync: createSale, isPending: isCreatingSale } = useSaleCreate();
  const { mutateAsync: finishedCommand, isPending: isFinishedCommand } = useFinishedCommand();
  const { data: paymentMethods = [] } = usePaymentMethods();
  const { abrirRecibo, ReciboComponent } = useReciboVenda(clearCart);

  const [selectedMethod, setSelectedMethod] = useState<any | null>(null);
  const { pagamentos, carrinho, clienteSelecionado, desconto, acrescimo } = salesSession;

  const form = useForm({
    resolver: zodResolver(paymentAmountSchema),
    defaultValues: { valor: 0 },
  });

  const emptyCart = !carrinho?.content?.length;
  const totalPago = pagamentos?.reduce((acc: number, p: any) => acc + p.valor, 0) || 0;
  const valorRestante = total - totalPago;
  const troco = valorRestante < 0 ? Math.abs(valorRestante) : 0;

  const openPaymentModal = (method: any) => {
    setSelectedMethod(method);
    form.reset({
      valor: valorRestante > 0 ? Number(valorRestante.toFixed(2)) : Number(total.toFixed(2)),
    });
  };

  const handleAddPayment = (values: { valor: number }) => {
    if (!selectedMethod) return;
    updateSaleSession({
      pagamentos: [
        ...pagamentos,
        {
          metodoDePagamentoId: selectedMethod.id,
          valor: Number(values.valor) || 0,
          installmentCount: 1,
        },
      ],
    });
    setSelectedMethod(null);
  };

  const handleRemovePayment = (id: string) => {
    updateSaleSession({
      pagamentos: pagamentos.filter((p: any) => p.metodoDePagamentoId !== id),
    });
  };

  const handleInstallmentChange = (id: string, delta: number) => {
    updateSaleSession({
      pagamentos: pagamentos.map((p: any) =>
        p.metodoDePagamentoId === id
          ? { ...p, installmentCount: Math.max(1, (p.installmentCount || 1) + delta) }
          : p
      ),
    });
  };

  const finalizeSale = async () => {
    if (emptyCart) {
      toast.error("Carrinho vazio!");
      return;
    }
    if (pagamentos?.length === 0) {
      toast.error("Adicione ao menos uma forma de pagamento.");
      return;
    }
    if (totalPago < total - 0.01) {
      toast.error("O valor pago é menor que o total da venda.");
      return;
    }

    try {
      let payload: any = {
        clienteId: clienteSelecionado?.id,
        itens: carrinho.content.map(formatItem),
        troco,
        pagamentos,
        acrescimo,
        desconto,
      };

      let result;
      if (salesSession.saleId) {
        result = await finishedCommand({ id: salesSession.saleId, body: payload });
        navigate(".", { replace: true });
      } else {
        result = await createSale(payload);
      }

      const completeSale = await queryClient.fetchQuery({
        queryKey: ["get-sale", result.id],
        queryFn: () => getSale(result.id),
      });
      abrirRecibo(completeSale);
    } catch (error: any) {
      toast.error(error.message || "Erro ao finalizar a venda.");
    }
  };

  return (
    <div className="space-y-6 flex flex-col h-full">
      <Button variant="ghost" size="sm" className="w-fit" onClick={() => updateSaleSession({ carrinho: { ...carrinho, mode: "sale" } })}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar ao carrinho
      </Button>

      <Card className="bg-muted/30 border-none shadow-none">
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Total</p>
              <p className="text-sm font-bold">{formatCurrency(total)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Restante</p>
              <p className={`text-sm font-bold ${valorRestante > 0.01 ? "text-destructive" : "text-emerald-600"}`}>
                {formatCurrency(valorRestante > 0 ? valorRestante : 0)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Troco</p>
              <p className="text-sm font-bold text-primary">{formatCurrency(troco)}</p>
            </div>
          </div>
          <Progress value={total > 0 ? (totalPago / total) * 100 : 0} className="h-1.5" />
        </CardContent>
      </Card>

      <ScrollArea className="flex-1 -mx-2 px-2">
        <div className="space-y-4">
          {pagamentos?.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pagamentos Selecionados</h4>
              {pagamentos.map((pagamento: any) => {
                const method = paymentMethods?.find((f: any) => f.id === pagamento.metodoDePagamentoId);
                return (
                  <div key={pagamento.metodoDePagamentoId} className="flex justify-between items-center p-3 rounded-lg border bg-card shadow-sm">
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{method?.nome}</p>
                      {pagamento.installmentCount > 1 && (
                        <div className="flex items-center gap-2 mt-1">
                           <Button variant="outline" size="icon" className="h-5 w-5" onClick={() => handleInstallmentChange(pagamento.metodoDePagamentoId, -1)}>
                              <Minus className="h-3 w-3" />
                           </Button>
                           <span className="text-[10px] font-medium">{pagamento.installmentCount}x {formatCurrency(pagamento.valor / pagamento.installmentCount)}</span>
                           <Button variant="outline" size="icon" className="h-5 w-5" onClick={() => handleInstallmentChange(pagamento.metodoDePagamentoId, 1)}>
                              <Plus className="h-3 w-3" />
                           </Button>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-sm">{formatCurrency(pagamento.valor)}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() => handleRemovePayment(pagamento.metodoDePagamentoId)}
                      >
                        <MinusCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Formas de Pagamento</h4>
            <div className="grid grid-cols-2 gap-2">
              {paymentMethods.map((forma: any) => {
                const isAdded = pagamentos?.some((p: any) => p.metodoDePagamentoId === forma.id);
                return (
                  <CardWithDisabled
                    key={forma.id}
                    disabled={isAdded && forma.isCash}
                    onClick={() => {
                      if (isAdded && !forma.isCash) {
                        handleInstallmentChange(forma.id, 1);
                      } else if (!isAdded) {
                        openPaymentModal(forma);
                      }
                    }}
                    className={`p-3 relative overflow-hidden ${isAdded ? "border-primary bg-primary/5" : ""}`}
                  >
                    <p className="text-sm font-medium text-center">{forma.nome}</p>
                    {isAdded && (
                      <Badge className="absolute -top-1 -right-1 scale-75">
                         {pagamentos.find((p: any) => p.metodoDePagamentoId === forma.id)?.installmentCount || 1}x
                      </Badge>
                    )}
                  </CardWithDisabled>
                );
              })}
            </div>
          </div>
        </div>
      </ScrollArea>

      <div className="pt-4 border-t">
        <Button
          className="w-full h-12 text-lg font-bold"
          disabled={valorRestante > 0.01 || isCreatingSale || isFinishedCommand}
          onClick={finalizeSale}
        >
          {(isCreatingSale || isFinishedCommand) ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Receipt className="mr-2 h-5 w-5" />}
          Finalizar Venda
        </Button>
      </div>

      <Dialog open={!!selectedMethod} onOpenChange={(val) => !val && setSelectedMethod(null)}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>Adicionar {selectedMethod?.nome}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form id="payment-amount-form" onSubmit={form.handleSubmit(handleAddPayment)} className="space-y-4 pt-2">
               <FormField
                  control={form.control}
                  name="valor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor a ser pago</FormLabel>
                      <FormControl>
                        <CurrencyInput {...field} autoFocus />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </form>
          </Form>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setSelectedMethod(null)}>Cancelar</Button>
            <Button type="submit" form="payment-amount-form">Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ReciboComponent />
    </div>
  );
};
