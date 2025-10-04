import { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Table,
  Select,
  InputNumber,
  Divider,
  Typography,
  message,
  TableColumnProps,
  Form,
  Modal,
  Tooltip,
  Alert,
} from "antd";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  User,
  X,
  Package,
  Scissors,
  DollarSign,
  CircleX,
} from "lucide-react";
import { useServices } from "@/hooks/use-services";
import { useCustomers } from "@/hooks/use-customer";
import { useSaleCreate } from "@/hooks/use-sales";
import { usePaymentMethods } from "@/hooks/use-payment-methods";
import { TelaPagamento } from "@/components/PDV/TelaPagamento";
import { formatCurrency } from "@/utils/formatCurrency";
import { useReciboVenda } from "@/hooks/use-recibo-venda";
import { useQueryClient } from "@tanstack/react-query";
import { getSale } from "@/api/sales";
import { CurrencyInput } from "@/components/inputs/CurrencyInput";
import { useNavigate } from "react-router-dom";
import { useCaixaManager, useHasOpenCaixa } from "@/hooks/use-caixa";
import BarCodeInput from "@/components/inputs/BarCodeInput";
import { useProducts } from "@/hooks/use-products";
import { CardWithDisabled } from "@/components/cards/cardWithDisabled";
import { useDebounce } from "@/hooks/use-debounce";

const { Title, Text } = Typography;
const { Option } = Select;

type AcrescimoOrDesconto = {
  valor: number;
  tipo: "percentual" | "valor";
};

type ItemType = "produto" | "servico";
type ItemProps = Product.Props | Service.Props;

const PDV_SESSION_KEY = "pdv-session-data";
const INITIAL_STATE = {
  carrinho: [] as Sale.CartItem[],
  clienteSelecionado: null as string | null,
  pagamentos: [] as Sale.Props["pagamentos"],
  desconto: { valor: null, tipo: "percentual" } as AcrescimoOrDesconto,
  acrescimo: { valor: null, tipo: "percentual" } as AcrescimoOrDesconto,
};

