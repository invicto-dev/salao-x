import { useState } from "react";
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  Tag,
  Modal,
  Form,
  Switch,
  Space,
  Typography,
  message,
  Row,
  Col,
  Upload,
  TableColumnProps,
} from "antd";
import { Plus, Search, Edit, Upload as UploadIcon, List } from "lucide-react";

import { NameInput } from "@/components/inputs/NameInput";
import {
  useCategories,
  useCategoryCreate,
  useCategoryUpdate,
} from "@/hooks/use-categories";

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const Categorias = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [filtroStatus, setFiltroStatus] = useState(undefined);
  const [busca, setBusca] = useState("");
  const [form] = Form.useForm();
  const { data: categories } = useCategories();
  const { mutate: createCategory } = useCategoryCreate();
  const { mutate: updateCategory } = useCategoryUpdate();

  const categoriesFiltered = (categories || []).filter((category) => {
    const matchBusca = category.nome
      .toLowerCase()
      .includes(busca.toLowerCase());

    const matchStatus =
      (filtroStatus || "") === "" ||
      (filtroStatus === "ativo" && category.ativo) ||
      (filtroStatus === "inativo" && !category.ativo);
    return matchBusca && matchStatus;
  });

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
          {record.description || "Sem descrição"}
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
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="text"
            icon={<Edit size={14} />}
            onClick={() => editarCategoria(record)}
          >
            Editar
          </Button>
        </Space>
      ),
    },
  ];

  const editarCategoria = (category: Product.Props) => {
    setEditingCategory(category);
    form.setFieldsValue(category);
    setModalVisible(true);
  };

  const handleSubmit = (values: Product.Props) => {
    try {
      if (!editingCategory) {
        createCategory(values);
        setModalVisible(false);
        form.resetFields();
      } else {
        updateCategory({
          id: editingCategory.id,
          body: values,
        });
        setModalVisible(false);
        form.resetFields();
        setEditingCategory(null);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const novaCategoria = () => {
    setEditingCategory(null);
    form.resetFields();
    setModalVisible(true);
  };

  const uploadProps = {
    name: "file",
    showUploadList: false,
    beforeUpload: (file: any) => {
      const isJpgOrPng =
        file.type === "image/jpeg" || file.type === "image/png";
      if (!isJpgOrPng) {
        message.error("Você só pode fazer upload de arquivos JPG/PNG!");
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error("A imagem deve ter menos de 2MB!");
      }
      return false; // Simular upload (não enviar arquivo)
    },
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
              placeholder="Buscar pelo nome..."
              prefix={<Search size={16} />}
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="max-w-xs"
            />
            <Select
              placeholder="Status"
              allowClear
              value={filtroStatus}
              onChange={setFiltroStatus}
              className="min-w-[120px]"
            >
              <Option value="ativo">Ativo</Option>
              <Option value="inativo">Inativo</Option>
            </Select>
          </div>
          <Button
            type="primary"
            icon={<Plus size={16} />}
            onClick={novaCategoria}
          >
            Nova Categoria
          </Button>
        </div>
      </Card>

      <Card title="Lista de Categorias">
        <Table
          dataSource={categoriesFiltered}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingCategory ? "Editar Categoria" : "Nova Categoria"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingCategory(null);
        }}
        onOk={() => form.submit()}
        okText={editingCategory ? "Salvar" : "Cadastrar"}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ ativo: true }}
        >
          <Row gutter={16}>
            <Col xs={24} lg={16}>
              <Form.Item
                label="Nome"
                name="nome"
                rules={[{ required: true, message: "Nome é obrigatório" }]}
              >
                <NameInput placeholder="Ex: Serviços Capilares" />
              </Form.Item>

              <Form.Item label="Descrição" name="descricao">
                <TextArea rows={3} placeholder="Descreva a categoria..." />
              </Form.Item>
            </Col>

            <Col xs={24} lg={8}>
              <Form.Item label="Imagem da Categoria">
                <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                  <Upload disabled {...uploadProps}>
                    <div className="space-y-2">
                      <UploadIcon
                        size={32}
                        className="mx-auto text-muted-foreground"
                      />
                      <div className="text-sm text-muted-foreground">
                        Clique para fazer upload
                      </div>
                      <div className="text-xs text-muted-foreground">
                        PNG, JPG até 2MB
                      </div>
                    </div>
                  </Upload>
                </div>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col xs={24} sm={8}>
              <Form.Item label="Status" name="ativo" valuePropName="checked">
                <Switch checkedChildren="Ativo" unCheckedChildren="Inativo" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default Categorias;
