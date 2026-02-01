import React, { useState, useEffect } from "react";
import {
  Plus,
  Upload as UploadIcon,
  FileText,
  ScanBarcode,
  Loader2,
  Trash2,
  AlertTriangle,
  X,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  useImportProducts,
  useProductCreate,
  useProductDelete,
  useProducts,
  useProductUpdate,
} from "@/hooks/use-products";
import { useImportJobStatus } from "@/hooks/use-import-jobs";
import { productColumns } from "@/constants/tables/products";
import { useDebounce } from "@/hooks/use-debounce";
import CategorySelect from "@/components/selects/CategorySelect";
import PagesLayout from "@/components/layout/PagesLayout";
import { DataTable } from "@/components/tables/DataTable";
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
  FormDescription,
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
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import { CurrencyInput } from "@/components/inputs/CurrencyInput";
import { NameInput } from "@/components/inputs/NameInput";
import BarCodeInput from "@/components/inputs/BarCodeInput";
import { unidadeMedidas } from "@/constants/products";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

const productSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  codigo: z.string().optional(),
  categoriaId: z.string().optional().nullable(),
  unidadeMedida: z.string().default("un"),
  descricao: z.string().optional(),
  preco: z.coerce.number().min(0, "Preço deve ser positivo"),
  custo: z.coerce.number().optional().nullable(),
  estoqueMinimo: z.coerce.number().optional().nullable(),
  estoqueInicial: z.coerce.number().optional().nullable(),
  ativo: z.boolean().default(true),
  contarEstoque: z.boolean().default(true),
  valorEmAberto: z.boolean().default(false),
});

type ProductFormValues = z.infer<typeof productSchema>;

