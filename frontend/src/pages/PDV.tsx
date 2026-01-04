import { useEffect, useState } from "react";
import { Card, Row, Col, Button, Typography, Form, Modal, Alert } from "antd";
import { Package, Scissors } from "lucide-react";
import { useServices } from "@/hooks/use-services";
import { useSale } from "@/hooks/use-sales";
import { formatCurrency } from "@/utils/formatCurrency";
import { CurrencyInput } from "@/components/inputs/CurrencyInput";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useHasOpenCaixa } from "@/hooks/use-caixa";
import BarCodeInput from "@/components/inputs/BarCodeInput";
import { useProducts } from "@/hooks/use-products";
import { CardWithDisabled } from "@/components/cards/cardWithDisabled";
import { useDebounce } from "@/hooks/use-debounce";
import { INITIAL_STATE, PDV_SESSION_KEY } from "@/constants/sales";
import { calPercentual } from "@/utils/cart/calculeIncreaseOrDecrease";
import Cart from "@/components/PDV/cart";

type ItemType = "produto" | "servico";
type ItemProps = Product.Props | Service.Props;

const { Title, Text } = Typography;

const PDV = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const pedido = searchParams.get("pedido");
  const { data: sale } = useSale(pedido);

  const [formModal] = Form.useForm();

  const [saleSession, setSaleSession] = useState<Sale.SessionProps>(() => {
    try {
      const savedSession = window.localStorage.getItem(PDV_SESSION_KEY);
      return savedSession ? JSON.parse(savedSession) : INITIAL_STATE(sale);
    } catch (error) {
      console.error("Falha ao carregar sessão do PDV:", error);
      return INITIAL_STATE(sale);
    }
  });

  const { carrinho, acrescimo, desconto } = saleSession;

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

  const { data: produtos = [], isLoading: isLoadingProdutos } = useProducts({
    search: debouncedBusca,
    status: "true",
  });
  const { data: servicos = [], isLoading: isLoadingServicos } = useServices({
    search: debouncedBusca,
    status: "true",
  });
  const { data: hasOpenCaixa, isFetching: isFetchingCaixa } = useHasOpenCaixa();

  const isCaixaFechado = !isFetchingCaixa && !hasOpenCaixa;

  const notStockProduct = (id: string) => {
    return (
      carrinho?.content.find((c) => c.id === id)?.quantidade >=
      produtos?.find((p) => p.id === id)?.estoqueAtual
    );
  };

  const disabledItem = (item: Product.Props) => {
    return (
      (item.contarEstoque && item.estoqueAtual == 0) ||
      (item.contarEstoque && notStockProduct(item.id))
    );
  };

  useEffect(() => {
    if (sale) {
      setSaleSession(INITIAL_STATE(sale));
    }
  }, [sale]);

  useEffect(() => {
    if (!sale) {
      window.localStorage.setItem(PDV_SESSION_KEY, JSON.stringify(saleSession));
    }
  }, [saleSession, sale]);

  const updateSaleSession = (updates: Partial<Sale.SessionProps>) => {
    setSaleSession((prev) => ({ ...prev, ...updates }));
  };

  const itemExistente = (itemId: string) =>
    carrinho?.content.find((c) => c.id === itemId);

  const adicionarAoCarrinho = (item: ItemProps, tipo: ItemType) => {
    const itemNoCarrinho = itemExistente(item.id);

    let novoCarrinho;
    if (itemNoCarrinho) {
      novoCarrinho = carrinho.content.map((c) =>
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
      novoCarrinho = [...carrinho.content, novoItem];
    }
    updateSaleSession({
      carrinho: { mode: carrinho.mode, content: novoCarrinho },
    });
  };

  const handleItemClick = (item: ItemProps, tipo: ItemType) => {
    if (item.valorEmAberto && !itemExistente(item.id)) {
      formModal.setFieldsValue({ preco: item.preco });
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

  const calcularTotal = () => {
    if (carrinho.content.length === 0) return 0;
    const subtotal = calcularSubtotal();
    const valorAcrescimo = calPercentual(subtotal, acrescimo);
    const valorDesconto = calPercentual(subtotal, desconto);
    return subtotal + valorAcrescimo - valorDesconto;
  };

  const calcularSubtotal = () => {
    if (carrinho.content.length === 0) return 0;
    return carrinho?.content?.reduce(
      (acc, item) => acc + item.preco * item.quantidade,
      0
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

      <Row gutter={[16, 16]} className="h-[75vh]">
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
                                    : produto.estoqueAtual == 0 &&
                                      produto.contarEstoque
                                    ? "Sem estoque"
                                    : produto.contarEstoque === false
                                    ? "-"
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
          <Cart
            total={calcularTotal()}
            subtotal={calcularSubtotal()}
            salesSession={saleSession}
            updateSaleSession={updateSaleSession}
          />
        </Col>
      </Row>

      <Modal
        title="Definir Valor Aberto"
        open={modalValorAberto.visible}
        onCancel={handleCloseModalValorAberto}
        destroyOnHidden
        okText="Adicionar ao Carrinho"
        onOk={() => formModal.submit()}
        width={400}
      >
        <Form form={formModal} onFinish={handleDefinirValor} layout="vertical">
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
    </div>
  );
};

export default PDV;