const PDV = () => {
  const [formModal] = Form.useForm();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [saleSession, setSaleSession] = useState<typeof INITIAL_STATE>(() => {
    try {
      const savedSession = window.localStorage.getItem(PDV_SESSION_KEY);
      return savedSession ? JSON.parse(savedSession) : INITIAL_STATE;
    } catch (error) {
      console.error("Falha ao carregar sessão do PDV:", error);
      return INITIAL_STATE;
    }
  });

  const { carrinho, clienteSelecionado, pagamentos, desconto, acrescimo } =
    saleSession;

  const [modoCarrinho, setModoCarrinho] = useState<"venda" | "pagamento">(
    "venda"
  );
  const [abrirModalCliente, setAbrirModalCliente] = useState(false);
  const [modalValorAberto, setModalValorAberto] = useState<{
    visible: boolean;
    item: ItemProps | null;
    tipo: ItemType | null;
  }>({
    visible: false,
    item: null,
    tipo: null,
  });

  const [busca, setBusca] = useState<string>("");
  const debouncedBusca = useDebounce(busca, 500);
  const { ReciboComponent, abrirRecibo } = useReciboVenda();

  const { data: produtos = [], isLoading: isLoadingProdutos } = useProducts({
    search: debouncedBusca,
    status: "true",
  });
  const { data: servicos = [], isLoading: isLoadingServicos } = useServices({
    search: debouncedBusca,
    status: "true",
  });
  const { data: hasOpenCaixa, isFetching: isFetchingCaixa } = useHasOpenCaixa();
  const { openCaixaModal, closeCaixaModal, CaixaManagerModal } =
    useCaixaManager();

  const { data: clientes = [] } = useCustomers();
  const { data: formasDePagamentos = [] } = usePaymentMethods();
  const { mutateAsync: createSale, isPending: isCreatingSale } =
    useSaleCreate();

  const isCaixaFechado = !isFetchingCaixa && !hasOpenCaixa;

  const notStockProduct = (id: string) => {
    return (
      carrinho.find((c) => c.id === id)?.quantidade >=
      produtos.find((p) => p.id === id)?.estoqueAtual
    );
  };

  const disabledItem = (item: Product.Props) => {
    return item.estoqueAtual == 0 || notStockProduct(item.id);
  };

  useEffect(() => {
    window.localStorage.setItem(PDV_SESSION_KEY, JSON.stringify(saleSession));
  }, [saleSession]);

  const carrinhoVazio = carrinho.length === 0;

  const formatItem = (item: Sale.CartItem) => {
    switch (item.tipo) {
      case "produto":
        return {
          produtoId: item.id,
          preco: item.preco,
          quantidade: item.quantidade,
          contarEstoque: item.contarEstoque,
        };
      case "servico":
        return {
          servicoId: item.id,
          preco: item.preco,
          quantidade: item.quantidade,
        };
    }
  };

  const updateSaleSession = (updates: Partial<typeof INITIAL_STATE>) => {
    setSaleSession((prev) => ({ ...prev, ...updates }));
  };

  const itemExistente = (itemId: string) =>
    carrinho?.find((c) => c.id === itemId);

  const adicionarAoCarrinho = (item: ItemProps, tipo: ItemType) => {
    const itemNoCarrinho = itemExistente(item.id);

    let novoCarrinho;
    if (itemNoCarrinho) {
      novoCarrinho = carrinho.map((c) =>
        c.id === item.id ? { ...c, quantidade: c.quantidade + 1 } : c
      );
    } else {
      const novoItem: Sale.CartItem = {
        id: item.id,
        nome: item.nome,
        tipo,
        preco: item.preco,
        quantidade: 1,
        contarEstoque: (item as Product.Props).contarEstoque,
      };
      novoCarrinho = [...carrinho, novoItem];
    }
    updateSaleSession({ carrinho: novoCarrinho });
  };

  const removerDoCarrinho = (index: number) => {
    updateSaleSession({ carrinho: carrinho.filter((_, i) => i !== index) });
  };

  const alterarQuantidade = (index: number, novaQuantidade: number) => {
    if (novaQuantidade <= 0) {
      removerDoCarrinho(index);
      return;
    }

    const novoCarrinho = carrinho.map((item, i) =>
      i === index ? { ...item, quantidade: novaQuantidade } : item
    );
    updateSaleSession({ carrinho: novoCarrinho });
  };

  const toogleClienteModal = () => setAbrirModalCliente((prev) => !prev);
  const toogleCarrinhoTipo = () =>
    setModoCarrinho((prev) => (prev === "venda" ? "pagamento" : "venda"));

  const calcularSubtotal = () =>
    carrinho.reduce((acc, item) => acc + item.preco * item.quantidade, 0);

  const calPercentual = (value: number, item: AcrescimoOrDesconto) => {
    if (!item.valor || item.valor <= 0) return 0;
    return item.tipo === "percentual" ? (value * item.valor) / 100 : item.valor;
  };

  const calcularTotal = () => {
    const subtotal = calcularSubtotal();
    const valorAcrescimo = calPercentual(subtotal, acrescimo);
    const valorDesconto = calPercentual(subtotal, desconto);
    return subtotal + valorAcrescimo - valorDesconto;
  };

  const handleItemClick = (item: ItemProps, tipo: ItemType) => {
    if (item.valorEmAberto && !itemExistente(item.id)) {
      setModalValorAberto({ visible: true, item, tipo });
    } else {
      adicionarAoCarrinho(item, tipo);
    }
  };

  const handleCloseModalValorAberto = () => {
    formModal.resetFields();
    setModalValorAberto({ visible: false, item: null, tipo: null });
  };

  const handleDefinirValor = (values: { preco: number }) => {
    const { item, tipo } = modalValorAberto;
    if (item && tipo) {
      const itemComNovoPreco = { ...item, preco: values.preco };
      adicionarAoCarrinho(itemComNovoPreco, tipo);
    }
    handleCloseModalValorAberto();
  };

  const finalizarVenda = async (troco: number) => {
    if (carrinhoVazio) {
      message.error("Carrinho vazio!");
      return;
    }
    if (pagamentos.length === 0) {
      message.error("Adicione ao menos uma forma de pagamento.");
      return;
    }
    const totalPago = pagamentos.reduce((acc, p) => acc + p.valor, 0);
    if (totalPago < calcularTotal()) {
      message.error("O valor pago é menor que o total da venda.");
      return;
    }

    try {
      const novaVenda = await createSale({
        clienteId: clienteSelecionado,
        funcionarioId: null,
        itens: carrinho.map(formatItem),
        subtotal: calcularSubtotal(),
        total: calcularTotal(),
        troco,
        pagamentos,
        desconto: calPercentual(calcularSubtotal(), desconto),
        acrescimo: calPercentual(calcularSubtotal(), acrescimo),
        status: "PAGO",
      });
      const vendaCompleta = await queryClient.fetchQuery({
        queryKey: ["get-sale", novaVenda.id],
        queryFn: () => getSale(novaVenda.id),
      });
      limparVenda();
      abrirRecibo(vendaCompleta);
    } catch (error: any) {
      console.error(error.message || "Erro ao finalizar a venda.");
    }
  };

  const limparVenda = () => {
    setSaleSession(INITIAL_STATE);
    setModoCarrinho("venda");
    window.localStorage.removeItem(PDV_SESSION_KEY);
  };

  const carrinhoColumns: TableColumnProps<Sale.CartItem>[] = [
    {
      title: "Item",
      dataIndex: "nome",
      key: "nome",
      width: "30%",
      render: (text: string) => (
        <Text ellipsis={{ tooltip: text }} className="font-medium">
          {text}
        </Text>
      ),
    },
    {
      title: "Preço Unit.",
      dataIndex: "preco",
      key: "preco",
      align: "center",
      render: (preco: number) => formatCurrency(preco),
    },
    {
      title: "Qtd.",
      key: "quantidade",
      align: "center",
      render: (_, record, index) => (
        <div>
          <Button
            size="small"
            type="text"
            icon={<Minus size={14} />}
            onClick={() =>
              record.quantidade > 1 &&
              alterarQuantidade(index, record.quantidade - 1)
            }
          />
          <InputNumber
            value={record?.quantidade}
            max={produtos.find((p) => p.id === record.id)?.estoqueAtual}
            size="small"
            onChange={(value) => value && alterarQuantidade(index, value)}
            controls={false}
            min={1}
            className="w-11 text-center"
          />
          <Button
            disabled={notStockProduct(record.id)}
            size="small"
            type="text"
            icon={<Plus size={14} />}
            onClick={() => alterarQuantidade(index, record.quantidade + 1)}
          />
        </div>
      ),
    },
    {
      title: "Total",
      key: "total",
      align: "center",
      render: (_, record) => (
        <span className="font-semibold">
          {formatCurrency(record.preco * record.quantidade)}
        </span>
      ),
    },
    {
      title: "Ações",
      key: "acoes",
      align: "center",
      render: (_, __, index) => (
        <Button
          type="text"
          danger
          icon={<Trash2 size={14} />}
          onClick={() => removerDoCarrinho(index)}
        />
      ),
    },
  ];

  const RenderResumo = () => (
    <div className="bg-muted p-4 rounded-lg space-y-2">
      <div className="flex justify-between">
        <span>Subtotal:</span>
        <span>{formatCurrency(calcularSubtotal())}</span>
      </div>
      {acrescimo.valor > 0 && (
        <div className="flex justify-between text-green-600">
          <span>
            Acréscimo
            {acrescimo.tipo === "percentual" && ` (${acrescimo.valor}%)`}
          </span>
          <span>
            + {formatCurrency(calPercentual(calcularSubtotal(), acrescimo))}
          </span>
        </div>
      )}
      {desconto.valor > 0 && (
        <div className="flex justify-between text-red-600">
          <span>
            Desconto
            {desconto.tipo === "percentual" && ` (${desconto.valor}%)`}
          </span>
          <span>
            - {formatCurrency(calPercentual(calcularSubtotal(), desconto))}
          </span>
        </div>
      )}
      <Divider className="!my-2" />
      <div className="flex justify-between text-lg font-semibold">
        <span>Total:</span>
        <span className="text-salao-primary">
          {formatCurrency(calcularTotal())}
        </span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <Title level={2} className="!mb-2">
          PDV - Ponto de Venda
        </Title>
        <p className="text-muted-foreground">
          Sistema completo para vendas e atendimento
        </p>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Produtos e Serviços" className="h-full">
            <BarCodeInput
              label="produto ou serviço"
              value={busca}
              onChangeValue={setBusca}
              sourceLength={produtos.length + servicos.length}
            />
            <div className="mt-4">
              {!produtos.length &&
              !servicos.length &&
              !isLoadingProdutos &&
              !isLoadingServicos ? (
                <div className="flex flex-col gap-4 justify-center items-center h-48">
                  <p className="text-center text-sm text-muted-foreground">
                    Nenhum item encontrado
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="large"
                      onClick={() => navigate("/produtos")}
                      type="dashed"
                      icon={<Package size={14} />}
                    >
                      Adicionar Produtos
                    </Button>
                    <Button
                      size="large"
                      onClick={() => navigate("/servicos")}
                      type="dashed"
                      icon={<Scissors size={14} />}
                    >
                      Adicionar Serviços
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  className={
                    isCaixaFechado
                      ? "pointer-events-none opacity-50"
                      : "space-y-8"
                  }
                >
                  {produtos.length > 0 && (
                    <div>
                      <Title level={5} className="!mb-3">
                        Produtos
                      </Title>
                      <div className="max-h-[180px] overflow-y-auto overflow-x-hidden">
                        <Row gutter={[8, 8]}>
                          {produtos.map((produto) => (
                            <Col xs={12} sm={8} md={6} key={produto.id}>
                              <CardWithDisabled
                                size="small"
                                hoverable
                                onClick={() =>
                                  handleItemClick(produto, "produto")
                                }
                                disabled={disabledItem(produto)}
                              >
                                <Text
                                  ellipsis={{ tooltip: produto.nome }}
                                  className="font-medium text-sm block"
                                >
                                  {produto.nome}
                                </Text>
                                <div className="text-salao-primary font-semibold">
                                  {formatCurrency(produto.preco)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {produto.contarEstoque &&
                                  produto.estoqueAtual > 0
                                    ? `${produto.estoqueAtual} ${produto.unidadeMedida}`
                                    : produto.estoqueAtual == 0
                                    ? "Sem estoque"
                                    : "-"}
                                </div>
                              </CardWithDisabled>
                            </Col>
                          ))}
                        </Row>
                      </div>
                    </div>
                  )}
                  {servicos.length > 0 && (
                    <div>
                      <Title level={5} className="!mb-3">
                        Serviços
                      </Title>
                      <div className="max-h-[180px] overflow-y-auto overflow-x-hidden">
                        <Row gutter={[8, 8]}>
                          {servicos.map((servico) => (
                            <Col xs={12} sm={8} md={6} key={servico.id}>
                              <Card
                                size="small"
                                hoverable
                                onClick={() =>
                                  handleItemClick(servico, "servico")
                                }
                              >
                                <Text
                                  ellipsis={{ tooltip: servico.nome }}
                                  className="font-medium text-sm block"
                                >
                                  {servico.nome}
                                </Text>
                                <div className="text-salao-primary font-semibold">
                                  {formatCurrency(servico.preco)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {servico.duracao}min
                                </div>
                              </Card>
                            </Col>
                          ))}
                        </Row>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            loading={isFetchingCaixa}
            title={
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <ShoppingCart size={14} />
                  Carrinho ({carrinho.length})
                </div>
                <div className="flex items-center gap-2">
                  {!clienteSelecionado ? (
                    <Button
                      type="primary"
                      onClick={toogleClienteModal}
                      icon={<User size={14} />}
                    >
                      Vincular Cliente
                    </Button>
                  ) : (
                    <Tooltip title="Desvincular Cliente">
                      <Button
                        onClick={() =>
                          updateSaleSession({
                            clienteSelecionado: null,
                            pagamentos: [],
                          })
                        }
                        type="text"
                        icon={<X size={14} />}
                      >
                        {
                          clientes?.find((c) => c.id === clienteSelecionado)
                            ?.nome
                        }
                      </Button>
                    </Tooltip>
                  )}
                  {/* Indicador de Status do Caixa */}
                  {!isFetchingCaixa && hasOpenCaixa && (
                    <div className="flex items-center gap-4">
                      <Button
                        icon={<CircleX size={14} />}
                        onClick={closeCaixaModal}
                      >
                        Fechar Caixa
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            }
            className="h-full relative"
          >
            {isCaixaFechado && (
              <div className="absolute inset-0 bg-white/70 dark:bg-black/70 z-10 flex flex-col justify-center items-center space-y-4 rounded-lg">
                <DollarSign size={48} className="text-salao-primary" />
                <Title level={4}>Caixa Fechado</Title>
                <Text type="secondary">
                  Você precisa abrir o caixa para iniciar as vendas.
                </Text>
                <Button type="primary" size="large" onClick={openCaixaModal}>
                  Abrir Caixa
                </Button>
              </div>
            )}
            <div className="space-y-4">
              {modoCarrinho === "venda" ? (
                <>
                  <Table
                    dataSource={carrinho}
                    columns={carrinhoColumns}
                    pagination={false}
                    size="small"
                    scroll={{ y: 250 }}
                    locale={{ emptyText: "Carrinho vazio" }}
                    rowKey={(r) => `${r.tipo}-${r.id}`}
                  />
                  <Row gutter={8}>
                    <Col span={12}>
                      <Form.Item label="Desconto" className="!mb-0">
                        {desconto.tipo === "percentual" ? (
                          <InputNumber
                            disabled={carrinhoVazio}
                            value={desconto.valor}
                            placeholder="0.00"
                            onChange={(v) =>
                              updateSaleSession({
                                desconto: { ...desconto, valor: v || 0 },
                              })
                            }
                            addonBefore={
                              <Select
                                value={desconto.tipo}
                                onChange={(t) =>
                                  updateSaleSession({
                                    desconto: { ...desconto, tipo: t },
                                  })
                                }
                              >
                                <Option value="percentual">%</Option>
                                <Option value="valor">R$</Option>
                              </Select>
                            }
                            min={0}
                            style={{ width: "100%" }}
                          />
                        ) : (
                          <CurrencyInput
                            disabled={carrinhoVazio}
                            value={desconto.valor}
                            placeholder="0,00"
                            prefix={null}
                            onChange={(v) =>
                              updateSaleSession({
                                desconto: {
                                  ...desconto,
                                  valor: Number(v) || 0,
                                },
                              })
                            }
                            addonBefore={
                              <Select
                                value={desconto.tipo}
                                onChange={(t) =>
                                  updateSaleSession({
                                    desconto: { ...desconto, tipo: t },
                                  })
                                }
                              >
                                <Option value="percentual">%</Option>
                                <Option value="valor">R$</Option>
                              </Select>
                            }
                          />
                        )}
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Acréscimo" className="!mb-0">
                        {acrescimo.tipo === "percentual" ? (
                          <InputNumber
                            disabled={carrinhoVazio}
                            value={acrescimo.valor}
                            placeholder="0.00"
                            onChange={(v) =>
                              updateSaleSession({
                                acrescimo: { ...acrescimo, valor: v || 0 },
                              })
                            }
                            addonBefore={
                              <Select
                                value={acrescimo.tipo}
                                onChange={(t) =>
                                  updateSaleSession({
                                    acrescimo: { ...acrescimo, tipo: t },
                                  })
                                }
                              >
                                <Option value="percentual">%</Option>
                                <Option value="valor">R$</Option>
                              </Select>
                            }
                            min={0}
                            style={{ width: "100%" }}
                          />
                        ) : (
                          <CurrencyInput
                            disabled={carrinhoVazio}
                            value={acrescimo.valor}
                            placeholder="0,00"
                            prefix={null}
                            onChange={(v) =>
                              updateSaleSession({
                                acrescimo: {
                                  ...acrescimo,
                                  valor: Number(v) || 0,
                                },
                              })
                            }
                            addonBefore={
                              <Select
                                value={acrescimo.tipo}
                                onChange={(t) =>
                                  updateSaleSession({
                                    acrescimo: { ...acrescimo, tipo: t },
                                  })
                                }
                              >
                                <Option value="percentual">%</Option>
                                <Option value="valor">R$</Option>
                              </Select>
                            }
                          />
                        )}
                      </Form.Item>
                    </Col>
                  </Row>
                  <RenderResumo />
                  <Row gutter={8}>
                    <Col span={12}>
                      <Button
                        danger
                        icon={<Trash2 size={14} />}
                        onClick={limparVenda}
                        disabled={carrinhoVazio}
                        block
                      >
                        Limpar Venda
                      </Button>
                    </Col>
                    <Col span={12}>
                      <Button
                        type="primary"
                        icon={<CreditCard size={14} />}
                        onClick={toogleCarrinhoTipo}
                        disabled={carrinhoVazio}
                        block
                      >
                        Pagamento
                      </Button>
                    </Col>
                  </Row>
                </>
              ) : (
                <TelaPagamento
                  totalAPagar={calcularTotal()}
                  formasDePagamento={
                    formasDePagamentos.filter((f) =>
                      clienteSelecionado && clienteSelecionado
                        ? f
                        : f.integration !== "ASAAS_CREDIT"
                    ) || []
                  }
                  pagamentos={pagamentos}
                  setPagamentos={(p: Sale.Props["pagamentos"]) =>
                    updateSaleSession({ pagamentos: p })
                  }
                  onFinalizar={finalizarVenda}
                  onVoltar={toogleCarrinhoTipo}
                  loading={isCreatingSale}
                />
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {CaixaManagerModal}

      <Modal
        title="Vincular Cliente"
        open={abrirModalCliente}
        onCancel={toogleClienteModal}
        onOk={toogleClienteModal}
      >
        <Select
          placeholder="Selecionar cliente"
          style={{ width: "100%" }}
          value={clienteSelecionado}
          allowClear
          onChange={(c) => updateSaleSession({ clienteSelecionado: c })}
          showSearch
          filterOption={(input, option) =>
            String(option?.label ?? "")
              .toLowerCase()
              .includes(input.toLowerCase())
          }
          options={clientes?.map((c) => ({
            value: c.id,
            label: `${c.nome} - ${c.telefone}`,
          }))}
        />
      </Modal>

      <Modal
        title="Definir Valor Aberto"
        open={modalValorAberto.visible}
        onCancel={handleCloseModalValorAberto}
        okText="Adicionar ao Carrinho"
        onOk={() => formModal.submit()}
        width={400}
      >
        <Form
          form={formModal}
          onFinish={handleDefinirValor}
          layout="vertical"
          initialValues={{ preco: modalValorAberto.item?.preco || 0 }}
        >
          <Alert
            message={modalValorAberto.item?.nome}
            type="info"
            showIcon
            className="!mb-6"
          />
          <Form.Item
            name="preco"
            label="Valor"
            rules={[
              { required: true, message: "O valor é obrigatório." },
              {
                validator: (_, value) =>
                  value > 0
                    ? Promise.resolve()
                    : Promise.reject(
                        new Error("O valor deve ser maior que zero.")
                      ),
              },
            ]}
          >
            <CurrencyInput />
          </Form.Item>
        </Form>
      </Modal>

      <ReciboComponent />
    </div>
  );
};

export default PDV;
