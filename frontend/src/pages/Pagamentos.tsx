import React, { useState } from "react";
import { Plus, Search, Upload as UploadIcon, List, Edit, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { NameInput } from "@/components/inputs/NameInput";
import {
  usePaymentMethodCreate,
  usePaymentMethodDelete,
  usePaymentMethods,
  usePaymentMethodUpdate,
} from "@/hooks/use-payment-methods";
import DropdownComponent from "@/components/Dropdown";
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

const paymentMethodSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  descricao: z.string().optional(),
  ativo: z.boolean().default(true),
});

type PaymentMethodFormValues = z.infer<typeof paymentMethodSchema>;

const MetodoDePagamentos = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<any>(null);
  const [params, setParams] = useState<any>({ search: "", status: undefined });
  const [methodToDelete, setMethodToDelete] = useState<any>(null);

  const { data: paymentMethods = [], isLoading, refetch } = usePaymentMethods();
  const { mutateAsync: createPaymentMethod, isPending: isCreating } = usePaymentMethodCreate();
  const { mutateAsync: updatePaymentMethod, isPending: isUpdating } = usePaymentMethodUpdate();
  const { mutateAsync: deletePaymentMethod } = usePaymentMethodDelete();

  const form = useForm<PaymentMethodFormValues>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: {
      nome: "",
      descricao: "",
      ativo: true,
    },
  });

  const paymentMethodsFiltered = paymentMethods.filter(
    (method: any) => {
      const matchBusca = method.nome.toLowerCase().includes(params.search.toLowerCase());
      const matchStatus =
        !params.status ||
        (params.status === "ativo" && method.ativo) ||
        (params.status === "inativo" && !method.ativo);
      return matchBusca && matchStatus;
    }
  );

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "nome",
      header: "Nome",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
            <List size={18} className="text-muted-foreground" />
          </div>
          <div className="font-medium">{row.original.nome}</div>
        </div>
      ),
    },
    {
      accessorKey: "descricao",
      header: "Descrição",
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.descricao || "-"}</span>,
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
                    setEditingMethod(row.original);
                    form.reset(row.original);
                    setModalOpen(true);
                  },
                },
                {
                  key: "excluir",
                  icon: <Trash2 size={14} />,
                  label: "Excluir",
                  onClick: () => setMethodToDelete(row.original),
                  danger: true,
                },
              ],
            }}
          />
        </div>
      ),
    },
  ];

  const onSubmit = async (values: PaymentMethodFormValues) => {
    try {
      if (editingMethod) {
        await updatePaymentMethod({ id: editingMethod.id, body: values });
        toast.success("Método de pagamento atualizado");
      } else {
        await createPaymentMethod(values);
        toast.success("Método de pagamento criado");
      }
      setModalOpen(false);
    } catch (error) {
      toast.error("Erro ao salvar método de pagamento");
    }
  };

  const handleDelete = async () => {
    if (!methodToDelete) return;
    try {
      await deletePaymentMethod(methodToDelete.id);
      toast.success("Método de pagamento excluído");
      setMethodToDelete(null);
    } catch (error) {
      toast.error("Erro ao excluir método de pagamento");
    }
  };

  return (
    <PagesLayout
      title="Gestão de Métodos de Pagamento"
      subtitle="Gerencie as formas de pagamento aceitas no seu estabelecimento"
      filters={[
        {
          element: (
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar pelo nome..."
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
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>
          ),
        },
      ]}
      buttonsAfterFilters={[
        {
          label: "Novo Método",
          icon: <Plus className="mr-2 h-4 w-4" />,
          onClick: () => {
            setEditingMethod(null);
            form.reset({ nome: "", descricao: "", ativo: true });
            setModalOpen(true);
          },
        },
      ]}
    >
      <DataTable
        columns={columns}
        data={paymentMethodsFiltered}
        loading={isLoading}
      />

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingMethod ? "Editar Método de Pagamento" : "Novo Método de Pagamento"}</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form id="payment-method-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
               <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <NameInput placeholder="Ex: Vale Alimentação" {...field} />
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
                        <Textarea rows={3} placeholder="Descreva o método de pagamento..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ativo"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Método Ativo</FormLabel>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
            </form>
          </Form>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" form="payment-method-form" disabled={isCreating || isUpdating}>
              {(isCreating || isUpdating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingMethod ? "Salvar" : "Cadastrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!methodToDelete} onOpenChange={(val) => !val && setMethodToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="text-destructive size-5" />
              Confirmar Exclusão
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o método de pagamento <strong>{methodToDelete?.nome}</strong>?
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

export default MetodoDePagamentos;