const Produtos = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [params, setParams] = useState<any>({
    search: "",
    categoryId: undefined,
    status: undefined,
  });
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<any>(null);

  const debouncedSearch = useDebounce(params.search);

  const {
    data: products = [],
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useProducts({
    ...params,
    search: debouncedSearch,
  });

  const { mutateAsync: createProduct, isPending: isPendingCreate } =
    useProductCreate();
  const { mutateAsync: updateProduct, isPending: isPendingUpdate } =
    useProductUpdate();
  const { mutateAsync: deleteProduto } = useProductDelete();
  const { data: job } = useImportJobStatus(jobId);
  const { mutateAsync: importProducts, isPending: isPendingImport } =
    useImportProducts();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      nome: "",
      codigo: "",
      categoriaId: null,
      unidadeMedida: "un",
      descricao: "",
      preco: 0,
      custo: 0,
      estoqueMinimo: 0,
      estoqueInicial: 0,
      ativo: true,
      contarEstoque: true,
      valorEmAberto: false,
    },
  });

  useEffect(() => {
    if (editingProduct) {
      form.reset({
        ...editingProduct,
        categoriaId: editingProduct.categoriaId?.toString() || null,
      });
    } else {
      form.reset({
        nome: "",
        codigo: "",
        categoriaId: null,
        unidadeMedida: "un",
        descricao: "",
        preco: 0,
        custo: 0,
        estoqueMinimo: 0,
        estoqueInicial: 0,
        ativo: true,
        contarEstoque: true,
        valorEmAberto: false,
      });
    }
  }, [editingProduct, modalOpen]);

  const editarProduto = (produto: any) => {
    setEditingProduct(produto);
    setModalOpen(true);
  };

  const novoProduto = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const onSubmit = async (values: ProductFormValues) => {
    try {
      if (editingProduct) {
        await updateProduct({
          id: editingProduct.id,
          body: values,
        });
      } else {
        await createProduct(values);
      }
      setModalOpen(false);
    } catch (error) {
      toast.error("Erro ao salvar produto");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    try {
      const data = await importProducts(selectedFile);
      setJobId(data.data.jobId);
    } catch (error) {
      toast.error("Erro ao importar produtos");
    }
  };

  const clearImportModal = () => {
    setImportModalOpen(false);
    setSelectedFile(null);
    setJobId(null);
    refetch();
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    try {
      await deleteProduto(productToDelete.id);
      setProductToDelete(null);
    } catch (error) {
      toast.error("Erro ao excluir produto");
    }
  };

  const filters = [
    {
      element: (
        <BarCodeInput
          label="Produto"
          onChangeValue={(e) => setParams({ ...params, search: e })}
          value={params.search}
          sourceLength={products.length}
        />
      ),
    },
    {
      element: (
        <CategorySelect
          onChange={(e) => setParams({ ...params, categoryId: e })}
          value={params.categoryId}
          isFilter
          className="w-full sm:w-64"
        />
      ),
    },
    {
      element: (
        <Select
          value={params.status?.toString()}
          onValueChange={(value) =>
            setParams({
              ...params,
              status: value === "all" ? undefined : value === "true",
            })
          }
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="true">Ativo</SelectItem>
            <SelectItem value="false">Inativo</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
  ];

  return (
    <PagesLayout
      title="Gestão de Produtos"
      subtitle="Cadastre e gerencie produtos para venda"
      filters={filters}
      buttonsAfterFilters={[
        {
          label: "Importar CSV",
          icon: <UploadIcon className="mr-2 h-4 w-4" />,
          onClick: () => setImportModalOpen(true),
          variant: "outline",
        },
        {
          label: "Novo Produto",
          icon: <Plus className="mr-2 h-4 w-4" />,
          onClick: novoProduto,
        },
      ]}
      Error={{
        isError: isError,
        onClick: refetch,
      }}
    >
      <DataTable
        columns={productColumns(editarProduto, (p) => setProductToDelete(p))}
        data={products}
        loading={isLoading || isFetching}
      />

      {/* Modal Novo/Editar */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>
              {editingProduct ? "Editar Produto" : "Novo Produto"}
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-1 p-6 pt-2">
            <Form {...form}>
              <form
                id="product-form"
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="nome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Produto</FormLabel>
                          <FormControl>
                            <NameInput
                              placeholder="Ex: Shampoo Hidratante"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="codigo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Código/SKU</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <ScanBarcode className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input placeholder="Ex: SHAM001" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="categoriaId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Categoria</FormLabel>
                            <FormControl>
                              <CategorySelect
                                value={field.value || undefined}
                                onChange={field.onChange}
                                placeholder="Selecionar..."
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="unidadeMedida"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Unid. Medida</FormLabel>
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
                                {unidadeMedidas.map((un) => (
                                  <SelectItem key={un} value={un}>
                                    {un}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="descricao"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição</FormLabel>
                          <FormControl>
                            <Textarea
                              rows={3}
                              placeholder="Descreva o produto..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <FormLabel>Imagem do Produto</FormLabel>
                    <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center bg-muted/20">
                      <UploadIcon
                        size={32}
                        className="mx-auto text-muted-foreground mb-2"
                      />
                      <p className="text-sm font-medium">Upload desabilitado</p>
                      <p className="text-xs text-muted-foreground">
                        Em breve suporte para imagens
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="preco"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              Preço de Venda
                              <FormField
                                control={form.control}
                                name="valorEmAberto"
                                render={({ field: openField }) => (
                                  <div className="flex items-center space-x-1">
                                    <Checkbox
                                      id="valorEmAberto"
                                      checked={openField.value}
                                      onCheckedChange={openField.onChange}
                                      className="h-3 w-3"
                                    />
                                    <label
                                      htmlFor="valorEmAberto"
                                      className="text-[10px] font-normal leading-none"
                                    >
                                      Aberto?
                                    </label>
                                  </div>
                                )}
                              />
                            </FormLabel>
                            <FormControl>
                              <CurrencyInput
                                disabled={form.watch("valorEmAberto")}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="custo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preço de Custo</FormLabel>
                            <FormControl>
                              <CurrencyInput
                                {...field}
                                value={field.value || 0}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="estoqueMinimo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estoque Mín.</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                value={field.value || 0}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {!editingProduct && (
                        <FormField
                          control={form.control}
                          name="estoqueInicial"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Estoque Inicial</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  disabled={!form.watch("contarEstoque")}
                                  {...field}
                                  value={field.value || 0}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>

                    <div className="flex items-center justify-between border p-3 rounded-md bg-muted/10">
                      <FormField
                        control={form.control}
                        name="ativo"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between space-y-0 gap-2">
                            <FormLabel className="text-sm font-normal">
                              Ativo
                            </FormLabel>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="contarEstoque"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between space-y-0 gap-2">
                            <FormLabel className="text-sm font-normal">
                              Controlar Estoque
                            </FormLabel>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </form>
            </Form>
          </ScrollArea>

          <DialogFooter className="p-6 border-t">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              form="product-form"
              disabled={isPendingCreate || isPendingUpdate}
            >
              {(isPendingCreate || isPendingUpdate) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {editingProduct ? "Salvar Alterações" : "Cadastrar Produto"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Importar */}
      <Dialog open={importModalOpen} onOpenChange={setImportModalOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Importar Produtos via CSV</DialogTitle>
          </DialogHeader>

          {!job ? (
            <div className="space-y-6 py-4">
              <p className="text-sm text-muted-foreground">
                Selecione um arquivo CSV para adicionar produtos em massa.
              </p>

              <div className="flex justify-center">
                <Button variant="outline" asChild>
                  <a href="/produtos_modelo.csv" download>
                    <FileText className="mr-2 h-4 w-4" />
                    Baixar Modelo CSV
                  </a>
                </Button>
              </div>

              <div
                className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
                  selectedFile
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/20 hover:border-primary/50"
                }`}
                onClick={() => document.getElementById("csv-upload")?.click()}
              >
                <input
                  id="csv-upload"
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
                <UploadIcon className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
                {selectedFile ? (
                  <div className="flex items-center justify-center gap-2">
                    <span className="font-medium">{selectedFile.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-medium">
                      Clique para selecionar o arquivo
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Apenas arquivos .csv
                    </p>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6 py-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Progresso da Importação</h4>
                <Badge>{job.status}</Badge>
              </div>

              <Progress
                value={
                  job.totalRows > 0
                    ? (job.processedRows / job.totalRows) * 100
                    : 0
                }
              />

              <p className="text-xs text-center text-muted-foreground">
                {job.processedRows} de {job.totalRows} linhas processadas.
              </p>

              {(job.status === "CONCLUIDO" ||
                job.status === "CONCLUIDO_COM_ERROS") && (
                <div className="space-y-3 bg-muted/30 p-4 rounded-lg text-sm">
                  <p className="text-emerald-600 font-medium">
                    ✅ {job.successfulRows} produtos importados.
                  </p>
                  {job.failedRows > 0 && (
                    <p className="text-destructive font-medium">
                      ❌ {job.failedRows} produtos falharam.
                    </p>
                  )}

                  {job.results && job.results.length > 0 && (
                    <ScrollArea className="h-32 mt-2 border rounded p-2 bg-background">
                      {job.results.map((res: any, index: number) => (
                        <p key={index} className="text-[10px] mb-1">
                          <span className="font-bold">Linha {res.row}:</span>{" "}
                          {res.errors.join(", ")}
                        </p>
                      ))}
                    </ScrollArea>
                  )}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="ghost" onClick={clearImportModal}>
              {job ? "Fechar" : "Cancelar"}
            </Button>
            {!job && (
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || isPendingImport}
              >
                {isPendingImport && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Iniciar Importação
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmação de Exclusão */}
      <AlertDialog
        open={!!productToDelete}
        onOpenChange={(val) => !val && setProductToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="text-destructive size-5" />
              Confirmar Exclusão
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o produto{" "}
              <strong>{productToDelete?.nome}</strong>? Esta ação removerá todas
              as movimentações de estoque vinculadas a ele.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Não, cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Sim, Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PagesLayout>
  );
};

export default Produtos;
