import React, { useState } from "react";
import { Plus, Search, Edit, List, Trash2, AlertTriangle } from "lucide-react";
import {
  useCategories,
  useCategoryDelete,
  useCategoryModal,
} from "@/hooks/use-categories";
import DropdownComponent from "@/components/Dropdown";
import { useDebounce } from "@/hooks/use-debounce";
import PagesLayout from "@/components/layout/PagesLayout";
import { DataTable } from "@/components/tables/DataTable";
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

const Categorias = () => {
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [params, setParams] = useState<any>({
    search: "",
    status: undefined
  });
  const [categoryToDelete, setCategoryToDelete] = useState<any>(null);

  const buscaDebounced = useDebounce(params.search, 500);
  const { data: categories = [], isLoading, refetch } = useCategories({
    ...params,
    search: buscaDebounced,
  });

  const { mutateAsync: deleteCategory } = useCategoryDelete();
  const { CategoryModal, toggleModal } = useCategoryModal(editingCategory);

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
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground truncate max-w-[300px]">
          {row.original.descricao || "Sem descrição"}
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
                    setEditingCategory(row.original);
                    toggleModal();
                  },
                },
                {
                  key: "excluir",
                  icon: <Trash2 size={14} />,
                  label: "Excluir",
                  onClick: () => setCategoryToDelete(row.original),
                  danger: true,
                },
              ],
            }}
          />
        </div>
      ),
    },
  ];

  const handleDelete = async () => {
    if (!categoryToDelete) return;
    try {
      await deleteCategory(categoryToDelete.id);
      setCategoryToDelete(null);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <PagesLayout
      title="Gestão de Categorias"
      subtitle="Cadastre e gerencie suas categorias de produtos ou serviços"
      filters={[
        {
          element: (
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar pelo nome ou descrição..."
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
                <SelectItem value="true">Ativo</SelectItem>
                <SelectItem value="false">Inativo</SelectItem>
              </SelectContent>
            </Select>
          ),
        },
      ]}
      buttonsAfterFilters={[
        {
          label: "Nova Categoria",
          icon: <Plus className="mr-2 h-4 w-4" />,
          onClick: () => {
            setEditingCategory(null);
            toggleModal();
          },
        },
      ]}
    >
      <DataTable
        columns={columns}
        data={categories}
        loading={isLoading}
      />

      {CategoryModal}

      {/* AlertDialog Exclusão */}
      <AlertDialog open={!!categoryToDelete} onOpenChange={(val) => !val && setCategoryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="text-destructive size-5" />
              Confirmar Exclusão
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a categoria <strong>{categoryToDelete?.nome}</strong>?
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

export default Categorias;
