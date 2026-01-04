import {
  Button,
  ButtonProps,
  Card,
  Col,
  List,
  message,
  Row,
  Tooltip,
  Typography,
} from "antd";
import {
  ShoppingCart,
  User,
  X,
  CircleX,
  CircleMinus,
  ClipboardPenLine,
  CreditCard,
  Eraser,
} from "lucide-react";
import { useCaixaManager, useHasOpenCaixa } from "@/hooks/use-caixa";
import { useState } from "react";
import SelectCustomerDrawer from "../../drawers/SelectCustomer";
import { carrinhoColumns } from "@/constants/tables/pdv";
import { ResponsiveTable } from "../../tables/ResponsiveTable";
import { formatCurrency } from "@/utils/formatCurrency";
import { useSaleCreate} from "@/hooks/use-sales";
import CartSummary from "./Summary";
import { formatItem } from "@/utils/cart/formatItem";
import PercentageOrCurrencyInput from "../../inputs/PercentagemOrCurrency";
import { INITIAL_STATE } from "@/constants/sales";
import { Payments } from "./Payments";

interface Props {
  total: number;
  subtotal: number;
  salesSession: Sale.SessionProps;
  updateSaleSession: (updates: Partial<Sale.SessionProps>) => void;
}

const { Text, Title } = Typography;

export default function Cart({
  total,
  subtotal,
  salesSession,
  updateSaleSession,
}: Props) {
  const { data: cash, isFetching: isFetchingCaixa } = useHasOpenCaixa();
  const { mutateAsync: create, isPending: isOpenOrder } = useSaleCreate();

  const { CaixaManagerModal, openCaixaModal, closeCaixaModal } =
    useCaixaManager();

  const [openSelectCustomerModal, setOpenSelectCustomerModal] =
    useState<boolean>(false);

  const isOpenCash: boolean =
    !isFetchingCaixa && cash && cash.id && cash.id.length > 0;

  const { carrinho, clienteSelecionado, acrescimo, desconto } = salesSession;
  const emptyCart = carrinho.content.length === 0 || carrinho === null;

  const onToggleSelectCustomerModal = () =>
    setOpenSelectCustomerModal((prev) => !prev);

  const handleSelectCustomer = (customer: Customer.Props) => {
    updateSaleSession({ clienteSelecionado: customer });
  };

  const removeFromCart = (index: number) => {
    updateSaleSession({
      carrinho: {
        mode: carrinho.mode,
        content: carrinho.content.filter((_, i) => i !== index),
      },
    });
  };

  const alterarQuantidade = (index: number, novaQuantidade: number) => {
    if (novaQuantidade <= 0) {
      removeFromCart(index);
      return;
    }

    const newCart = carrinho.content.map((item, i) =>
      i === index ? { ...item, quantidade: novaQuantidade } : item
    );
    updateSaleSession({ carrinho: { mode: carrinho.mode, content: newCart } });
  };

  const clearCart = () => {
    updateSaleSession(INITIAL_STATE());
  };

  const openOrder = async () => {
    if (emptyCart) message.error("O carrinho está vazio.");
    try {
      await create({
        clienteId: clienteSelecionado?.id,
        subtotal: subtotal,
        total: total,
        itens: carrinho.content.map(formatItem),
        status: "PENDENTE",
      });
      clearCart();
    } catch (error) {
      console.error(error);
    }
  };

  const changeToPayment = () => {
    updateSaleSession({ carrinho: { ...carrinho, mode: "payment" } });
  };

  const buttons: ButtonProps[] = [
    {
      children: "Limpar Carrinho",
      icon: <Eraser size={14} />,
      onClick: clearCart,
      danger: true,
      disabled: emptyCart,
    },
    {
      children: "Abrir Comanda",
      icon: <ClipboardPenLine size={14} />,
      onClick: openOrder,
      disabled: emptyCart,
      loading: isOpenOrder,
    },
    {
      children: "Pagamento",
      icon: <CreditCard size={14} />,
      onClick: changeToPayment,
      type: "primary",
      disabled: emptyCart,
    },
  ];

  return (
    <>
      <Card
        loading={isFetchingCaixa}
        title={
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <ShoppingCart size={14} />
              Carrinho ({carrinho?.content?.length || 0})
            </div>
            <div className="flex items-center gap-2">
              {!clienteSelecionado ? (
                <Button
                  type="primary"
                  onClick={onToggleSelectCustomerModal}
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
                    {clienteSelecionado?.nome || "Nenhum cliente selecionado"}
                  </Button>
                </Tooltip>
              )}
              {isOpenCash && (
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
        {!isOpenCash && (
          <div className="absolute inset-0 bg-white/70 dark:bg-black/70 z-10 flex flex-col justify-center items-center space-y-4 rounded-lg">
            <CircleMinus size={48} className="text-salao-primary" />
            <Title level={4}>Caixa Fechado</Title>
            <Text type="secondary">
              Você precisa abrir o caixa para iniciar as vendas.
            </Text>
            <Button type="primary" size="large" onClick={openCaixaModal}>
              Abrir Caixa
            </Button>
          </div>
        )}
        <div className="space-y-8">
          {carrinho.mode === "sale" ? (
            <>
              <ResponsiveTable
                dataSource={carrinho.content}
                columns={carrinhoColumns(alterarQuantidade, removeFromCart)}
                scroll={{ y: 230 }}
                locale={{ emptyText: "Carrinho vazio" }}
                rowKey={(r) => `${r.tipo}-${r.id}`}
                size="small"
                pagination={false}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={`${item.quantidade} x ${item.nome}`}
                      description={formatCurrency(item.preco)}
                    />
                    <div>{formatCurrency(item.preco)}</div>
                  </List.Item>
                )}
              />
              <>
                <Row gutter={18}>
                  <Col span={6}>
                    <Text strong>Acréscimo</Text>
                    <PercentageOrCurrencyInput
                      type={acrescimo?.type}
                      value={acrescimo?.value}
                      onChange={(value) =>
                        updateSaleSession({
                          acrescimo: { ...acrescimo, value: Number(value) },
                        })
                      }
                      onChangeAddon={(value) =>
                        updateSaleSession({
                          acrescimo: { ...acrescimo, type: value },
                        })
                      }
                    />
                  </Col>
                  <Col span={6}>
                    <Text strong>Desconto</Text>
                    <PercentageOrCurrencyInput
                      maxCurrency={total}
                      type={desconto?.type}
                      value={desconto?.value}
                      onChange={(value) =>
                        updateSaleSession({
                          desconto: { ...desconto, value: Number(value) },
                        })
                      }
                      onChangeAddon={(value) =>
                        updateSaleSession({
                          desconto: { ...desconto, type: value },
                        })
                      }
                    />
                  </Col>
                </Row>
                <Row gutter={8}>
                  {buttons.map((button) => (
                    <Col span={8}>
                      <Button block {...button} />
                    </Col>
                  ))}
                </Row>
                <CartSummary
                  total={total}
                  subtotal={subtotal}
                  decrease={salesSession.desconto}
                  increase={salesSession.acrescimo}
                />
              </>
            </>
          ) : (
            <Payments
              total={total}
              salesSession={salesSession}
              updateSaleSession={updateSaleSession}
              clearCart={clearCart}
            />
          )}
        </div>
      </Card>
      <SelectCustomerDrawer
        open={openSelectCustomerModal}
        onClose={onToggleSelectCustomerModal}
        onSelect={handleSelectCustomer}
      />
      {CaixaManagerModal}
    </>
  );
}
