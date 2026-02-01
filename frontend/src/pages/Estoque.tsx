import React, { useState, useMemo } from "react";
import {
  Package,
  Plus,
  AlertTriangle,
  Edit,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  useStockKpis,
  useRecentStockMovements,
  useStockMovementCreate,
} from "@/hooks/use-stock";
import { formatCurrency } from "@/utils/formatCurrency";
import { useProducts, useProductUpdate } from "@/hooks/use-products";
import { NameInput } from "@/components/inputs/NameInput";
import { CurrencyInput } from "@/components/inputs/CurrencyInput";
import { useDebounce } from "@/hooks/use-debounce";
import BarCodeInput from "@/components/inputs/BarCodeInput";
import CategorySelect from "@/components/selects/CategorySelect";
import PagesLayout from "@/components/layout/PagesLayout";
import { DataTable } from "@/components/tables/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ManagerPasswordDialog } from "@/components/modais/ManagerPasswordDialog";
import { useAuth } from "@/contexts/AuthContext";

const productUpdateSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  estoqueMinimo: z.coerce.number().min(0),
  preco: z.coerce.number().min(0),
  custo: z.coerce.number().min(0),
});

const movementSchema = z.object({
  produtoId: z.string().min(1, "Produto é obrigatório"),
  tipo: z.string().min(1, "Tipo é obrigatório"),
  motivo: z.string().min(1, "Motivo é obrigatório"),
  quantidade: z.coerce.number().min(0.01, "Quantidade deve ser maior que zero"),
});

