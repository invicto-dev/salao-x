import { useState } from "react";
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
  Printer,
} from "lucide-react";
import { useProducts } from "@/hooks/use-products";
import { useServices } from "@/hooks/use-services";
import { useCustomers } from "@/hooks/use-customer";
import { useSaleCreate } from "@/hooks/use-sales";
import { usePaymentMethods } from "@/hooks/use-payment-methods";
import { TelaPagamento } from "@/components/PDV/TelaPagamento";

const { Title, Text } = Typography;
const { Option } = Select;

const PDV = () => {
  const [modoCarrinho, setModoCarrinho] = useState<Sale.CartType>("venda");
  const [carrinho, setCarrinho] = useState<Sale.CartItem[]>([]);
  const [clienteSelecionado, setClienteSelecionado] = useState<string>(null);
  const [abrirModalCliente, setAbrirModalCliente] = useState(false);

  const [pagamentos, setPagamentos] = useState<Sale.Props["pagamentos"]>([]);
  const [desconto, setDesconto] = useState<number>(0);
  const [acrescimo, setAcrescimo] = useState<number>(0);
  const [busca, setBusca] = useState<string>("");
  const [reciboPrint, setReciboPrint] = useState(false);

  const { data: produtos } = useProducts();
  const { data: servicos } = useServices();
  const { data: clientes } = useCustomers();
  /*  const { data: funcionarios } = useFuncionarios(); */
  const { data: formasDePagamentos } = usePaymentMethods();

  const { mutate: createSale } = useSaleCreate();

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

    const itemExistente = carrinho.find((c) => c.id === novoItem.id);

    if (itemExistente) {
      setCarrinho(
        carrinho?.map((c) =>
          c.id === item.id && c.tipo === tipo
            ? { ...c, quantidade: c.quantidade + 1 }
            : c
        )
      );
    } else {
      setCarrinho([...carrinho, novoItem]);
    }
  };

  const removerDoCarrinho = (index: number) => {
    setCarrinho(carrinho?.filter((_, i) => i !== index));
  };

  const alterarQuantidade = (index: number, novaQuantidade: number) => {
    if (novaQuantidade <= 0) {
      removerDoCarrinho(index);
      return;
    }

    setCarrinho(
      carrinho?.map((item, i) =>
        i === index ? { ...item, quantidade: novaQuantidade } : item
      )
    );
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

  const calPercentual = (valor: number, percentual: number) =>
    (valor * percentual) / 100;

  const calcularTotal = () => {
    const subtotal = calcularSubtotal();
    const calAcrescimo = calPercentual(subtotal, acrescimo);
    const calDesconto = calPercentual(subtotal, desconto);

    return subtotal + calAcrescimo - calDesconto;
  };

  const finalizarVenda = async () => {
    if (carrinho.length === 0) {
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
      pagamentos,
      desconto: 0,
      acrescimo: 0,
      status: "PAGO",
    };

    createSale(body);
    setReciboPrint(true);
  };

  const limparCarrinho = () => {
    setCarrinho([]);
    setClienteSelecionado("");
    setDesconto(0);
    setAcrescimo(0);
    setPagamentos([]);
    setClienteSelecionado(null);
    setModoCarrinho("venda");
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
      ellipsis: true,
      render: (preco: number) => `R$ ${preco}`,
    },
    {
      title: "Qtd.",
      key: "quantidade",
      align: "center",
      render: (_: any, record: Sale.CartItem, index: number) => (
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
      render: (_, record: Sale.CartItem) => (
        <span className="font-semibold">
          R$ {(record.preco * record.quantidade).toFixed(2)}
        </span>
      ),
    },
    {
      title: "Ações",
      key: "acoes",
      align: "center",
      render: (_, record: Sale.CartItem, index: number) => (
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
          <span>R$ {calcularSubtotal().toFixed(2)}</span>
        </div>
        {acrescimo > 0 && (
          <div className="flex justify-between text-salao-success">
            <span>Acrescimo ({acrescimo}%):</span>
            <span>
              + R$ {((calcularSubtotal() * acrescimo) / 100).toFixed(2)}
            </span>
          </div>
        )}
        {desconto > 0 && (
          <div className="flex justify-between text-salao-success">
            <span>Desconto ({desconto}%):</span>
            <span>
              - R$ {((calcularSubtotal() * desconto) / 100).toFixed(2)}
            </span>
          </div>
        )}

        <Divider className="!my-2" />
        <div className="flex justify-between text-lg font-semibold">
          <span>Total:</span>
          <span className="text-salao-primary">
            R$ {calcularTotal().toFixed(2)}
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
          <Card title="Produtos e Serviços" className="h-full">
            <div className="mb-4">
              <Input
                placeholder="Buscar produtos ou serviços..."
                prefix={<Search size={14} />}
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>

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
                              R$ {produto.preco}
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
                              R$ {servico.preco}
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
                        onClick={() => setClienteSelecionado(null)}
                        type="text"
                        icon={<User className="font-semibold" size={14} />}
                      >
                        {
                          clientes.find((c) => c.id === clienteSelecionado)
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
                          min={0}
                          max={100}
                          value={desconto}
                          onChange={(value) => setDesconto(value || 0)}
                          style={{ width: "100%" }}
                        />
                      </Form.Item>
                      <Form.Item className="m-0" label="Acréscimo">
                        <InputNumber
                          min={0}
                          max={100}
                          value={acrescimo}
                          onChange={(value) => setAcrescimo(value || 0)}
                          style={{ width: "100%" }}
                        />
                      </Form.Item>
                      <Form.Item className="m-0 flex items-end w-full">
                        <Button
                          danger
                          icon={<Trash2 size={14} />}
                          onClick={limparCarrinho}
                          disabled={carrinho.length === 0}
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
                      disabled={carrinho.length === 0}
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
                  setPagamentos={setPagamentos}
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
            onChange={setClienteSelecionado}
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

      <Modal
        title="Recibo de Venda"
        open={reciboPrint}
        onCancel={() => {
          limparCarrinho();
          setReciboPrint(false);
        }}
        footer={[
          <Button
            key="print"
            icon={<Printer size={14} />}
            onClick={() => window.print()}
          >
            Imprimir
          </Button>,
          <Button
            key="close"
            onClick={() => {
              limparCarrinho();
              setReciboPrint(false);
            }}
          >
            Fechar
          </Button>,
        ]}
        width={400}
      >
        <div className="space-y-4 print:text-black">
          <div className="text-center">
            <Title level={4} className="!mb-1">
              Salão X
            </Title>
            <p className="text-sm">Recibo de Venda</p>
          </div>

          <Divider />

          <div>
            <p>
              <strong>Cliente:</strong>{" "}
              {clientes?.find((c) => c.id === clienteSelecionado)?.nome}
            </p>
            <p>
              <strong>Data:</strong> {new Date().toLocaleDateString("pt-BR")}
            </p>
            <p>
              <strong>Hora:</strong> {new Date().toLocaleTimeString("pt-BR")}
            </p>
          </div>

          <Divider />

          <div className="space-y-2">
            {carrinho?.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>
                  {item.nome} x{item.quantidade}
                </span>
                <span>R$ {(item.preco * item.quantidade).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <Divider />

          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>R$ {calcularSubtotal().toFixed(2)}</span>
            </div>
            {acrescimo > 0 && (
              <div className="flex justify-between">
                <span>Acréscimo:</span>
                <span>
                  R$ {((calcularSubtotal() * acrescimo) / 100).toFixed(2)}
                </span>
              </div>
            )}
            {desconto > 0 && (
              <div className="flex justify-between">
                <span>Desconto:</span>
                <span>
                  R$ {((calcularSubtotal() * desconto) / 100).toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-lg">
              <span>Total:</span>
              <span>R$ {calcularTotal().toFixed(2)}</span>
            </div>
          </div>

          <div className="text-center text-sm text-muted-foreground mt-4">
            <p>Obrigado pela preferência!</p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PDV;
