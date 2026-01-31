import React, { useState } from "react";
import {
  ShoppingCart,
  User,
  X,
  CircleX,
  CircleMinus,
  ClipboardPenLine,
  CreditCard,
  Eraser,
  Trash2,
  Plus,
  Minus,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { useCaixaManager, useHasOpenCaixa } from "@/hooks/use-caixa";
import SelectCustomerDrawer from "../../drawers/SelectCustomer";
import { formatCurrency } from "@/utils/formatCurrency";
import { useSaleCreate } from "@/hooks/use-sales";
import CartSummary from "./Summary";
import { formatItem } from "@/utils/cart/formatItem";
import PercentageOrCurrencyInput from "../../inputs/PercentagemOrCurrency";
import { INITIAL_STATE } from "@/constants/sales";
import { Payments } from "./Payments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface Props {
  total: number;
  subtotal: number;
  salesSession: any;
  updateSaleSession: (updates: any) => void;
}

export default function Cart({
  total,
  subtotal,
  salesSession,
  updateSaleSession,
}: Props) {
  const { data: cash, isFetching: isFetchingCaixa } = useHasOpenCaixa();
  const { mutateAsync: create, isPending: isOpenOrder } = useSaleCreate();

  const { CaixaManagerModal, openCaixaModal, closeCaixaModal } = useCaixaManager();

  const [openSelectCustomerModal, setOpenSelectCustomerModal] = useState<boolean>(false);

  const isOpenCash = !isFetchingCaixa && cash && cash.id;

  const { carrinho, clienteSelecionado, acrescimo, desconto } = salesSession;
  const emptyCart = !carrinho?.content?.length;

  const handleSelectCustomer = (customer: any) => {
    updateSaleSession({ clienteSelecionado: customer });
  };

  const removeFromCart = (index: number) => {
    updateSaleSession({
      carrinho: {
        mode: carrinho.mode,
        content: carrinho.content.filter((_: any, i: number) => i !== index),
      },
    });
  };

  const alterarQuantidade = (index: number, novaQuantidade: number) => {
    if (novaQuantidade <= 0) {
      removeFromCart(index);
      return;
    }

    const newCart = carrinho.content.map((item: any, i: number) =>
      i === index ? { ...item, quantidade: novaQuantidade } : item
    );
    updateSaleSession({ carrinho: { mode: carrinho.mode, content: newCart } });
  };

  const clearCart = () => {
    updateSaleSession(INITIAL_STATE());
  };

  const openOrder = async () => {
    if (emptyCart) {
      toast.error("O carrinho está vazio.");
      return;
    }
    try {
      await create({
        clienteId: clienteSelecionado?.id,
        subtotal: subtotal,
        total: total,
        itens: carrinho.content.map(formatItem),
        status: "PENDENTE",
      });
      toast.success("Comanda aberta com sucesso!");
      clearCart();
    } catch (error) {
      console.error(error);
    }
  };

  const changeToPayment = () => {
    updateSaleSession({ carrinho: { ...carrinho, mode: "payment" } });
  };

  return (
    <Card className="h-full flex flex-col shadow-sm border-none overflow-hidden relative">
      <CardHeader className="border-b pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Carrinho
            <Badge variant="secondary" className="ml-1">{carrinho?.content?.length || 0}</Badge>
          </CardTitle>

          <div className="flex items-center gap-2">
            {clienteSelecionado ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-primary/5 text-primary border-primary/20 hover:bg-primary/10"
                      onClick={() => updateSaleSession({ clienteSelecionado: null, pagamentos: [] })}
                    >
                      <User className="mr-2 h-4 w-4" />
                      {clienteSelecionado.nome.split(" ")[0]}
                      <X className="ml-2 h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Desvincular Cliente</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <Button size="sm" onClick={() => setOpenSelectCustomerModal(true)}>
                <User className="mr-2 h-4 w-4" />
                Vincular Cliente
              </Button>
            )}

            {isOpenCash && (
              <Button variant="ghost" size="icon" onClick={closeCaixaModal} title="Fechar Caixa">
                <CircleX className="h-5 w-5 text-muted-foreground hover:text-destructive transition-colors" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden flex flex-col p-0">
        {!isOpenCash && !isFetchingCaixa && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px] z-20 flex flex-col justify-center items-center p-6 text-center space-y-4">
            <div className="bg-muted p-4 rounded-full">
               <CircleMinus size={40} className="text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold">Caixa Fechado</h3>
              <p className="text-sm text-muted-foreground">
                Você precisa abrir o caixa para iniciar as vendas.
              </p>
            </div>
            <Button size="large" onClick={openCaixaModal} className="w-full max-w-xs">
              Abrir Caixa
            </Button>
          </div>
        )}

        <div className="flex-1 overflow-hidden flex flex-col">
          {carrinho.mode === "sale" ? (
            <>
              <ScrollArea className="flex-1 px-6">
                <div className="py-4 space-y-4">
                  {emptyCart ? (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground italic">
                      <p className="text-sm text-center">O carrinho está vazio.</p>
                    </div>
                  ) : (
                    carrinho.content.map((item: any, index: number) => (
                      <div key={`${item.id}-${index}`} className="flex justify-between items-start gap-4 pb-4 border-b last:border-0">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.nome}</p>
                          <p className="text-xs text-muted-foreground">{formatCurrency(item.preco)}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                           <div className="flex items-center border rounded-md h-8 overflow-hidden">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-none border-r"
                                onClick={() => alterarQuantidade(index, item.quantidade - 1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-10 text-center text-sm font-medium">{item.quantidade}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-none border-l"
                                onClick={() => alterarQuantidade(index, item.quantidade + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                           </div>
                           <Button
                             variant="ghost"
                             size="icon"
                             className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                             onClick={() => removeFromCart(index)}
                           >
                             <Trash2 className="h-3 w-3" />
                           </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>

              <div className="p-6 bg-muted/20 border-t space-y-4">
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Acréscimo</label>
                      <PercentageOrCurrencyInput
                        type={acrescimo?.type}
                        value={acrescimo?.value}
                        onChange={(value) => updateSaleSession({ acrescimo: { ...acrescimo, value: Number(value) } })}
                        onChangeAddon={(value) => updateSaleSession({ acrescimo: { ...acrescimo, type: value } })}
                      />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Desconto</label>
                      <PercentageOrCurrencyInput
                        maxCurrency={total}
                        type={desconto?.type}
                        value={desconto?.value}
                        onChange={(value) => updateSaleSession({ desconto: { ...desconto, value: Number(value) } })}
                        onChangeAddon={(value) => updateSaleSession({ desconto: { ...desconto, type: value } })}
                      />
                   </div>
                </div>

                <CartSummary
                  total={total}
                  subtotal={subtotal}
                  decrease={salesSession.desconto}
                  increase={salesSession.acrescimo}
                />

                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    className="text-destructive hover:bg-destructive/5 hover:text-destructive"
                    onClick={clearCart}
                    disabled={emptyCart}
                  >
                    <Eraser className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={openOrder}
                    disabled={emptyCart || isOpenOrder}
                  >
                    {isOpenOrder ? <Loader2 className="h-4 w-4 animate-spin" /> : <ClipboardPenLine className="h-4 w-4 mr-2" />}
                    Comanda
                  </Button>
                  <Button
                    onClick={changeToPayment}
                    disabled={emptyCart}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pagar
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <Payments
              total={total}
              salesSession={salesSession}
              updateSaleSession={updateSaleSession}
              clearCart={clearCart}
            />
          )}
        </div>
      </CardContent>

      <SelectCustomerDrawer
        open={openSelectCustomerModal}
        onClose={() => setOpenSelectCustomerModal(false)}
        onSelect={handleSelectCustomer}
      />
      {CaixaManagerModal}
    </Card>
  );
}
