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
  Space,
  Typography,
  message,
  Row,
  Col,
  Upload,
  Image,
  Checkbox,
  TableColumnProps,
} from "antd";
import {
  Package,
  Plus,
  Search,
  Edit,
  Upload as UploadIcon,
} from "lucide-react";
import {
  useProductCreate,
  useProducts,
  useProductUpdate,
} from "@/hooks/use-products";
import { NameInput } from "@/components/inputs/NameInput";

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const Produtos = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [filtroCategoria, setFiltroCategoria] = useState(undefined);
  const [countStock, setCountStock] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState(undefined);
  const [busca, setBusca] = useState("");
  const [form] = Form.useForm();
  const { data: products } = useProducts();
  const { mutate: createProduct } = useProductCreate();
  const { mutate: updateProduct } = useProductUpdate();

  const categorias = ["Cabelo", "Unhas", "Pele", "Maquiagem", "Acessórios"];

  const productsFiltered = (products || []).filter((produto) => {
    const matchBusca =
      produto.nome.toLowerCase().includes(busca.toLowerCase()) ||
      (produto.codigo || "").toLowerCase().includes(busca.toLowerCase());
    const matchCategoria =
      !(filtroCategoria || "") || produto.categoria === (filtroCategoria || "");
    const matchStatus =
      (filtroStatus || "") === "" ||
      (filtroStatus === "ativo" && produto.ativo) ||
      (filtroStatus === "inativo" && !produto.ativo);
    return matchBusca && matchCategoria && matchStatus;
  });

  const columns: TableColumnProps<Product.Props>[] = [
    {
      title: "Produto",
      key: "produto",
      render: (_: any, record: any) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
            {record.imagem ? (
              <Image
                src={record.imagem}
                width={48}
                height={48}
                className="rounded-lg object-cover"
                preview={false}
              />
            ) : (
              <Package size={20} className="text-muted-foreground" />
            )}
          </div>
          <div>
            <div className="font-medium">{record.nome}</div>
            <div className="text-sm text-muted-foreground">
              {record.codigo} • {record.categoria}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Preços",
      key: "precos",
      render: (_: any, record: any) => (
        <div>
          <div className="font-semibold text-salao-primary">
            R$ {record.preco.toFixed(2)}
          </div>
          <div className="text-sm text-muted-foreground">
            Custo: R$ {record.custo.toFixed(2)}
          </div>
          <div className="text-xs text-salao-success">
            Margem:{" "}
            {(((record.preco - record.custo) / record.preco) * 100).toFixed(1)}%
          </div>
        </div>
      ),
    },
    {
      title: "Estoque",
      dataIndex: "estoque",
      key: "estoque",
      render: (estoque: number, record) =>
        record.contarEstoque ? (
          <Tag color={estoque > 10 ? "green" : estoque > 0 ? "orange" : "red"}>
            {estoque} un
          </Tag>
        ) : (
          <>Não habilitado</>
        ),
    },
    {
      title: "Status",
      dataIndex: "ativo",
      key: "ativo",
      render: (ativo: boolean) => (
        <Tag color={ativo ? "green" : "red"}>{ativo ? "Ativo" : "Inativo"}</Tag>
      ),
    },
    {
      title: "Ações",
      key: "acoes",
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="text"
            icon={<Edit size={14} />}
            onClick={() => editarProduto(record)}
          >
            Editar
          </Button>
        </Space>
      ),
    },
  ];

  const editarProduto = (produto: Product.Props) => {
    setEditingProduct(produto);
    setCountStock(produto.contarEstoque);
    form.setFieldsValue(produto);
    setModalVisible(true);
  };

  const novoProduto = () => {
    setEditingProduct(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleSubmit = (values: Product.Props) => {
    try {
      if (!editingProduct) {
        createProduct(values);
        setModalVisible(false);
        form.resetFields();
        setCountStock(false);
      } else {
        updateProduct({
          id: editingProduct.id,
          body: values,
        });
        setModalVisible(false);
        form.resetFields();
        setEditingProduct(null);
        setCountStock(false);
      }
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

  return (
    <div className="space-y-6">
      <div>
        <Title level={2} className="!mb-2">
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
              prefix={<Search size={16} />}
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="max-w-xs"
            />
            <Select
              placeholder="Categoria"
              allowClear
              value={filtroCategoria}
              onChange={setFiltroCategoria}
              className="min-w-[150px]"
            >
              {categorias.map((cat) => (
                <Option key={cat} value={cat}>
                  {cat}
                </Option>
              ))}
            </Select>
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
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Modal de Cadastro/Edição */}
      <Modal
        title={editingProduct ? "Editar Produto" : "Novo Produto"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingProduct(null);
          setCountStock(true);
        }}
        onOk={() => form.submit()}
        okText={editingProduct ? "Salvar" : "Cadastrar"}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ ativo: true, estoque: 0, contarEstoque: countStock }}
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

              <Form.Item label="Categoria" name="categoria">
                <Select placeholder="Selecionar categoria">
                  {categorias.map((cat) => (
                    <Option key={cat} value={cat}>
                      {cat}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

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
                name="preco"
                rules={[{ required: true, message: "Preço é obrigatório" }]}
              >
                <InputNumber
                  min={0}
                  precision={2}
                  style={{ width: "100%" }}
                  addonBefore="R$"
                  placeholder="0,00"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Preço de Custo"
                name="custo"
                rules={[{ required: true, message: "Custo é obrigatório" }]}
              >
                <InputNumber
                  min={0}
                  precision={2}
                  style={{ width: "100%" }}
                  addonBefore="R$"
                  placeholder="0,00"
                />
              </Form.Item>

              <Form.Item label="Status" name="ativo" valuePropName="checked">
                <Switch checkedChildren="Ativo" unCheckedChildren="Inativo" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Estoque Inicial"
                name="estoque"
                rules={[{ required: countStock }]}
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  placeholder="0"
                  disabled={!countStock}
                />
              </Form.Item>
              <Form.Item name="contarEstoque" valuePropName="checked">
                <Checkbox
                  checked={countStock}
                  onChange={(e) => setCountStock(e.target.checked)}
                  children="Contar estoque?"
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default Produtos;
