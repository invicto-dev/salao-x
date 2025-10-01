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
  InputNumber,
  Switch,
  Typography,
  message,
  Row,
  Col,
  Upload,
  Checkbox,
  TableColumnProps,
  Tooltip,
} from "antd";
import {
  Package,
  Plus,
  Search,
  Edit,
  Upload as UploadIcon,
  Trash2,
} from "lucide-react";
import {
  useProductCreate,
  useProductDelete,
  useProducts,
  useProductUpdate,
} from "@/hooks/use-products";
import { NameInput } from "@/components/inputs/NameInput";
import { useCategories } from "@/hooks/use-categories";
import { CurrencyInput } from "@/components/inputs/CurrencyInput";
import { formatCurrency } from "@/utils/formatCurrency";
import DropdownComponent from "@/components/Dropdown";

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const Produtos = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [filtroCategoria, setFiltroCategoria] = useState(undefined);
  const [filtroStatus, setFiltroStatus] = useState(undefined);
  const [busca, setBusca] = useState("");
  const [form] = Form.useForm();
  const { data: products, isFetching: isFetchingProducts } = useProducts({
    search: busca,
    categoryId: filtroCategoria,
  });
  const { data: categories } = useCategories();
  const { mutateAsync: createProduct } = useProductCreate();
  const { mutateAsync: updateProduct } = useProductUpdate();
  const { mutateAsync: deleteProduto } = useProductDelete();

  const unidadeMedidas = ["un", "m", "kg", "g", "mg", "cm", "mm"];

  const productsFiltered = (products || []).filter((produto) => {
    const matchStatus =
      (filtroStatus || "") === "" ||
      (filtroStatus === "ativo" && produto.ativo) ||
      (filtroStatus === "inativo" && !produto.ativo);
    return matchStatus;
  });

  const columns: TableColumnProps<Product.Props>[] = [
    {
      title: "Produto",
      key: "produto",
      render: (_: any, record) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
            <Package size={20} className="text-muted-foreground" />
          </div>
          <div>
            <div className="font-medium">{record.nome}</div>
            <div className="text-sm text-muted-foreground">
              {record.codigo || "Sem código"} •{" "}
              {record.categoria || "Sem categoria"}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Preços",
      key: "precos",
      render: (_, record) => (
        <div>
          <div className="font-semibold text-salao-primary">
            {formatCurrency(record.preco)}
          </div>
          {record.valorEmAberto && (
            <div className="text-sm text-muted-foreground">Valor em aberto</div>
          )}
          {record.custo && record.custo > 0 && (
            <div className="text-sm text-muted-foreground">
              Custo: {formatCurrency(record.custo)}
            </div>
          )}

          {!record.valorEmAberto &&
            record.custo &&
            record.custo > 0 &&
            record.preco && (
              <div className="text-xs text-salao-success">{`Margem: ${(
                ((record.preco - record.custo) / record.custo) *
                100
              ).toFixed(2)} %`}</div>
            )}
        </div>
      ),
    },
    {
      title: "Estoque",
      dataIndex: "estoqueAtual",
      key: "estoque",
      render: (estoqueAtual: number, record) =>
        record.contarEstoque ? (
          <Tag
            color={
              estoqueAtual > 10 ? "green" : estoqueAtual > 0 ? "orange" : "red"
            }
          >
            {estoqueAtual} un
          </Tag>
        ) : (
          <div className="text-sm text-muted-foreground">Não habilitado</div>
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
      render: (_, record) => (
        <DropdownComponent
          menu={{
            items: [
              {
                key: "editar",
                icon: <Edit size={14} />,
                label: "Editar",
                onClick: () => editarProduto(record),
              },
              {
                key: "excluir",
                icon: <Trash2 size={14} />,
                label: "Excluir",
                onClick: () => excluirProduto(record),
              },
            ],
          }}
        />
      ),
    },
  ];

  const editarProduto = (produto: Product.Props) => {
    setEditingProduct(produto);
    form.setFieldsValue(produto);
    setModalVisible(true);
  };

  const novoProduto = () => {
    setEditingProduct(null);
    form.resetFields();
    setModalVisible(true);
  };

  const clearForm = () => {
    setModalVisible(false);
    setEditingProduct(null);
    form.resetFields();
  };

  const handleCreate = async (values: Product.Props) => {
    await createProduct(values);
    clearForm();
  };

  const handleUpdate = async (values: Product.Props) => {
    await updateProduct({
      id: editingProduct.id,
      body: values,
    });
    clearForm();
  };

  const handleSubmit = (values: Product.Props) => {
    try {
      editingProduct ? handleUpdate(values) : handleCreate(values);
    } catch (error) {
      console.error(error);
    }
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

  const excluirProduto = (product: Product.Props) => {
    Modal.confirm({
      title: "Confirmar Exclusão",
      content: `Você tem certeza que deseja excluir o produto ${product.nome}? As movimentações de estoque relacionadas a ele serão removidas também.`,
      okText: "Sim, Excluir",
      okButtonProps: { danger: true },
      cancelText: "Não",
      onOk: () => deleteProduto(product.id),
    });
  };

  const SelectCategory = ({
    value,
    placeholder,
    onChange,
  }: {
    value?: string;
    placeholder: string;
    onChange?: (value: string) => void;
  }) => (
    <Select
      placeholder={placeholder}
      allowClear
      value={value}
      onChange={onChange}
      className="min-w-[250px]"
      showSearch
      optionFilterProp="label"
      filterSort={(optionA, optionB) =>
        (optionA?.label ?? "")
          .toLowerCase()
          .localeCompare((optionB?.label ?? "").toLowerCase())
      }
      options={categories?.map((cat) => ({
        value: cat.id,
        label: cat.nome,
      }))}
    />
  );

  return (
    <div className="space-y-6">
      <div>
        <Title level={2} className="!mb-0">
          Gestão de Produtos
        </Title>
        <p className="text-muted-foreground">
          Cadastre e gerencie produtos para venda
        </p>
      </div>

      {/* Filtros e Ações */}
      <Card>
        <div className="flex flex-col lg:flex-row gap-4 justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <Input
              placeholder="Buscar por nome ou código..."
              prefix={<Search size={14} />}
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="max-w-xs"
            />
            <SelectCategory
              onChange={setFiltroCategoria}
              value={filtroCategoria}
              placeholder="Categoria"
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
            icon={<Plus size={14} />}
            onClick={novoProduto}
          >
            Novo Produto
          </Button>
        </div>
      </Card>

      {/* Tabela de Produtos */}
      <Card title="Lista de Produtos">
        <Table
          dataSource={productsFiltered}
          columns={columns}
          rowKey="id"
          loading={{ spinning: isFetchingProducts }}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Modal de Cadastro/Edição */}
      <Modal
        title={editingProduct ? "Editar Produto" : "Novo Produto"}
        open={modalVisible}
        onCancel={clearForm}
        onOk={() => form.submit()}
        okText={editingProduct ? "Salvar" : "Cadastrar"}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            ativo: true,
            preco: 1,
            contarEstoque: true,
            unidadeMedida: "un",
          }}
        >
          <Row gutter={16}>
            <Col xs={24} lg={16}>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Nome do Produto"
                    name="nome"
                    rules={[{ required: true, message: "Nome é obrigatório" }]}
                  >
                    <NameInput placeholder="Ex: Shampoo Hidratante" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="Código/SKU" name="codigo">
                    <Input placeholder="Ex: SHAM001" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item label="Categoria" name="categoriaId">
                    <SelectCategory placeholder="Selecionar categoria" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="Unidade de Medida" name="unidadeMedida">
                    <Select
                      defaultValue="un"
                      placeholder="Selecionar unidade de medida"
                    >
                      {unidadeMedidas.map((cat) => (
                        <Option key={cat} value={cat}>
                          {cat}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="Descrição" name="descricao">
                <TextArea rows={3} placeholder="Descreva o produto..." />
              </Form.Item>
            </Col>

            <Col xs={24} lg={8}>
              <Form.Item label="Imagem do Produto">
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
              <Form.Item
                label="Preço de Venda"
                shouldUpdate={(prevValues, currentValues) =>
                  prevValues.valorEmAberto !== currentValues.valorEmAberto
                }
              >
                {({ getFieldValue }) => {
                  const valorAberto = getFieldValue("valorEmAberto");
                  return (
                    <Form.Item
                      name="preco"
                      rules={[
                        {
                          required: !valorAberto,
                          message: "Preço é obrigatório",
                        },
                      ]}
                      className="m-0"
                    >
                      <CurrencyInput
                        min={0}
                        placeholder="0,00"
                        addonAfter={
                          <Tooltip title="Valor em aberto?">
                            <Form.Item
                              className="m-0"
                              name="valorEmAberto"
                              valuePropName="checked"
                            >
                              <Checkbox />
                            </Form.Item>
                          </Tooltip>
                        }
                      />
                    </Form.Item>
                  );
                }}
              </Form.Item>
              <Form.Item label="Estoque Mínimo" name="estoqueMinimo">
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  placeholder="0"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item label="Preço de Custo" name="custo">
                <CurrencyInput min={0} placeholder="0,00" />
              </Form.Item>
              {!editingProduct && (
                <Form.Item
                  label="Estoque Inicial"
                  name="estoqueInicial"
                  dependencies={["contarEstoque"]}
                  rules={[
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (
                          getFieldValue("contarEstoque") &&
                          !value &&
                          !editingProduct
                        ) {
                          return Promise.reject(
                            new Error("Estoque inicial é obrigatório")
                          );
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  <InputNumber
                    min={0}
                    style={{ width: "100%" }}
                    placeholder="0"
                  />
                </Form.Item>
              )}
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item label="Status" name="ativo" valuePropName="checked">
                <Switch checkedChildren="Ativo" unCheckedChildren="Inativo" />
              </Form.Item>
              <Form.Item
                label="Contar Estoque?"
                name="contarEstoque"
                valuePropName="checked"
              >
                <Switch checkedChildren="Sim" unCheckedChildren="Não" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default Produtos;
