import { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Table,
  Select,
  Input,
  InputNumber,
  Divider,
  Typography,
  message,
  TableColumnProps,
  Form,
  Modal,
  Tooltip,
} from "antd";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Search,
  CreditCard,
  User,
  X,
} from "lucide-react";
import { useProducts } from "@/hooks/use-products";
import { useServices } from "@/hooks/use-services";
import { useCustomers } from "@/hooks/use-customer";
import { useSaleCreate } from "@/hooks/use-sales";
import { usePaymentMethods } from "@/hooks/use-payment-methods";
import { TelaPagamento } from "@/components/PDV/TelaPagamento";
import { formatCurrency } from "@/utils/formatCurrency";
import { useReciboVenda } from "@/hooks/use-recibo-venda";
import { useQueryClient } from "@tanstack/react-query";
import { getSale } from "@/api/sales";

const { Title, Text } = Typography;

type AcrescimoOrDesconto = {
  valor: number;
  tipo: "percentual" | "valor";
};

const PDV_SESSION_KEY = "pdv-session-data";
const INITIAL_STATE = {
  carrinho: [] as Sale.CartItem[],
  clienteSelecionado: null as string | null,
  pagamentos: [],
  desconto: { valor: null, tipo: "percentual" } as AcrescimoOrDesconto,
  acrescimo: { valor: null, tipo: "percentual" } as AcrescimoOrDesconto,
};

