import React, { useState } from "react";
import {
  Ban,
  Receipt,
  Search,
  Eye,
  AlertTriangle,
  DollarSign,
} from "lucide-react";
import { useSales, useSaleUpdateStatus } from "@/hooks/use-sales";
import { useReciboVenda } from "@/hooks/use-recibo-venda";
import { formatCurrency } from "@/utils/formatCurrency";
import DropdownComponent from "@/components/Dropdown";
import { formatSaleId } from "@/utils/formatSaleId";
import PagesLayout from "@/components/layout/PagesLayout";
import { useDebounce } from "@/hooks/use-debounce";
import { DataTable } from "@/components/tables/DataTable";
import { formatDateTime } from "@/utils/formatDateTime";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

type Venda = any;

const Vendas = () => {
  const [params, setParams] = useState<any>({
    search: "",
    status: undefined
  });
  const debouncedSearch = useDebounce(params.search);

  const {
    data: vendas = [],
    isLoading,
    isError,
    refetch,
  } = useSales({
    ...params,
    search: debouncedSearch,
  });

  const { mutate: update } = useSaleUpdateStatus();
  const [vendaSelecionada, setVendaSelecionada] = useState<Venda | null>(null);
  const [vendaParaCancelar, setVendaParaCancelar] = useState<Venda | null>(null);
  const { ReciboComponent, abrirRecibo } = useReciboVenda();

  const handleCancelarVenda = (vendaId: string) => {
    update({
      id: vendaId,
      body: {
        status: "CANCELADO",
      },
    });
    setVendaParaCancelar(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAGO":
        return <Badge className="bg-emerald-500 hover:bg-emerald-600">PAGO</Badge>;
      case "PENDENTE":
        return <Badge variant="outline" className="text-amber-500 border-amber-500">PENDENTE</Badge>;
      case "CANCELADO":
        return <Badge variant="destructive">CANCELADO</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const columns: ColumnDef<Venda>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => <span className="font-bold">{formatSaleId(row.original.id)}</span>,
    },
    {
      accessorKey: "createdAt",
      header: "Data/Hora",
      cell: ({ row }) => formatDateTime(row.original.createdAt),
    },
    {
      accessorKey: "cliente",
      header: "Cliente",
      cell: ({ row }) => row.original.cliente?.nome || "Consumidor Final",
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }) => formatCurrency(row.original.total),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      id: "acoes",
      header: "Ações",
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setVendaSelecionada(row.original)}>
            <Eye className="size-4" />
          </Button>
          <DropdownComponent
            menu={{
              items: [
                {
                  key: "1",
                  label: "Imprimir Recibo",
                  icon: <Receipt size={14} />,
                  onClick: () => abrirRecibo(row.original),
                },
                {
                  key: "2",
                  label: "Cancelar Venda",
                  icon: <Ban size={14} />,
                  danger: true,
                  onClick: () => setVendaParaCancelar(row.original),
                },
              ],
            }}
          />
        </div>
      ),
    },
  ];

  const filters = [
    {
      element: (
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente ou ID..."
            className="pl-9"
            value={params.search}
            onChange={(e) => setParams({ ...params, search: e.target.value })}
          />
        </div>
      ),
    },
    {
      element: (
        <Select
          value={params.status}
          onValueChange={(value) => setParams({ ...params, status: value === "all" ? undefined : value })}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="PAGO">Pago</SelectItem>
            <SelectItem value="PENDENTE">Pendente</SelectItem>
            <SelectItem value="CANCELADO">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
  ];

  return (
    <PagesLayout
      title="Histórico de Vendas"
      subtitle="Gerencie e consulte todas as vendas registradas no sistema."
      filters={filters}
      Error={{
        isError: isError,
        onClick: refetch,
      }}
    >
      <DataTable
        columns={columns}
        data={vendas}
        loading={isLoading}
      />

      {/* Drawer de Detalhes */}
      <Sheet open={!!vendaSelecionada} onOpenChange={(val) => !val && setVendaSelecionada(null)}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Detalhes da Venda {vendaSelecionada && formatSaleId(vendaSelecionada.id)}</SheetTitle>
          </SheetHeader>
          {vendaSelecionada && (
            <ScrollArea className="h-[calc(100vh-100px)] pr-4">
              <div className="space-y-6 py-6">
                <div className="grid grid-cols-2 gap-4 text-sm border p-4 rounded-lg bg-muted/30">
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Cliente</p>
                    <p className="font-medium">{vendaSelecionada.cliente?.nome || "Consumidor Final"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Data</p>
                    <p className="font-medium">{new Date(vendaSelecionada.createdAt).toLocaleString("pt-BR")}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Status</p>
                    <div>{getStatusBadge(vendaSelecionada.status)}</div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Total</p>
                    <p className="font-bold text-lg">{formatCurrency(vendaSelecionada.total)}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Receipt className="size-4" />
                    Itens Vendidos
                  </h4>
                  <div className="space-y-3">
                    {vendaSelecionada.itens.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between items-center text-sm border-b pb-2">
                        <div>
                          <p className="font-medium">{item.nome || "Item deletado"}</p>
                          <p className="text-xs text-muted-foreground">{item.quantidade} x {formatCurrency(item.preco)}</p>
                        </div>
                        <p className="font-medium">{formatCurrency(item.subtotal)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <DollarSign className="size-4" />
                    Pagamentos
                  </h4>
                  <div className="space-y-3">
                    {vendaSelecionada.pagamentos.length > 0 ? (
                      vendaSelecionada.pagamentos.map((pagamento: any, index: number) => (
                        <div key={index} className="flex justify-between items-center text-sm border-b pb-2">
                          <div>
                            <p className="font-medium">{pagamento.metodoDePagamento.nome}</p>
                            {pagamento.metodoDePagamento.isCash && vendaSelecionada.troco > 0 && (
                              <p className="text-xs text-muted-foreground">Troco: {formatCurrency(vendaSelecionada.troco)}</p>
                            )}
                          </div>
                          <p className="font-medium">{formatCurrency(pagamento.valor)}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground italic">Nenhum pagamento informado.</p>
                    )}
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <Button variant="outline" className="w-full" onClick={() => abrirRecibo(vendaSelecionada)}>
                    <Receipt className="mr-2 h-4 w-4" />
                    Imprimir Recibo
                  </Button>
                  {vendaSelecionada.status !== "CANCELADO" && (
                    <Button variant="destructive" className="w-full" onClick={() => setVendaParaCancelar(vendaSelecionada)}>
                      <Ban className="mr-2 h-4 w-4" />
                      Cancelar Venda
                    </Button>
                  )}
                </div>
              </div>
            </ScrollArea>
          )}
        </SheetContent>
      </Sheet>

      {/* Modal de Confirmação de Cancelamento */}
      <AlertDialog open={!!vendaParaCancelar} onOpenChange={(val) => !val && setVendaParaCancelar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="text-destructive size-5" />
              Confirmar Cancelamento
            </AlertDialogTitle>
            <AlertDialogDescription>
              Você tem certeza que deseja cancelar a venda {vendaParaCancelar && formatSaleId(vendaParaCancelar.id)}?
              Esta ação não pode ser desfeita e os produtos retornarão ao estoque (se aplicável).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Não, manter</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleCancelarVenda(vendaParaCancelar.id)} className="bg-destructive hover:bg-destructive/90">
              Sim, Cancelar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ReciboComponent />
    </PagesLayout>
  );
};

export default Vendas;
