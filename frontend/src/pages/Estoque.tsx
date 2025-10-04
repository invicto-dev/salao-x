import { useState } from "react";
import {
  Card,
  Button,
  Select,
  Tag,
  Modal,
  Form,
  InputNumber,
  Space,
  Typography,
  Statistic,
  Row,
  Col,
  TableColumnsType,
  Table,
} from "antd";
import { Package, Plus, AlertTriangle, Edit } from "lucide-react";
import {
  useStockKpis,
  useRecentStockMovements,
  useStockMovementCreate,
} from "@/hooks/use-stock";
import { formatCurrency } from "@/utils/formatCurrency";
import { useProducts, useProductUpdate } from "@/hooks/use-products";
import { NameInput } from "@/components/inputs/NameInput";
import { CurrencyInput } from "@/components/inputs/CurrencyInput";
import { useDebounce } from "@/hooks/use-debounce";
import BarCodeInput from "@/components/inputs/BarCodeInput";
import CategorySelect from "@/components/selects/CategorySelect";

const { Title } = Typography;
const { Option } = Select;

const Estoque = () => {
  const [modalEditar, setModalEditar] = useState(false);
  const [modalMovimentacao, setModalMovimentacao] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] =
    useState<Stock.StockProduct | null>(null);

  const [params, setParams] = useState<Params>({});
  const { data: products = [], isLoading: isLoadingProducts } = useProducts({
    ...params,
    contarEstoque: true,
    search: useDebounce(params.search) || params.search,
  });

  const [formEditar] = Form.useForm();
  const [formMovimentacao] = Form.useForm();
  const { mutateAsync: updateProduct } = useProductUpdate();
  const { data: kpis, isLoading: isLoadingKpis } = useStockKpis();
  const { data: recentMovements = [], isLoading: isLoadingMovements } =
    useRecentStockMovements();

  const { mutate: createMovement, isPending: isCreatingMovement } =
    useStockMovementCreate();

  const abrirModalEditar = (produto: Stock.StockProduct) => {
    setProdutoSelecionado(produto);
    formEditar.setFieldsValue({
      ...produto,
      preco: produto.preco ?? 0,
      custo: produto.custo ?? 0,
    });
    setModalEditar(true);
  };

  const fecharModalEditar = () => {
    setModalEditar(false);
    setProdutoSelecionado(null);
    formEditar.resetFields();
  };

  const abrirModalMovimentacao = () => {
    setModalMovimentacao(true);
  };

  const fecharModalMovimentacao = () => {
    setModalMovimentacao(false);
    formMovimentacao.resetFields();
  };

  const handleUpdateProduct = (values: Product.Props) => {
    if (!produtoSelecionado) return;
    try {
      updateProduct({ id: produtoSelecionado.id, body: values });
      fecharModalEditar();
    } catch (error) {}
  };

  const handleCreateMovement = (values: Stock.CreateMovementBody) => {
    createMovement(values, { onSuccess: fecharModalMovimentacao });
  };

  const getStatusEstoque = (estoque: number, minimo: number) => {
    if (estoque === 0) return { color: "red", text: "Sem estoque" };
    if (estoque <= minimo) return { color: "orange", text: "Estoque baixo" };
    return { color: "green", text: "Normal" };
  };

  const columns: TableColumnsType<Product.Props> = [
    {
      title: "Produto",
      dataIndex: "nome",
      key: "nome",
      render: (text: string, record: Stock.StockProduct) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-sm text-muted-foreground">
            {record.categoria || "Sem categoria"}
          </div>
        </div>
      ),
    },
    {
      title: "Estoque Atual",
      dataIndex: "estoqueAtual",
      key: "estoqueAtual",
      align: "center",
      render: (estoque: number, record: Stock.StockProduct) => {
        const status = getStatusEstoque(estoque, record.estoqueMinimo);
        return (
          <div>
            <div className="font-semibold">
              {estoque} {record.unidadeMedida}
            </div>
            <Tag color={status.color}>{status.text}</Tag>
          </div>
        );
      },
    },
    {
      title: "Estoque Mínimo",
      dataIndex: "estoqueMinimo",
      key: "estoqueMinimo",
      align: "center",
      render: (estoqueMinimo: number, record: Stock.StockProduct) => (
        <div>
          <div className="font-medium text-salao-primary">
            {estoqueMinimo} {record.unidadeMedida}
          </div>
        </div>
      ),
    },
    {
      title: "Preço/Custo",
      key: "preco",
      render: (_, record: Stock.StockProduct) => (
        <div>
          <div className="font-medium text-salao-primary">
            {formatCurrency(record.preco ?? 0)}
          </div>
          <div className="text-sm text-muted-foreground">
            Custo: {formatCurrency(record.custo ?? 0)}
          </div>
        </div>
      ),
    },
    {
      title: "Ações",
      key: "acoes",
      align: "center",
      render: (_, record: Stock.StockProduct) => (
        <Space>
          <Button
            type="text"
            icon={<Edit size={14} />}
            onClick={() => abrirModalEditar(record)}
          >
            Editar
          </Button>
        </Space>
      ),
    },
  ];

  const movimentacoesColumns = [
    {
      title: "Data",
      dataIndex: "createdAt",
      key: "data",
      render: (data: string) => new Date(data).toLocaleDateString("pt-BR"),
    },
    {
      title: "Produto",
      key: "produto",
      render: (record: Stock.Movement) => record.produto.nome,
    },
    {
      title: "Tipo",
      dataIndex: "tipo",
      key: "tipo",
      render: (tipo: string) => (
        <Tag color={tipo === "ENTRADA" ? "green" : "red"}>{tipo}</Tag>
      ),
    },
    { title: "Qtd.", dataIndex: "quantidade", key: "quantidade" },
    { title: "Motivo", dataIndex: "motivo", key: "motivo" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => <Tag>{status}</Tag>,
    },
  ];

  return (
    <div className="space-y-6">
      <Title level={2}>Controle de Estoque</Title>

      {/* KPIs */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card loading={isLoadingKpis}>
            <Statistic
              title="Produtos com Contagem de Estoque Ativa"
              value={kpis?.totalProdutos ?? 0}
              prefix={<Package />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card loading={isLoadingKpis}>
            <Statistic
              title="Estoque Baixo"
              value={kpis?.produtosEstoqueBaixo ?? 0}
              prefix={<AlertTriangle />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card loading={isLoadingKpis}>
            <Statistic
              title="Valor Total em Estoque (Custo)"
              value={kpis?.valorTotalEstoque ?? 0}
              prefix="R$"
              precision={2}
            />
          </Card>
        </Col>
      </Row>

      {/* Filtros */}
      <Card>
        <div className="flex gap-4">
          <BarCodeInput
            value={params.search}
            onChangeValue={(e) => setParams({ ...params, search: e })}
          />
          <CategorySelect
            value={params.categoryId}
            onChange={(e) => setParams({ ...params, categoryId: e })}
            isFilter
          />

          <Button
            type="primary"
            icon={<Plus size={14} />}
            onClick={abrirModalMovimentacao}
          >
            Nova Movimentação
          </Button>
        </div>
      </Card>

      {/* Tabela de Produtos */}
      <Card title="Produtos em Estoque">
        <Table
          dataSource={products}
          columns={columns}
          rowKey="id"
          loading={isLoadingProducts}
          locale={{ emptyText: "Nenhum produto encontrado" }}
        />
      </Card>

      {/* Tabela de Movimentações */}
      <Card title="Últimas Movimentações">
        <Table
          dataSource={recentMovements}
          columns={movimentacoesColumns}
          rowKey="id"
          pagination={false}
          size="small"
          loading={isLoadingMovements}
          locale={{ emptyText: "Nenhuma movimentação encontrada" }}
        />
      </Card>

      {/* Modal de Edição */}
      <Modal
        title="Editar Detalhes do Produto"
        open={modalEditar}
        onCancel={fecharModalEditar}
        footer={null}
      >
        <Form
          form={formEditar}
          layout="vertical"
          onFinish={handleUpdateProduct}
        >
          <Form.Item
            label="Nome do Produto"
            name="nome"
            rules={[{ required: true }]}
          >
            <NameInput />
          </Form.Item>
          <Form.Item
            label="Estoque Mínimo"
            name="estoqueMinimo"
            rules={[{ required: true }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            label="Preço de Venda"
            name="preco"
            rules={[{ required: true }]}
          >
            <CurrencyInput min={0} placeholder="0,00" />
          </Form.Item>
          <Form.Item label="Custo" name="custo" rules={[{ required: true }]}>
            <CurrencyInput min={0} placeholder="0,00" />
          </Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              Salvar
            </Button>
            <Button onClick={fecharModalEditar}>Cancelar</Button>
          </Space>
        </Form>
      </Modal>

      {/* Modal de Movimentação */}
      <Modal
        title="Nova Movimentação de Estoque"
        open={modalMovimentacao}
        onCancel={fecharModalMovimentacao}
        onOk={() => formMovimentacao.submit()}
        okText="Confirmar"
      >
        <Form
          form={formMovimentacao}
          layout="vertical"
          onFinish={handleCreateMovement}
        >
          <Form.Item
            label="Produto"
            name="produtoId"
            rules={[{ required: true }]}
          >
            <Select
              placeholder="Selecionar produto"
              showSearch
              optionFilterProp="label"
              options={products.map((p) => ({
                value: p.id,
                label: `${p.codigo ? p.codigo + " - " : ""} ${p.nome}`,
              }))}
            />
          </Form.Item>
          <Form.Item
            label="Tipo de Movimentação"
            name="tipo"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="ENTRADA">Entrada</Option>
              <Option value="SAIDA">Saída</Option>
              <Option value="AJUSTE">Ajuste</Option>
            </Select>
          </Form.Item>
          <Form.Item label="Motivo" name="motivo" rules={[{ required: true }]}>
            <Select>
              <Option value="COMPRA">Compra</Option>
              <Option value="VENDA">Venda</Option>
              <Option value="QUEBRA">Quebra</Option>
              <Option value="VENCIMENTO">Vencimento</Option>
              <Option value="DEVOLUCAO">Devolução</Option>
              <Option value="AJUSTE_INVENTARIO">Ajuste de Inventário</Option>
              <Option value="INSUMO_PARA_USO">
                Insumo para uso próprio do Salão
              </Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Quantidade"
            name="quantidade"
            rules={[{ required: true }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Estoque;