const PDV = () => {
  const queryClient = useQueryClient();

  const [saleSession, setSaleSession] = useState<typeof INITIAL_STATE>(() => {
    try {
      const savedSession = window.localStorage.getItem(PDV_SESSION_KEY);
      if (savedSession) {
        return JSON.parse(savedSession);
      }
    } catch (error) {
      console.error("Falha ao carregar sessão do PDV:", error);
    }
    return INITIAL_STATE;
  });

  const { carrinho, clienteSelecionado, pagamentos, desconto, acrescimo } =
    saleSession;

  const [modoCarrinho, setModoCarrinho] = useState<Sale.CartType>("venda");
  const [abrirModalCliente, setAbrirModalCliente] = useState(false);

  const [busca, setBusca] = useState<string>("");
  const { ReciboComponent, abrirRecibo } = useReciboVenda();

  const { data: produtos, isLoading: isLoadingProdutos } = useProducts();
  const { data: servicos, isLoading: isLoadingServicos } = useServices();
  const { data: clientes, isLoading: isLoadingClientes } = useCustomers();
  const { data: formasDePagamentos } = usePaymentMethods();

  const { mutateAsync: createSale } = useSaleCreate();

  useEffect(() => {
    window.localStorage.setItem(
      PDV_SESSION_KEY,
      JSON.stringify(saleSession || [])
    );
  }, [saleSession]);

  const carrinhoVazio = carrinho.length === 0;

  const formatItem = (item: Sale.CartItem) => {
    switch (item.tipo) {
      case "produto":
        return {
          produtoId: item.id,
          preco: item.preco,
          quantidade: item.quantidade,
        };
      case "servico":
        return {
          servicoId: item.id,
          preco: item.preco,
          quantidade: item.quantidade,
        };
    }
  };

  const updateSaleSession = (updates) => {
    setSaleSession((prev) => ({ ...prev, ...updates }));
  };

  const adicionarAoCarrinho = (
    item: Product.Props | Service.Props,
    tipo: "produto" | "servico"
  ) => {
    const novoItem: Sale.CartItem = {
      id: item.id,
      nome: item.nome,
      tipo,
      preco: item.preco,
      quantidade: 1,
    };

    const itemExistente = carrinho?.find((c) => c.id === novoItem.id);
    let novoCarrinho;

    if (itemExistente) {
      novoCarrinho = carrinho?.map((c) =>
        c.id === item.id && c.tipo === tipo
          ? { ...c, quantidade: c.quantidade + 1 }
          : c
      );
    } else {
      novoCarrinho = [...carrinho, novoItem];
    }
    updateSaleSession({ carrinho: novoCarrinho });
  };

  const removerDoCarrinho = (index: number) => {
    updateSaleSession({ carrinho: carrinho?.filter((_, i) => i !== index) });
  };

  const alterarQuantidade = (index: number, novaQuantidade: number) => {
    if (novaQuantidade <= 0) {
      removerDoCarrinho(index);
      return;
    }

    updateSaleSession({
      carrinho: carrinho?.map((item, i) =>
        i === index ? { ...item, quantidade: novaQuantidade } : item
      ),
    });
  };

  const toogleClienteModal = () => setAbrirModalCliente(!abrirModalCliente);

  const toogleCarrinhoTipo = () =>
    setModoCarrinho(modoCarrinho === "venda" ? "pagamento" : "venda");

  const calcularSubtotal = () => {
    return carrinho.reduce(
      (acc, item) => acc + item.preco * item.quantidade,
      0
    );
  };

  const calPercentual = (value: number, item: AcrescimoOrDesconto) => {
    if (item.tipo === "percentual") {
      return (value * item.valor) / 100;
    } else {
      return item.valor;
    }
  };

  const calcularTotal = () => {
    const subtotal = calcularSubtotal();
    const calAcrescimo = calPercentual(subtotal, acrescimo);
    const calDesconto = calPercentual(subtotal, desconto);

    return subtotal + calAcrescimo - calDesconto;
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

    const body: Sale.Props = {
      clienteId: clienteSelecionado,
      funcionarioId: null,
      itens: carrinho.map((item) => formatItem(item)),
      subtotal: calcularSubtotal(),
      total: calcularTotal(),
      troco: troco,
      pagamentos,
      desconto: calPercentual(calcularSubtotal(), desconto),
      acrescimo: calPercentual(calcularSubtotal(), acrescimo),
      status: "PAGO",
    };

    try {
      const novaVenda = await createSale(body);
      const vendaCompleta = await queryClient.fetchQuery({
        queryKey: ["get-sale", novaVenda.id],
        queryFn: () => getSale(novaVenda.id),
      });
      limparCarrinho();
      abrirRecibo(vendaCompleta);
    } catch (error) {
      message.error(error);
    }
  };

  const limparCarrinho = () => {
    setSaleSession(INITIAL_STATE);
    setModoCarrinho("venda");
    window.localStorage.removeItem(PDV_SESSION_KEY);
  };

  const { Option } = Select;

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
      ellipsis: true,
      render: (preco: number) => formatCurrency(preco),
    },
    {
      title: "Qtd.",
      key: "quantidade",
      align: "center",
      render: (_, record, index: number) => (
        <div className="flex items-center gap-2">
          <Button
            size="small"
            icon={<Minus size={14} />}
            onClick={() => alterarQuantidade(index, record.quantidade - 1)}
          />
          <span className="w-8 text-center">{record.quantidade}</span>
          <Button
            size="small"
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
      render: (_, record, index: number) => (
        <Button
          type="text"
          icon={<Trash2 size={14} />}
          onClick={() => removerDoCarrinho(index)}
        />
      ),
    },
  ];

  const filteredProdutos = (produtos || []).filter((produto) =>
    produto.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const filteredServicos = (servicos || []).filter((servico) =>
    servico.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const RenderResumo = () => {
    return (
      <div className="bg-muted p-4 rounded-lg space-y-2">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>{formatCurrency(calcularSubtotal())}</span>
        </div>
        {acrescimo.valor > 0 && (
          <div className="flex justify-between text-salao-success">
            <span>
              Acrescimo
              {acrescimo.tipo === "percentual" ? ` (${acrescimo.valor}%:)` : ""}
            </span>
            <span>
              + {formatCurrency(calPercentual(calcularSubtotal(), acrescimo))}
            </span>
          </div>
        )}
        {desconto.valor > 0 && (
          <div className="flex justify-between text-salao-success">
            <span>
              Desconto
              {desconto.tipo === "percentual" ? ` (${desconto.valor}%:)` : ""}
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
  };

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
          <Card
            loading={isLoadingProdutos || isLoadingServicos}
            title="Produtos e Serviços"
            className="h-full"
          >
            <div className="mb-4">
              <Input
                placeholder="Buscar produtos ou serviços..."
                prefix={<Search size={14} />}
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>

            {!filteredProdutos.length && !filteredServicos.length && (
              <div className="flex justify-center items-center h-full">
                <p className="text-center text-sm text-muted-foreground">
                  Nenhum produto ou serviço encontrado
                </p>
              </div>
            )}

            <div className="space-y-4">
              {filteredProdutos.length > 0 && (
                <div>
                  <Title level={5} className="!mb-3">
                    Produtos
                  </Title>
                  <Row gutter={[8, 8]}>
                    {filteredProdutos?.map((produto) => (
                      <Col xs={12} sm={8} md={6} key={produto.id}>
                        <Card
                          size="small"
                          hoverable
                          onClick={() =>
                            adicionarAoCarrinho(produto, "produto")
                          }
                        >
                          <div className="space-y-2">
                            <Text
                              ellipsis={{
                                tooltip: produto.nome,
                              }}
                              className="font-medium text-sm"
                            >
                              {produto.nome}
                            </Text>
                            <div className="text-salao-primary font-semibold">
                              {formatCurrency(produto.preco)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {produto.estoque} un
                            </div>
                          </div>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </div>
              )}

              {filteredServicos.length > 0 && (
                <div>
                  <Title level={5} className="!mb-3">
                    Serviços
                  </Title>
                  <Row gutter={[8, 8]}>
                    {filteredServicos?.map((servico) => (
                      <Col xs={12} sm={8} md={6} key={servico.id}>
                        <Card
                          size="small"
                          hoverable
                          onClick={() =>
                            adicionarAoCarrinho(servico, "servico")
                          }
                        >
                          <div className="space-y-2">
                            <div className="font-medium text-sm">
                              {servico.nome}
                            </div>
                            <div className="text-salao-primary font-semibold">
                              {formatCurrency(servico.preco)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {servico.duracao}min
                            </div>
                          </div>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </div>
              )}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={
              <div className="flex justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart size={14} />
                  Carrinho ({carrinho.length})
                </div>
                <div>
                  {!clienteSelecionado ? (
                    <Button
                      type="primary"
                      onClick={toogleClienteModal}
                      icon={<User size={14} />}
                    >
                      Vincular um cliente
                    </Button>
                  ) : (
                    <Tooltip title="Desvicular Cliente">
                      <Button
                        className="font-bold hover:underline"
                        onClick={() =>
                          updateSaleSession({ clienteSelecionado: null })
                        }
                        type="text"
                        icon={<X className="font-semibold" size={14} />}
                      >
                        {
                          clientes?.find((c) => c.id === clienteSelecionado)
                            ?.nome
                        }
                      </Button>
                    </Tooltip>
                  )}
                </div>
              </div>
            }
            className="h-full"
          >
            <div className="space-y-4">
              {modoCarrinho === "venda" ? (
                <>
                  <div>
                    <Table
                      dataSource={carrinho}
                      columns={carrinhoColumns}
                      pagination={false}
                      size="small"
                      scroll={{ y: 45 * 5 }}
                      locale={{ emptyText: "Carrinho vazio" }}
                      rowKey={(record) => `${record.tipo}-${record.id}`}
                    />
                  </div>
                  <div>
                    <Form
                      layout="vertical"
                      className="grid grid-cols-3 w-full gap-2"
                    >
                      <Form.Item className="m-0" label="Desconto">
                        <InputNumber
                          disabled={carrinhoVazio}
                          addonAfter={
                            <Select
                              defaultValue={desconto.tipo}
                              onChange={(value) => {
                                updateSaleSession({
                                  desconto: {
                                    valor: saleSession.desconto.valor,
                                    tipo: value,
                                  },
                                });
                              }}
                              options={[
                                {
                                  value: "percentual",
                                  label: "%",
                                },
                                {
                                  value: "valor",
                                  label: "R$",
                                },
                              ]}
                            />
                          }
                          min={0}
                          max={100}
                          value={desconto.valor}
                          onChange={(value) => {
                            updateSaleSession({
                              desconto: {
                                valor: value || 0,
                                tipo: saleSession.desconto.tipo,
                              },
                            });
                          }}
                          style={{ width: "80%" }}
                        />
                      </Form.Item>
                      <Form.Item className="m-0" label="Acréscimo">
                        <InputNumber
                          disabled={carrinhoVazio}
                          addonAfter={
                            <Select
                              defaultValue={acrescimo.tipo}
                              onChange={(value) => {
                                updateSaleSession({
                                  acrescimo: {
                                    valor: saleSession.acrescimo.valor,
                                    tipo: value,
                                  },
                                });
                              }}
                              options={[
                                {
                                  value: "percentual",
                                  label: "%",
                                },
                                {
                                  value: "valor",
                                  label: "R$",
                                },
                              ]}
                            />
                          }
                          min={0}
                          max={100}
                          value={acrescimo.valor}
                          onChange={(value) => {
                            updateSaleSession({
                              acrescimo: {
                                valor: value || 0,
                                tipo: saleSession.acrescimo.tipo,
                              },
                            });
                          }}
                          style={{ width: "80%" }}
                        />
                      </Form.Item>
                      <Form.Item className="m-0 flex items-end w-full">
                        <Button
                          danger
                          icon={<Trash2 size={14} />}
                          onClick={limparCarrinho}
                          disabled={carrinhoVazio}
                          style={{ width: "100%" }}
                        >
                          Limpar Carrinho
                        </Button>
                      </Form.Item>
                    </Form>
                  </div>
                  <RenderResumo />
                  <div className="space-y-2">
                    <Button
                      type="primary"
                      size="large"
                      block
                      icon={<CreditCard size={14} />}
                      onClick={toogleCarrinhoTipo}
                      disabled={carrinhoVazio}
                    >
                      Formas de Pagamento
                    </Button>
                  </div>
                </>
              ) : (
                <TelaPagamento
                  totalAPagar={calcularTotal()}
                  formasDePagamento={formasDePagamentos || []}
                  pagamentos={pagamentos}
                  setPagamentos={(pagamentos) => {
                    updateSaleSession({ pagamentos });
                  }}
                  onFinalizar={finalizarVenda}
                  onVoltar={toogleCarrinhoTipo}
                />
              )}
            </div>
          </Card>
        </Col>
      </Row>

      <Modal
        title="Vincular Cliente"
        open={abrirModalCliente}
        onCancel={toogleClienteModal}
        okText="Confirmar"
        onOk={toogleClienteModal}
      >
        <div className="space-y-4">
          <Select
            placeholder="Selecionar cliente"
            style={{ width: "100%" }}
            value={clienteSelecionado}
            allowClear
            onChange={(cliente) =>
              updateSaleSession({ clienteSelecionado: cliente })
            }
            showSearch
            filterOption={(input, option) =>
              option?.label
                ?.toString()
                .toLowerCase()
                .includes(input.toLowerCase()) ?? false
            }
          >
            {clientes?.map((cliente) => (
              <Option key={cliente.id} value={cliente.id}>
                {cliente.nome} - {cliente.telefone}
              </Option>
            ))}
          </Select>
        </div>
      </Modal>

      <ReciboComponent />
    </div>
  );
};

export default PDV;
