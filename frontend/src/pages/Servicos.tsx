import React, { useState } from "react";
import {
  Scissors,
  Plus,
  Search,
  Edit,
  Clock,
  Trash2,
  AlertTriangle,
  Loader2
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  useServiceCreate,
  useServiceDelete,
  useServices,
  useServiceUpdate,
} from "@/hooks/use-services";
import { NameInput } from "@/components/inputs/NameInput";
import { CurrencyInput } from "@/components/inputs/CurrencyInput";
import DropdownComponent from "@/components/Dropdown";
import { useDebounce } from "@/hooks/use-debounce";
import BarCodeInput from "@/components/inputs/BarCodeInput";
import CategorySelect from "@/components/selects/CategorySelect";
import PagesLayout from "@/components/layout/PagesLayout";
import { DataTable } from "@/components/tables/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
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
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatCurrency } from "@/utils/formatCurrency";

const serviceSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  codigo: z.string().optional(),
  categoriaId: z.string().optional().nullable(),
  descricao: z.string().optional(),
  preco: z.coerce.number().min(0, "Preço deve ser positivo"),
  duracao: z.coerce.number().min(1, "Duração é obrigatória"),
  ativo: z.boolean().default(true),
  valorEmAberto: z.boolean().default(false),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

const Servicos = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [params, setParams] = useState<any>({ search: "", status: undefined });
  const [serviceToDelete, setServiceToDelete] = useState<any>(null);

  const debouncedBusca = useDebounce(params.search, 500);
  const { data: servicos = [], isLoading, isFetching, refetch } = useServices({
    search: debouncedBusca,
    status: params.status,
  });

  const { mutateAsync: createService, isPending: isCreating } = useServiceCreate();
  const { mutateAsync: updateService, isPending: isUpdating } = useServiceUpdate();
  const { mutateAsync: deleteServico } = useServiceDelete();

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      nome: "",
      codigo: "",
      categoriaId: null,
      descricao: "",
      preco: 0,
      duracao: 60,
      ativo: true,
      valorEmAberto: false,
    },
  });

  const formatDuracao = (minutos: number) => {
    if (!minutos) return "Não definido";
    if (minutos < 60) return `${minutos}min`;
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return mins > 0 ? `${horas}h ${mins}min` : `${horas}h`;
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "nome",
      header: "Serviço",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
            <Scissors size={18} className="text-muted-foreground" />
          </div>
          <div>
            <div className="font-medium">{row.original.nome}</div>
            <div className="text-[10px] text-muted-foreground uppercase">
              {row.original.codigo || "Sem código"} • {row.original.categoria?.nome || row.original.categoria || "Sem categoria"}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "preco",
      header: "Preço",
      cell: ({ row }) => (
        <div>
          <div className="font-semibold text-primary">{formatCurrency(row.original.preco)}</div>
          {row.original.valorEmAberto && (
            <div className="text-[10px] text-muted-foreground italic">Valor em aberto</div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "duracao",
      header: "Duração",
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Clock size={12} />
          {formatDuracao(row.original.duracao)}
        </div>
      ),
    },
    {
      accessorKey: "ativo",
      header: "Status",
      cell: ({ row }) => {
        const ativo = row.original.ativo;
        return (
          <Badge variant={ativo ? "outline" : "secondary"} className={ativo ? "text-emerald-600 border-emerald-600" : ""}>
            {ativo ? "Ativo" : "Inativo"}
          </Badge>
        );
      },
    },
    {
      id: "acoes",
      header: "Ações",
      cell: ({ row }) => (
        <div className="flex justify-center">
          <DropdownComponent
            menu={{
              items: [
                {
                  key: "editar",
                  icon: <Edit size={14} />,
                  label: "Editar",
                  onClick: () => {
                    setEditingService(row.original);
                    form.reset({
                      ...row.original,
                      categoriaId: row.original.categoriaId?.toString() || null,
                    });
                    setModalOpen(true);
                  },
                },
                {
                  key: "excluir",
                  icon: <Trash2 size={14} />,
                  label: "Excluir",
                  onClick: () => setServiceToDelete(row.original),
                  danger: true,
                },
              ],
            }}
          />
        </div>
      ),
    },
  ];

  const onSubmit = async (values: ServiceFormValues) => {
    try {
      if (editingService) {
        await updateService({ id: editingService.id, body: values });
        toast.success("Serviço atualizado com sucesso");
      } else {
        await createService(values);
        toast.success("Serviço criado com sucesso");
      }
      setModalOpen(false);
    } catch (error) {
      toast.error("Erro ao salvar serviço");
    }
  };

  const handleDelete = async () => {
    if (!serviceToDelete) return;
    try {
      await deleteServico(serviceToDelete.id);
      toast.success("Serviço excluído com sucesso");
      setServiceToDelete(null);
    } catch (error) {
      toast.error("Erro ao excluir serviço");
    }
  };

  return (
    <PagesLayout
      title="Gestão de Serviços"
      subtitle="Cadastre e gerencie serviços oferecidos pelo sistema."
      filters={[
        {
          element: (
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou código..."
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
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>
          ),
        },
      ]}
      buttonsAfterFilters={[
        {
          label: "Novo Serviço",
          icon: <Plus className="mr-2 h-4 w-4" />,
          onClick: () => {
            setEditingService(null);
            form.reset({
              nome: "",
              codigo: "",
              categoriaId: null,
              descricao: "",
              preco: 0,
              duracao: 60,
              ativo: true,
              valorEmAberto: false,
            });
            setModalOpen(true);
          },
        },
      ]}
    >
      <DataTable
        columns={columns}
        data={servicos}
        loading={isLoading || isFetching}
      />

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingService ? "Editar Serviço" : "Novo Serviço"}</DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[70vh] pr-4">
            <Form {...form}>
              <form id="service-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Serviço</FormLabel>
                        <FormControl>
                          <NameInput placeholder="Ex: Corte Feminino" {...field} />
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
                        <FormLabel>Código</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: CORT001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="categoriaId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <FormControl>
                        <CategorySelect value={field.value || undefined} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="descricao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea rows={3} placeholder="Descreva o serviço..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="preco"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          Preço
                          <FormField
                            control={form.control}
                            name="valorEmAberto"
                            render={({ field: openField }) => (
                              <div className="flex items-center space-x-1">
                                <Checkbox
                                  id="service-valor-aberto"
                                  checked={openField.value}
                                  onCheckedChange={openField.onChange}
                                  className="h-3 w-3"
                                />
                                <label htmlFor="service-valor-aberto" className="text-[10px] font-normal leading-none">Aberto?</label>
                              </div>
                            )}
                          />
                        </FormLabel>
                        <FormControl>
                          <CurrencyInput disabled={form.watch("valorEmAberto")} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="duracao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duração (Minutos)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="ativo"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Serviço Ativo</FormLabel>
                        <FormDescription>Define se o serviço aparecerá nas vendas e agendamentos.</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </ScrollArea>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" form="service-form" disabled={isCreating || isUpdating}>
              {(isCreating || isUpdating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingService ? "Salvar Alterações" : "Cadastrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!serviceToDelete} onOpenChange={(val) => !val && setServiceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="text-destructive size-5" />
              Confirmar Exclusão
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o serviço <strong>{serviceToDelete?.nome}</strong>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Não, manter</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Sim, Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PagesLayout>
  );
};

export default Servicos;
