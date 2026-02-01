import React, { useState } from "react";
import {
  Plus,
  Search,
  Edit,
  Phone,
  Mail,
  Gift,
  Calendar,
  ShoppingBag,
  User,
  IdCard,
  Trash2,
  AlertTriangle,
  MoreVertical,
} from "lucide-react";
import dayjs from "dayjs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  useCustomerCreate,
  useCustomerDelete,
  useCustomers,
  useCustomerUpdate,
} from "@/hooks/use-customer";
import { PhoneInput } from "@/components/inputs/PhoneInput";
import { CpfInput } from "@/components/inputs/CpfInput";
import { NameInput } from "@/components/inputs/NameInput";
import { CurrencyInput } from "@/components/inputs/CurrencyInput";
import DropdownComponent from "@/components/Dropdown";
import PagesLayout from "@/components/layout/PagesLayout";
import { DataTable } from "@/components/tables/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

const customerSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  telefone: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  cpfCnpj: z.string().optional(),
  creditLimit: z.coerce.number().optional().nullable(),
  interest: z.coerce.number().optional().nullable(),
  paymentDueDay: z.coerce.number().optional().nullable(),
  fine: z.coerce.number().optional().nullable(),
  aniversario: z.string().optional().nullable(),
  ativo: z.boolean().default(true),
  observacoes: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

