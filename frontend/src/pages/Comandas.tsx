import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardCopy, Search, Eye, Loader2 } from "lucide-react";

import PagesLayout from "@/components/layout/PagesLayout";
import { useDebounce } from "@/hooks/use-debounce";
import { useSales } from "@/hooks/use-sales";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDateTime } from "@/utils/formatDateTime";
import { formatSaleId } from "@/utils/formatSaleId";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const Comandas = () => {
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");
  const debouncedBusca = useDebounce(busca, 500);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [saleSelecionada, setSaleSelecionada] = useState<any>(null);

  const {
    data: sales = [],
    isLoading,
    isError,
    refetch,
  } = useSales({
    search: debouncedBusca,
    status: "PENDENTE",
  });

  const navigateToPdv = (id: string) => {
    navigate({
      pathname: "/pdv",
      search: `?pedido=${id}`,
    });
  };

  const abrirDetalhes = (sale: any) => {
    setSaleSelecionada(sale);
    setDrawerOpen(true);
  };

  return (
    <PagesLayout
      title="Comandas"
      subtitle="Gerencie todas as vendas em aberto no sistema."
      filters={[
        {
          element: (
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar comanda por cliente ou ID..."
                className="pl-9"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
          ),
        },
      ]}
      Error={{
        isError: isError,
        onClick: refetch,
      }}
    >
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : sales.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
          <p>Nenhuma comanda aberta encontrada.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sales.map((sale: any) => (
            <Card
              key={sale.id}
              className="cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-all group"
              onClick={() => abrirDetalhes(sale)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                   <CardTitle className="text-sm font-bold text-primary">{formatSaleId(sale.id)}</CardTitle>
                   <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Eye className="h-4 w-4" />
                   </Button>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {sale.cliente?.nome || "Consumidor Final"}
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                 <p className="text-2xl font-bold">{formatCurrency(sale.total)}</p>
                 <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-tight">
                   Atualizado: {formatDateTime(sale.updatedAt)}
                 </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Drawer de Detalhes */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Comanda {saleSelecionada && formatSaleId(saleSelecionada.id)}</SheetTitle>
          </SheetHeader>

          {saleSelecionada && (
            <div className="space-y-6 py-6 h-full flex flex-col">
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4 text-sm border p-4 rounded-lg bg-muted/30">
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Cliente</p>
                      <p className="font-medium">{saleSelecionada.cliente?.nome || "Consumidor Final"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Data</p>
                      <p className="font-medium">{formatDateTime(saleSelecionada.createdAt)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Subtotal</p>
                      <p className="font-medium">{formatCurrency(saleSelecionada.subtotal)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Total</p>
                      <p className="font-bold text-lg">{formatCurrency(saleSelecionada.total)}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Itens da Comanda</h4>
                    <div className="space-y-3">
                      {saleSelecionada.itens.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between items-center text-sm border-b pb-2">
                          <div>
                            <p className="font-medium">{item.produto?.nome || item.servico?.nome || "Item deletado"}</p>
                            <p className="text-xs text-muted-foreground">{item.quantidade} x {formatCurrency(item.preco)}</p>
                          </div>
                          <p className="font-medium">{formatCurrency(item.subtotal)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>

              <div className="pt-4">
                <Button
                  className="w-full"
                  onClick={() => navigateToPdv(saleSelecionada.id)}
                >
                  <ClipboardCopy className="mr-2 h-4 w-4" />
                  Resgatar no PDV
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </PagesLayout>
  );
};

export default Comandas;
