import React, { useState, useMemo } from "react";
import {
  Plus,
  Search,
  TicketPlus,
  TicketX,
  CircleX,
  CircleArrowRight,
  AlertTriangle,
  Loader2
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { useAuth } from "@/contexts/AuthContext";
import { useCaixaManager, usecaixas, useMoveCaixa } from "@/hooks/use-caixa";
import { formatCurrency } from "@/utils/formatCurrency";
import { columnsCaixa } from "@/constants/tables/caixa";
import PagesLayout from "@/components/layout/PagesLayout";
import { DataTable } from "@/components/tables/DataTable";
import { CurrencyInput } from "@/components/inputs/CurrencyInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const moveSchema = z.object({
  valor: z.coerce.number().min(0.01, "Valor deve ser maior que zero"),
  motivo: z.string().min(1, "Motivo é obrigatório"),
});

type MoveFormValues = z.infer<typeof moveSchema>;

const Caixa = () => {
  const { user } = useAuth();
  const [busca, setBusca] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalMove, setModalMove] = useState<{ visible: boolean; tipo: any }>({
    visible: false,
    tipo: null,
  });
  const [caixaSelecionado, setCaixaSelecionado] = useState<any | null>(null);

  const { openCaixaModal, closeCaixaModal, CaixaManagerModal } = useCaixaManager();
  const { data: caixas = [], isLoading: isLoadingCaixas, isFetching: isFetchingCaixas } = usecaixas();
  const { mutateAsync: moveCaixa, isPending: isMoving } = useMoveCaixa();

  const formMove = useForm<MoveFormValues>({
    resolver: zodResolver(moveSchema),
    defaultValues: { valor: 0, motivo: "" },
  });

  const caixasFiltrados = useMemo(() => {
    return caixas.filter(
      (caixa: any) =>
        caixa.status.toLowerCase().includes(busca.toLowerCase()) ||
        caixa.valorAbertura.toString().includes(busca) ||
        new Date(caixa.dataAbertura).toLocaleString("pt-BR").includes(busca)
    );
  }, [caixas, busca]);

  const handleMovimentacao = (tipo: any) => {
    formMove.reset({ valor: 0, motivo: "" });
    setModalMove({ visible: true, tipo });
  };

  const handleMoveFinish = async (values: MoveFormValues) => {
    if (!caixaSelecionado) return;
    try {
      await moveCaixa({
        body: {
          tipo: modalMove.tipo,
          valor: values.valor,
          motivo: values.motivo,
        },
      });
      setModalMove({ visible: false, tipo: null });
      setDrawerOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const gerenciarCaixa = (caixa: any) => {
    setCaixaSelecionado(caixa);
    setDrawerOpen(true);
  };

  const columns = useMemo(() => columnsCaixa(gerenciarCaixa), []);

  return (
    <PagesLayout
      title="Gestão de Caixa"
      subtitle="Abra, feche e gerencie o caixa do seu estabelecimento"
      filters={[
        {
          element: (
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por status, valor, data..."
                className="pl-9"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
          ),
        },
      ]}
      buttonsAfterFilters={[
        {
          label: "Abrir Caixa",
          icon: <Plus className="mr-2 h-4 w-4" />,
          onClick: openCaixaModal,
        },
      ]}
    >
      <DataTable
        columns={columns}
        data={caixasFiltrados.filter((f: any) => f.id !== user?.id)}
        loading={isLoadingCaixas || isFetchingCaixas}
      />

      {/* Drawer de Detalhes */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-full sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Detalhes do Caixa</SheetTitle>
          </SheetHeader>
          {caixaSelecionado && (
            <ScrollArea className="h-[calc(100vh-80px)] pr-4">
              <div className="space-y-6 py-6">
                <div className="grid grid-cols-2 gap-4 text-sm border p-4 rounded-lg bg-muted/30">
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Abertura</p>
                    <p className="font-medium">{new Date(caixaSelecionado.dataAbertura).toLocaleString("pt-BR")}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Fechamento</p>
                    <p className="font-medium">
                      {caixaSelecionado.dataFechamento ? new Date(caixaSelecionado.dataFechamento).toLocaleString("pt-BR") : "-"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Status</p>
                    <Badge variant={caixaSelecionado.status === "ABERTO" ? "outline" : "secondary"}>
                      {caixaSelecionado.status}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Abertura</p>
                    <p className="font-medium">{formatCurrency(caixaSelecionado.valorAbertura)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Fechamento Inf.</p>
                    <p className="font-medium">{formatCurrency(caixaSelecionado.valorFechamentoInformado)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Fechamento Calc.</p>
                    <p className="font-medium">{formatCurrency(caixaSelecionado.valorFechamentoCalculado)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Diferença</p>
                    <p className={`font-bold ${caixaSelecionado.diferenca < 0 ? "text-destructive" : "text-emerald-600"}`}>
                      {formatCurrency(caixaSelecionado.diferenca)}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Movimentações</h4>
                  <div className="space-y-3">
                    {caixaSelecionado.movimentacoes?.length > 0 ? (
                      caixaSelecionado.movimentacoes.map((mov: any, index: number) => {
                        const isEntrada = mov.tipo === "ENTRADA";
                        return (
                          <div key={index} className="flex justify-between items-center text-sm border-b pb-2">
                            <div>
                              <p className="font-medium">{mov.motivo || "(sem motivo)"}</p>
                              <p className="text-[10px] text-muted-foreground">
                                {new Date(mov.createdAt).toLocaleString("pt-BR")} • {mov.funcionario?.nome}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className={`font-bold ${isEntrada ? "text-emerald-600" : "text-destructive"}`}>
                                {isEntrada ? "+" : "-"} {formatCurrency(mov.valor)}
                              </p>
                              <Badge variant="outline" className="text-[10px] h-4">
                                {isEntrada ? "Entrada" : "Saída"}
                              </Badge>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-muted-foreground italic text-center py-4">Nenhuma movimentação registrada.</p>
                    )}
                  </div>
                </div>

                {caixaSelecionado.status === "ABERTO" && (
                  <div className="pt-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline" className="w-full" onClick={() => handleMovimentacao("SAIDA")}>
                        <TicketX className="mr-2 h-4 w-4" />
                        Sangria (Saída)
                      </Button>
                      <Button variant="outline" className="w-full" onClick={() => handleMovimentacao("ENTRADA")}>
                        <TicketPlus className="mr-2 h-4 w-4" />
                        Entrada
                      </Button>
                    </div>
                    <Button variant="destructive" className="w-full" onClick={() => {
                      setDrawerOpen(false);
                      closeCaixaModal();
                    }}>
                      <CircleX className="mr-2 h-4 w-4" />
                      Fechar Caixa
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </SheetContent>
      </Sheet>

      {/* Modal de Movimentação */}
      <Dialog open={modalMove.visible} onOpenChange={(val) => !val && setModalMove({ visible: false, tipo: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Nova Movimentação - {modalMove.tipo === "ENTRADA" ? "Entrada" : "Saída"}
            </DialogTitle>
          </DialogHeader>

          <Form {...formMove}>
            <form id="move-form" onSubmit={formMove.handleSubmit(handleMoveFinish)} className="space-y-4">
              <FormField
                control={formMove.control}
                name="valor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor</FormLabel>
                    <FormControl>
                      <CurrencyInput {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formMove.control}
                name="motivo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motivo</FormLabel>
                    <FormControl>
                      <Textarea rows={3} placeholder="Descreva o motivo..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setModalMove({ visible: false, tipo: null })}>Cancelar</Button>
            <Button type="submit" form="move-form" disabled={isMoving}>
              {isMoving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Executar Movimentação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {CaixaManagerModal}
    </PagesLayout>
  );
};

export default Caixa;
