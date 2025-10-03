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
  Tooltip,
  Progress,
} from "antd";
import {
  Plus,
  Search,
  Edit,
  Upload as UploadIcon,
  Trash2,
  FileText,
} from "lucide-react";
import {
  useImportProducts,
  useProductCreate,
  useProductDelete,
  useProducts,
  useProductUpdate,
} from "@/hooks/use-products";
import { NameInput } from "@/components/inputs/NameInput";
import { useCategories } from "@/hooks/use-categories";
import { CurrencyInput } from "@/components/inputs/CurrencyInput";
import { unidadeMedidas } from "@/constants/products";
import { useImportJobStatus } from "@/hooks/use-import-jobs";
import { productColumns } from "@/constants/tables/products";

interface JobStatus {
  id: string;
  status:
    | "PENDENTE"
    | "PROCESSANDO"
    | "CONCLUIDO"
    | "CONCLUIDO_COM_ERROS"
    | "FALHOU";
  totalRows: number;
  processedRows: number;
  successfulRows: number;
  failedRows: number;
  results?: { row: number; errors: string[] }[];
}

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const Produtos = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [filtroCategoria, setFiltroCategoria] = useState(undefined);
  const [filtroStatus, setFiltroStatus] = useState(undefined);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [busca, setBusca] = useState("");
  const [form] = Form.useForm();
  const {
    data: products,
    isFetching: isFetchingProducts,
    refetch,
  } = useProducts({
    search: busca,
    categoryId: filtroCategoria,
  });
  const { data: categories } = useCategories();
  const { mutateAsync: createProduct } = useProductCreate();
  const { mutateAsync: updateProduct } = useProductUpdate();
  const { mutateAsync: deleteProduto } = useProductDelete();
  const { data: job } = useImportJobStatus(jobId);
  const { mutateAsync: importProducts, isPending } = useImportProducts();

  const productsFiltered = (products || []).filter((produto) => {
    const matchStatus =
      (filtroStatus || "") === "" ||
      (filtroStatus === "ativo" && produto.ativo) ||
      (filtroStatus === "inativo" && !produto.ativo);
    return matchStatus;
  });

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

  const handleUpload = async () => {
    try {
      const data = await importProducts(selectedFile!);
      setJobId(data.data.jobId);
    } catch (error) {
      console.error(error);
    }
  };

  const clearImportModal = () => {
    setImportModalVisible(false);
    setSelectedFile(null);
    refetch();
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
            icon={<UploadIcon size={14} />}
            onClick={() => setImportModalVisible(true)}
          >
            Importar CSV
          </Button>
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
          columns={productColumns(editarProduto, excluirProduto)}
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
      <Modal
        title="Importar Produtos via CSV"
        open={importModalVisible}
        onCancel={clearImportModal}
        footer={[
          <Button key="back" onClick={clearImportModal}>
            {job ? "Fechar" : "Cancelar"}
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={isPending}
            onClick={handleUpload}
            disabled={!selectedFile || !!job}
          >
            Iniciar Importação
          </Button>,
        ]}
        width={600}
      >
        {!job ? (
          <>
            <Typography.Text>
              Selecione um arquivo no formato CSV para adicionar produtos em
              massa. Certifique-se de que o arquivo segue o modelo padrão.
            </Typography.Text>
            <div className="my-4">
              <a href="/produtos_modelo.csv" download>
                <Button icon={<FileText size={14} />}>Baixar Modelo CSV</Button>
              </a>
            </div>
            <Upload.Dragger
              name="file"
              accept=".csv"
              multiple={false}
              beforeUpload={(file) => {
                setSelectedFile(file);
                return false; // Previne o upload automático do Antd
              }}
              onRemove={() => {
                setSelectedFile(null);
              }}
              fileList={selectedFile ? [selectedFile as any] : []}
            >
              <p className="ant-upload-drag-icon">
                <UploadIcon size={48} className="mx-auto text-gray-400" />
              </p>
              <p className="ant-upload-text">
                Clique ou arraste o arquivo CSV para esta área
              </p>
              <p className="ant-upload-hint">
                Suporte para um único arquivo. Use o modelo para evitar erros.
              </p>
            </Upload.Dragger>
            {uploadError && (
              <Typography.Text type="danger" className="mt-2 block">
                {uploadError}
              </Typography.Text>
            )}
          </>
        ) : (
          <div>
            <Title level={5}>Progresso da Importação</Title>
            <p>
              Status: <Tag>{job.status}</Tag>
            </p>
            <Progress
              percent={
                job.totalRows > 0
                  ? Math.round((job.processedRows / job.totalRows) * 100)
                  : 0
              }
            />
            <Typography.Text type="secondary">
              {job.processedRows} de {job.totalRows} linhas processadas.
            </Typography.Text>

            {(job.status === "CONCLUIDO" ||
              job.status === "CONCLUIDO_COM_ERROS") && (
              <div className="mt-4">
                <p>
                  ✅ <strong>{job.successfulRows}</strong> produtos importados
                  com sucesso.
                </p>
                {job.failedRows > 0 && (
                  <p>
                    ❌ <strong>{job.failedRows}</strong> produtos falharam.
                  </p>
                )}

                {job.results && job.results.length > 0 && (
                  <div className="mt-4">
                    <Typography.Text strong>
                      Detalhes dos Erros:
                    </Typography.Text>
                    <div className="mt-2 p-2 border rounded bg-gray-50 max-h-40 overflow-y-auto">
                      {job.results.map((res, index) => (
                        <p key={index} className="text-xs">
                          <strong>Linha {res.row}:</strong>{" "}
                          {res.errors.join(", ")}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Produtos;
