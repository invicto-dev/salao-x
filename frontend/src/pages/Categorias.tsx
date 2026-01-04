import { useState } from "react";
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  Tag,
  Modal,
  Typography,
  TableColumnProps,
} from "antd";
import { Plus, Search, Edit, List, Trash2 } from "lucide-react";
import {
  useCategories,
  useCategoryDelete,
  useCategoryModal,
} from "@/hooks/use-categories";
import DropdownComponent from "@/components/Dropdown";
import { useDebounce } from "@/hooks/use-debounce";

const { Title } = Typography;
const { Option } = Select;

const Categorias = () => {
  const [editingCategory, setEditingCategory] = useState<Category.Props>(undefined);
  const [params, setParams] = useState<Params>({});
  const buscaDebounced = useDebounce(params.search, 500);
  const { data: categories = [], isLoading } = useCategories({
    ...params,
    search: buscaDebounced,
  });
  const { mutateAsync: deleteCategory } = useCategoryDelete();
  const { CategoryModal, toggleModal } = useCategoryModal(editingCategory);

  const columns: TableColumnProps<Category.Props>[] = [
    {
      title: "Nome",
      dataIndex: "nome",
      key: "nome",
      render: (_: any, record) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
            <List size={20} className="text-muted-foreground" />
          </div>
          <div>
            <div className="font-medium">{record.nome}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Descrição",
      dataIndex: "descricao",
      key: "descricao",
      render: (_: any, record) => (
        <div className="text-muted-foreground">
          {record.descricao || "Sem descrição"}
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "ativo",
      key: "ativo",
      align: "center",
      render: (ativo: boolean) => (
        <Tag color={ativo ? "green" : "red"}>{ativo ? "Ativo" : "Inativo"}</Tag>
      ),
    },
    {
      title: "Ações",
      key: "acoes",
      align: "center",
      render: (_: any, record: Category.Props) => (
        <DropdownComponent
          menu={{
            items: [
              {
                key: "editar",
                icon: <Edit size={14} />,
                label: "Editar",
                onClick: () => editarCategoria(record),
              },
              {
                key: "excluir",
                icon: <Trash2 size={14} />,
                label: "Excluir",
                onClick: () => excluirCategory(record),
              },
            ],
          }}
        />
      ),
    },
  ];

  const excluirCategory = (category: Category.Props) => {
    Modal.confirm({
      title: "Confirmar Exclusão",
      content: `Você tem certeza que deseja excluir a categoria ${category.nome}?`,
      okText: "Sim, Excluir",
      okButtonProps: { danger: true },
      cancelText: "Não",
      onOk: () => deleteCategory(category.id),
    });
  };

  const editarCategoria = (category: Category.Props) => {
    setEditingCategory(category);
    toggleModal();
  };

  const novaCategoria = () => {
    setEditingCategory(null);
    toggleModal();
  };

  return (
    <div className="space-y-6">
      <div>
        <Title level={2} className="!mb-2">
          Gestão de Categorias
        </Title>
        <p className="text-muted-foreground">
          Cadastre e gerencie suas categorias de produtos ou serviços
        </p>
      </div>

      <Card>
        <div className="flex flex-col lg:flex-row gap-4 justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <Input
              placeholder="Buscar pelo nome ou descrição..."
              prefix={<Search size={14} />}
              value={params.search}
              onChange={(e) => setParams({ ...params, search: e.target.value })}
              allowClear
            />
            <Select
              placeholder="Status"
              allowClear
              value={params.status}
              onChange={(e) => setParams({ ...params, status: e })}
              className="min-w-[120px]"
            >
              <Option value="true">Ativo</Option>
              <Option value="false">Inativo</Option>
            </Select>
          </div>
          <Button
            type="primary"
            icon={<Plus size={14} />}
            onClick={novaCategoria}
          >
            Nova Categoria
          </Button>
        </div>
      </Card>

      <Card title="Lista de Categorias">
        <Table
          dataSource={categories}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          loading={isLoading}
          locale={{ emptyText: "Nenhuma categoria encontrada" }}
        />
      </Card>
      {CategoryModal}
    </div>
  );
};

export default Categorias;
