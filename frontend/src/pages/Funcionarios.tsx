import React, { useState } from "react";
import {
  Plus,
  Search,
  Edit,
  Phone,
  Mail,
  User,
  Percent,
  Trash2,
  AlertTriangle,
  Lock,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  useFuncionarioCreate,
  useFuncionarioDelete,
  useFuncionarios,
  useFuncionarioUpdate,
} from "@/hooks/use-funcionarios";
import { PhoneInput } from "@/components/inputs/PhoneInput";
import { NameInput } from "@/components/inputs/NameInput";
import DropdownComponent from "@/components/Dropdown";
import { useAuth } from "@/contexts/AuthContext";
import { formatRoleName } from "@/utils/formatRoleName";
import { hasPermission, hierarchyPositionCheck } from "@/utils/permissions";
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

const funcionarioSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  funcao: z.string().min(1, "Função é obrigatória"),
  telefone: z.string().min(1, "Telefone é obrigatório"),
  email: z.string().email("Email inválido"),
  comissao: z.coerce.number().min(0).max(100),
  ativo: z.boolean().default(true),
  role: z.string(),
  senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").optional().or(z.literal("")),
});

type FuncionarioFormValues = z.infer<typeof funcionarioSchema>;

const Funcionarios = () => {
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [funcionarioToDelete, setFuncionarioToDelete] = useState<any>(null);
  const [busca, setBusca] = useState("");

  const {
    data: funcionarios = [],
    isLoading: isLoadingFuncionarios,
    refetch,
  } = useFuncionarios();
  const { mutateAsync: createFuncionario } = useFuncionarioCreate();
  const { mutateAsync: updateFuncionario } = useFuncionarioUpdate();
  const { mutateAsync: deleteFuncionario } = useFuncionarioDelete();

  const form = useForm<FuncionarioFormValues>({
    resolver: zodResolver(funcionarioSchema),
    defaultValues: {
      nome: "",
      funcao: "",
      telefone: "",
      email: "",
      comissao: 30,
      ativo: true,
      role: "FUNCIONARIO",
      senha: "",
    },
  });

  const funcionariosFiltrados = (funcionarios || []).filter(
    (funcionario: any) =>
      funcionario.nome.toLowerCase().includes(busca.toLowerCase()) ||
      funcionario.funcao.toLowerCase().includes(busca.toLowerCase()) ||
      funcionario.telefone.includes(busca)
  );

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "nome",
      header: "Funcionário",
      cell: ({ row }) => {
        const record = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback>{record.nome.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{record.nome}</div>
              <div className="text-[10px] text-muted-foreground uppercase">{record.funcao}</div>
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
            <div className="flex items-center gap-2">
              <Phone size={10} className="text-muted-foreground" />
              {record.telefone}
            </div>
            <div className="flex items-center gap-2">
              <Mail size={10} className="text-muted-foreground" />
              {record.email}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "comissao",
      header: "Comissão",
      cell: ({ row }) => (
        <div className="flex items-center gap-1 font-semibold text-primary">
          <Percent size={12} />
          {row.original.comissao}%
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
      accessorKey: "role",
      header: "Permissão",
      cell: ({ row }) => (
        <Badge variant="outline" className="font-normal uppercase text-[10px]">
          {formatRoleName(row.original.role)}
        </Badge>
      ),
    },
    {
      id: "acoes",
      header: "Ações",
      cell: ({ row }) => {
        const record = row.original;
        const isDisabled =
          record.role === "ROOT" ||
          record.id === user?.id ||
          hierarchyPositionCheck(user?.role, record.role);

        return (
          <div className="flex justify-center">
            <DropdownComponent
              menu={{
                items: [
                  {
                    key: "editar",
                    icon: <Edit size={14} />,
                    label: "Editar",
                    onClick: () => {
                      setEditingEmployee(record);
                      form.reset({
                        ...record,
                        senha: "",
                      });
                      setModalOpen(true);
                    },
                  },
                  {
                    key: "excluir",
                    icon: <Trash2 size={14} />,
                    label: "Excluir",
                    onClick: () => setFuncionarioToDelete(record),
                    danger: true,
                    disabled: isDisabled,
                  },
                ],
              }}
            />
          </div>
        );
      },
    },
  ];

  const onSubmit = async (values: FuncionarioFormValues) => {
    try {
      if (editingEmployee) {
        const { senha, ...rest } = values;
        const body = senha ? values : rest;
        await updateFuncionario({ id: editingEmployee.id, body });
        toast.success("Funcionário atualizado com sucesso");
      } else {
        await createFuncionario(values);
        toast.success("Funcionário criado com sucesso");
      }
      setModalOpen(false);
      setEditingEmployee(null);
    } catch (error) {
      toast.error("Erro ao salvar funcionário");
    }
  };

  const handleDelete = async () => {
    if (!funcionarioToDelete) return;
    try {
      await deleteFuncionario(funcionarioToDelete.id);
      toast.success("Funcionário excluído com sucesso");
      setFuncionarioToDelete(null);
    } catch (error) {
      toast.error("Erro ao excluir funcionário");
    }
  };

  return (
    <PagesLayout
      title="Gestão de Funcionários"
      subtitle="Cadastre funcionários e gerencie comissões"
      filters={[
        {
          element: (
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, função ou telefone..."
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
          label: "Novo Funcionário",
          icon: <Plus className="mr-2 h-4 w-4" />,
          onClick: () => {
            setEditingEmployee(null);
            form.reset({
              nome: "",
              funcao: "",
              telefone: "",
              email: "",
              comissao: 30,
              ativo: true,
              role: "FUNCIONARIO",
              senha: "",
            });
            setModalOpen(true);
          },
        },
      ]}
      Error={{
        isError: false, // Updated if needed
        onClick: refetch,
      }}
    >
      <DataTable
        columns={columns}
        data={funcionariosFiltrados}
        loading={isLoadingFuncionarios}
      />

      {/* Modal Cadastro/Edição */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>{editingEmployee ? "Editar Funcionário" : "Novo Funcionário"}</DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-1 p-6 pt-2">
            <Form {...form}>
              <form id="employee-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo</FormLabel>
                        <FormControl>
                          <NameInput placeholder="Ex: Ana Silva" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="funcao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Função/Cargo</FormLabel>
                        <FormControl>
                          <NameInput placeholder="Ex: Cabeleireira" {...field} />
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
                          <Input placeholder="funcionario@salaox.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="comissao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Comissão Padrão (%)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Permissão</FormLabel>
                        <Select
                          disabled={!hasPermission(user?.role, "SECRETARIO") || (editingEmployee && hierarchyPositionCheck(user?.role, editingEmployee?.role))}
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ADMIN" disabled={!hasPermission(user?.role, "ROOT")}>Administrador</SelectItem>
                            <SelectItem value="GERENTE" disabled={!hasPermission(user?.role, "ADMIN")}>Gerente</SelectItem>
                            <SelectItem value="SECRETARIO">Secretário</SelectItem>
                            <SelectItem value="FUNCIONARIO">Funcionário</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {!editingEmployee && (
                    <FormField
                      control={form.control}
                      name="senha"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input type="password" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {editingEmployee && (
                    <FormField
                      control={form.control}
                      name="senha"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nova Senha (opcional)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input type="password" placeholder="Deixe em branco para manter" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <div className="flex items-center gap-4 pt-8">
                    <FormField
                      control={form.control}
                      name="ativo"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                          <FormControl>
                            <Switch
                              disabled={!hasPermission(user?.role, "SECRETARIO") || (editingEmployee && hierarchyPositionCheck(user?.role, editingEmployee?.role))}
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">Funcionário Ativo</FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </form>
            </Form>
          </ScrollArea>

          <DialogFooter className="p-6 border-t">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" form="employee-form">
              {editingEmployee ? "Atualizar" : "Cadastrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AlertDialog Exclusão */}
      <AlertDialog open={!!funcionarioToDelete} onOpenChange={(val) => !val && setFuncionarioToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="text-destructive size-5" />
              Confirmar Exclusão
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o funcionário <strong>{funcionarioToDelete?.nome}</strong>?
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

export default Funcionarios;