const Clientes = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [detalhesOpen, setDetalhesOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [clienteSelecionado, setClienteSelecionado] = useState<any>(null);
  const [clienteToDelete, setClienteToDelete] = useState<any>(null);
  const [busca, setBusca] = useState("");

  const { data: costumers = [], isLoading, isError, refetch } = useCustomers();
  const { mutateAsync: createCustomer } = useCustomerCreate();
  const { mutateAsync: updateCustomer } = useCustomerUpdate();
  const { mutateAsync: deleteCustomer } = useCustomerDelete();

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      nome: "",
      telefone: "",
      email: "",
      cpfCnpj: "",
      creditLimit: 0,
      interest: 0,
      paymentDueDay: 10,
      fine: 0,
      aniversario: null,
      ativo: true,
      observacoes: "",
    },
  });

  const clientesFiltrados = (costumers || []).filter(
    (cliente: any) =>
      cliente.nome.toLowerCase().includes(busca.toLowerCase()) ||
      cliente.telefone.includes(busca) ||
      cliente?.email?.toLowerCase().includes(busca.toLowerCase())
  );

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "nome",
      header: "Cliente",
      cell: ({ row }) => {
        const record = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback>{record.nome.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{record.nome}</div>
              {record.cpfCnpj && (
                <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <IdCard size={10} />
                  {record.cpfCnpj}
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      id: "contato",
      header: "Contato",
      cell: ({ row }) => {
        const record = row.original;
        return (
          <div className="space-y-0.5 text-xs">
            {record.telefone && (
              <div className="flex items-center gap-2">
                <Phone size={10} className="text-muted-foreground" />
                {record.telefone}
              </div>
            )}
            {record.email && (
              <div className="flex items-center gap-2">
                <Mail size={10} className="text-muted-foreground" />
                {record.email}
              </div>
            )}
            {record.aniversario && (
              <div className="flex items-center gap-2">
                <Calendar size={10} className="text-muted-foreground" />
                {dayjs(record.aniversario).format("DD/MM")}
              </div>
            )}
          </div>
        );
      },
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
      cell: ({ row }) => {
        const record = row.original;
        return (
          <div className="flex items-center justify-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => {
              setClienteSelecionado(record);
              setDetalhesOpen(true);
            }}>
              <Search className="size-4" />
            </Button>
            <DropdownComponent
              menu={{
                items: [
                  {
                    key: "editar",
                    icon: <Edit size={14} />,
                    label: "Editar",
                    onClick: () => {
                      setEditingClient(record);
                      form.reset({
                        ...record,
                        aniversario: record.aniversario ? dayjs(record.aniversario).format("YYYY-MM-DD") : null,
                      });
                      setModalOpen(true);
                    },
                  },
                  {
                    key: "excluir",
                    icon: <Trash2 size={14} />,
                    label: "Excluir",
                    onClick: () => setClienteToDelete(record),
                    danger: true,
                  },
                ],
              }}
            />
          </div>
        );
      },
    },
  ];

  const onSubmit = async (values: CustomerFormValues) => {
    try {
      if (editingClient) {
        await updateCustomer({
          id: editingClient.id,
          body: values,
        });
        toast.success("Cliente atualizado com sucesso");
      } else {
        await createCustomer(values);
        toast.success("Cliente criado com sucesso");
      }
      setModalOpen(false);
      setEditingClient(null);
    } catch (error) {
      toast.error("Erro ao salvar cliente");
    }
  };

  const handleDelete = async () => {
    if (!clienteToDelete) return;
    try {
      await deleteCustomer(clienteToDelete.id);
      toast.success("Cliente excluído com sucesso");
      setClienteToDelete(null);
    } catch (error) {
      toast.error("Erro ao excluir cliente");
    }
  };

  return (
    <PagesLayout
      title="Gestão de Clientes"
      subtitle="Cadastre e gerencie informações dos clientes"
      filters={[
        {
          element: (
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, telefone ou email..."
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
          label: "Novo Cliente",
          icon: <Plus className="mr-2 h-4 w-4" />,
          onClick: () => {
            setEditingClient(null);
            form.reset({
              nome: "",
              telefone: "",
              email: "",
              cpfCnpj: "",
              creditLimit: 0,
              interest: 0,
              paymentDueDay: 10,
              fine: 0,
              aniversario: null,
              ativo: true,
              observacoes: "",
            });
            setModalOpen(true);
          },
        },
      ]}
      Error={{
        isError: isError,
        onClick: refetch,
      }}
    >
      <DataTable
        columns={columns}
        data={clientesFiltrados}
        loading={isLoading}
      />

      {/* Modal Cadastro/Edição */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>{editingClient ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-1 p-6 pt-2">
            <Form {...form}>
              <form id="customer-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo</FormLabel>
                        <FormControl>
                          <NameInput placeholder="Ex: Joana Pereira" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="telefone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <PhoneInput {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="cliente@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cpfCnpj"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CPF/CNPJ</FormLabel>
                        <FormControl>
                          <CpfInput {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="creditLimit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Limite de Crédito</FormLabel>
                        <FormControl>
                          <CurrencyInput {...field} value={field.value || 0} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="paymentDueDay"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dia de Pagamento</FormLabel>
                        <Select value={field.value?.toString()} onValueChange={(val) => field.onChange(parseInt(val))}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o dia" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[5, 10, 15, 20, 25].map((day) => (
                              <SelectItem key={day} value={day.toString()}>{day}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="aniversario"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Aniversário</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex items-center gap-4 pt-8">
                    <FormField
                      control={form.control}
                      name="ativo"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <FormLabel className="font-normal">Cliente Ativo</FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="observacoes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações</FormLabel>
                      <FormControl>
                        <Textarea rows={3} placeholder="Observações sobre o cliente..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </ScrollArea>

          <DialogFooter className="p-6 border-t">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" form="customer-form">
              {editingClient ? "Atualizar" : "Cadastrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Detalhes */}
      <Dialog open={detalhesOpen} onOpenChange={setDetalhesOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes - {clienteSelecionado?.nome}</DialogTitle>
          </DialogHeader>

          {clienteSelecionado && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="bg-muted/30 border-none">
                  <CardHeader className="p-4 pb-0">
                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Fidelidade</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <div className="flex items-center gap-2">
                      <Gift className="text-pink-500" size={18} />
                      <span className="text-2xl font-bold">{clienteSelecionado.pontosFidelidade || 0}</span>
                      <span className="text-xs text-muted-foreground">pts</span>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-muted/30 border-none">
                  <CardHeader className="p-4 pb-0">
                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Cliente desde</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="text-primary" size={18} />
                      <span className="text-sm font-bold">
                        {dayjs(clienteSelecionado.dataCadastro).format("DD/MM/YYYY")}
                      </span>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-muted/30 border-none">
                  <CardHeader className="p-4 pb-0">
                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Último Atendimento</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="text-emerald-500" size={18} />
                      <span className="text-sm font-bold">
                        {clienteSelecionado.ultimoAtendimento
                          ? dayjs(clienteSelecionado.ultimoAtendimento).format("DD/MM/YYYY")
                          : "Nunca"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue="info">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="info">Informações</TabsTrigger>
                  <TabsTrigger value="history">Histórico</TabsTrigger>
                  <TabsTrigger value="agenda">Agendamentos</TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-semibold">Telefone:</p>
                      <p className="text-muted-foreground">{clienteSelecionado.telefone || "Não informado"}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Email:</p>
                      <p className="text-muted-foreground">{clienteSelecionado.email || "Não informado"}</p>
                    </div>
                    <div>
                      <p className="font-semibold">CPF/CNPJ:</p>
                      <p className="text-muted-foreground">{clienteSelecionado.cpfCnpj || "Não informado"}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Aniversário:</p>
                      <p className="text-muted-foreground">
                        {clienteSelecionado.aniversario ? dayjs(clienteSelecionado.aniversario).format("DD/MM/YYYY") : "Não informado"}
                      </p>
                    </div>
                  </div>
                  {clienteSelecionado.observacoes && (
                    <div className="p-3 bg-muted rounded-md border text-sm">
                      <p className="font-semibold mb-1">Observações:</p>
                      <p className="text-muted-foreground">{clienteSelecionado.observacoes}</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="history" className="pt-4">
                   <p className="text-sm text-center text-muted-foreground italic py-10">
                     Histórico de compras será integrado em breve.
                   </p>
                </TabsContent>

                <TabsContent value="agenda" className="pt-4">
                   <p className="text-sm text-center text-muted-foreground italic py-10">
                     Agendamentos serão integrados em breve.
                   </p>
                </TabsContent>
              </Tabs>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setDetalhesOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AlertDialog Exclusão */}
      <AlertDialog open={!!clienteToDelete} onOpenChange={(val) => !val && setClienteToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="text-destructive size-5" />
              Confirmar Exclusão
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o cliente <strong>{clienteToDelete?.nome}</strong>?
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

export default Clientes;