const Estoque = () => {
  const { user } = useAuth();
  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [modalMovimentacaoOpen, setModalMovimentacaoOpen] = useState(false);
  const [modalManagerOpen, setModalManagerOpen] = useState(false);
  const [pendingMovement, setPendingMovement] = useState<any>(null);
  const [produtoSelecionado, setProdutoSelecionado] = useState<any>(null);

  const [params, setParams] = useState<any>({
    search: "",
    categoryId: undefined,
  });
  const debouncedSearch = useDebounce(params.search);

  const {
    data: products = [],
    isLoading: isLoadingProducts,
    refetch: refetchProducts,
  } = useProducts({
    ...params,
    contarEstoque: true,
    search: debouncedSearch,
  });

  const { mutateAsync: updateProduct, isPending: isUpdatingProduct } =
    useProductUpdate();
  const { data: kpis, isLoading: isLoadingKpis } = useStockKpis();
  const { data: recentMovements = [], isLoading: isLoadingMovements } =
    useRecentStockMovements();
  const { mutateAsync: createMovement, isPending: isCreatingMovement } =
    useStockMovementCreate();

  const editForm = useForm({
    resolver: zodResolver(productUpdateSchema),
    defaultValues: { nome: "", estoqueMinimo: 0, preco: 0, custo: 0 },
  });

  const movementForm = useForm({
    resolver: zodResolver(movementSchema),
    defaultValues: {
      produtoId: "",
      tipo: "ENTRADA",
      motivo: "COMPRA",
      quantidade: 1,
    },
  });

  const abrirModalEditar = (produto: any) => {
    setProdutoSelecionado(produto);
    editForm.reset({
      nome: produto.nome,
      estoqueMinimo: produto.estoqueMinimo ?? 0,
      preco: produto.preco ?? 0,
      custo: produto.custo ?? 0,
    });
    setModalEditarOpen(true);
  };

  const handleUpdateProduct = async (values: any) => {
    if (!produtoSelecionado) return;
    try {
      await updateProduct({ id: produtoSelecionado.id, body: values });
      setModalEditarOpen(false);
    } catch (error) {
      toast.error("Erro ao atualizar produto");
    }
  };

  const handleCreateMovement = async (values: any) => {
    const isManager = ["ROOT", "ADMIN", "GERENTE"].includes(user?.role || "");

    if (!isManager) {
      setPendingMovement(values);
      setModalManagerOpen(true);
      return;
    }

    try {
      await createMovement(values);
      setModalMovimentacaoOpen(false);
      movementForm.reset();
    } catch (error) {
      // O hook já trata o erro com toast
    }
  };

  const handleManagerSuccess = async (password: string) => {
    if (!pendingMovement) return;

    try {
      await createMovement({ ...pendingMovement, managerPassword: password });
      setModalMovimentacaoOpen(false);
      setPendingMovement(null);
      movementForm.reset();
    } catch (error) {
      // O hook já trata o erro com toast
    }
  };

  const productColumns: ColumnDef<any>[] = [
    {
      accessorKey: "nome",
      header: "Produto",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.nome}</div>
          <div className="text-[10px] text-muted-foreground uppercase">
            {row.original.categoria?.nome ||
              row.original.categoria ||
              "Sem categoria"}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "estoqueAtual",
      header: "Estoque Atual",
      cell: ({ row }) => {
        const estoque = row.original.estoqueAtual;
        const minimo = row.original.estoqueMinimo;
        let variant: "default" | "destructive" | "outline" | "secondary" =
          "default";
        let className = "";

        if (estoque === 0) variant = "destructive";
        else if (estoque <= minimo)
          className = "bg-amber-500 hover:bg-amber-600";
        else className = "bg-emerald-500 hover:bg-emerald-600";

        return (
          <div className="flex flex-col items-center">
            <span className="font-semibold text-sm">
              {estoque} {row.original.unidadeMedida}
            </span>
            <Badge
              variant={variant}
              className={`text-[10px] py-0 h-4 ${className}`}
            >
              {estoque === 0
                ? "Sem estoque"
                : estoque <= minimo
                  ? "Baixo"
                  : "Normal"}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "estoqueMinimo",
      header: "Mínimo",
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.estoqueMinimo} {row.original.unidadeMedida}
        </span>
      ),
    },
    {
      id: "precos",
      header: "Preço/Custo",
      cell: ({ row }) => (
        <div className="text-xs">
          <div className="font-semibold text-primary">
            {formatCurrency(row.original.preco ?? 0)}
          </div>
          <div className="text-muted-foreground italic">
            Custo: {formatCurrency(row.original.custo ?? 0)}
          </div>
        </div>
      ),
    },
    {
      id: "acoes",
      header: "Ações",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => abrirModalEditar(row.original)}
        >
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </Button>
      ),
    },
  ];

  const movementColumns: ColumnDef<any>[] = [
    {
      accessorKey: "createdAt",
      header: "Data",
      cell: ({ row }) =>
        new Date(row.original.createdAt).toLocaleDateString("pt-BR"),
    },
    {
      accessorKey: "produto.nome",
      header: "Produto",
      cell: ({ row }) => row.original.produto?.nome || "Excluído",
    },
    {
      accessorKey: "tipo",
      header: "Tipo",
      cell: ({ row }) => {
        const isEntrada = row.original.tipo === "ENTRADA";
        return (
          <Badge
            variant={isEntrada ? "outline" : "secondary"}
            className={
              isEntrada
                ? "text-emerald-600 border-emerald-600"
                : "text-destructive border-destructive"
            }
          >
            {isEntrada ? (
              <ArrowUpRight className="mr-1 h-3 w-3" />
            ) : (
              <ArrowDownLeft className="mr-1 h-3 w-3" />
            )}
            {row.original.tipo}
          </Badge>
        );
      },
    },
    { accessorKey: "quantidade", header: "Qtd." },
    { accessorKey: "motivo", header: "Motivo" },
  ];

  return (
    <PagesLayout
      title="Controle de Estoque"
      subtitle="Gerencie entradas, saídas e níveis de estoque"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="border-none shadow-sm bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Package className="h-4 w-4" />
              Produtos Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingKpis ? "..." : kpis?.totalProdutos}
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-amber-50 dark:bg-amber-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-600 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Estoque Baixo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {isLoadingKpis ? "..." : kpis?.produtosEstoqueBaixo}
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-emerald-50 dark:bg-emerald-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-600 flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Valor Total (Custo)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {isLoadingKpis
                ? "..."
                : formatCurrency(kpis?.valorTotalEstoque ?? 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
              <BarCodeInput
                value={params.search}
                onChangeValue={(e) => setParams({ ...params, search: e })}
              />
              <CategorySelect
                value={params.categoryId}
                onChange={(e) => setParams({ ...params, categoryId: e })}
                isFilter
                className="w-full sm:w-64"
              />
            </div>
            <Button onClick={() => setModalMovimentacaoOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Movimentação
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Situação dos Produtos</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={productColumns}
              data={products}
              loading={isLoadingProducts}
            />
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Movimentações Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={movementColumns}
              data={recentMovements}
              loading={isLoadingMovements}
            />
          </CardContent>
        </Card>
      </div>

      {/* Modal Editar */}
      <Dialog open={modalEditarOpen} onOpenChange={setModalEditarOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Produto em Estoque</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form
              id="edit-stock-form"
              onSubmit={editForm.handleSubmit(handleUpdateProduct)}
              className="space-y-4"
            >
              <FormField
                control={editForm.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <NameInput {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="estoqueMinimo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estoque Mínimo</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="preco"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço de Venda</FormLabel>
                      <FormControl>
                        <CurrencyInput {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="custo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço de Custo</FormLabel>
                      <FormControl>
                        <CurrencyInput {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setModalEditarOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              form="edit-stock-form"
              disabled={isUpdatingProduct}
            >
              {isUpdatingProduct && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Verificação de Gerente */}
      <ManagerPasswordDialog
        open={modalManagerOpen}
        onOpenChange={setModalManagerOpen}
        onSuccess={handleManagerSuccess}
      />

      {/* Modal Movimentação */}
      <Dialog
        open={modalMovimentacaoOpen}
        onOpenChange={setModalMovimentacaoOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Movimentação</DialogTitle>
          </DialogHeader>
          <Form {...movementForm}>
            <form
              id="move-stock-form"
              onSubmit={movementForm.handleSubmit(handleCreateMovement)}
              className="space-y-4"
            >
              <FormField
                control={movementForm.control}
                name="produtoId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Produto</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um produto..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {products.map((p: any) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={movementForm.control}
                  name="tipo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ENTRADA">Entrada</SelectItem>
                          <SelectItem value="SAIDA">Saída</SelectItem>
                          <SelectItem value="AJUSTE">Ajuste</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={movementForm.control}
                  name="quantidade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantidade</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={movementForm.control}
                name="motivo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motivo</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="COMPRA">Compra</SelectItem>
                        <SelectItem value="VENDA">Venda</SelectItem>
                        <SelectItem value="QUEBRA">Quebra</SelectItem>
                        <SelectItem value="VENCIMENTO">Vencimento</SelectItem>
                        <SelectItem value="DEVOLUCAO">Devolução</SelectItem>
                        <SelectItem value="AJUSTE_INVENTARIO">
                          Ajuste de Inventário
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setModalMovimentacaoOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              form="move-stock-form"
              disabled={isCreatingMovement}
            >
              {isCreatingMovement && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PagesLayout>
  );
};

export default Estoque;
