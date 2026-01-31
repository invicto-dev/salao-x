import React from "react";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatSaleId } from "@/utils/formatSaleId";
import { Printer, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface ReciboVendaProps {
  venda: any | null; // Changed to any for flexibility, can be Sale.Props if defined
  open: boolean;
  onClose: () => void;
  nomeEmpresa?: string;
}

export const ReciboVenda = ({
  venda,
  open,
  onClose,
  nomeEmpresa = "Salão X",
}: ReciboVendaProps) => {
  if (!venda) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-[450px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Recibo de Venda</DialogTitle>
        </DialogHeader>

        <div id="recibo-content" className="space-y-4 py-4">
          <div className="text-center">
            <h3 className="text-xl font-bold">{nomeEmpresa}</h3>
            <p className="text-sm text-muted-foreground">Recibo de Venda</p>
            {venda.id && (
              <p className="text-xs text-muted-foreground">
                {formatSaleId(venda.id)}
              </p>
            )}
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="font-medium">Cliente:</span>
            <span>{venda.cliente?.nome || "Consumidor Final"}</span>
            <span className="font-medium">Data:</span>
            <span>{new Date(venda.createdAt).toLocaleString("pt-BR")}</span>
          </div>

          <Separator />
          <p className="text-center text-xs font-bold uppercase tracking-wider">Itens</p>
          <Separator />

          <div className="space-y-3">
            {venda.itens.map((item: any, index: number) => (
              <div key={index} className="flex justify-between text-sm">
                <div className="flex flex-col">
                  <span className="font-medium">{item.nome || "Item deletado"}</span>
                  <span className="text-xs text-muted-foreground">
                    {item.quantidade} x {formatCurrency(item.preco)}
                  </span>
                </div>
                <span className="font-medium">{formatCurrency(item.subtotal)}</span>
              </div>
            ))}
          </div>

          <Separator />

          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(venda.subtotal)}</span>
            </div>
            <div className="flex justify-between font-bold text-base pt-1">
              <span>Total:</span>
              <span>{formatCurrency(venda.total)}</span>
            </div>
          </div>

          <Separator />
          <p className="text-center text-xs font-bold uppercase tracking-wider">Pagamentos</p>
          <Separator />

          <div className="space-y-3">
            {venda.pagamentos.length > 0 ? (
              venda.pagamentos.map((pagamento: any, index: number) => (
                <div key={index} className="flex justify-between text-sm">
                  <div className="flex flex-col">
                    <span className="font-medium">{pagamento.metodoDePagamento.nome}</span>
                    {pagamento.metodoDePagamento.isCash && venda.troco > 0 && (
                      <span className="text-xs text-muted-foreground">
                        Troco: {formatCurrency(venda.troco)}
                      </span>
                    )}
                    {pagamento.installmentCount > 1 && (
                      <span className="text-xs text-muted-foreground">
                        {pagamento.installmentCount} X {formatCurrency(pagamento.valor / pagamento.installmentCount)}
                      </span>
                    )}
                  </div>
                  <span className="font-medium">{formatCurrency(pagamento.valor)}</span>
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-muted-foreground italic">Nenhum pagamento informado.</p>
            )}
          </div>

          <div className="text-center text-xs text-muted-foreground pt-4">
            <p>Obrigado pela preferência!</p>
          </div>
        </div>

        <DialogFooter className="flex sm:justify-between gap-2">
          <Button variant="outline" onClick={handlePrint} className="flex-1">
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
          <Button onClick={onClose} className="flex-1">
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
