import {
  Button,
  Card,
  Divider,
  List,
  Modal,
  Progress,
  Typography,
  Form,
  message,
  Badge,
} from "antd";
import { ArrowLeft, MinusCircle, Receipt } from "lucide-react";
import React, { useState } from "react";
import { CurrencyInput } from "../../inputs/CurrencyInput";
import { formatCurrency } from "@/utils/formatCurrency";
import { CardWithDisabled } from "../../cards/cardWithDisabled";
import { useFinishedCommand, useSaleCreate } from "@/hooks/use-sales";
import { formatItem } from "@/utils/cart/formatItem";
import { usePaymentMethods } from "@/hooks/use-payment-methods";
import { useReciboVenda } from "@/hooks/use-recibo-venda";
import { useQueryClient } from "@tanstack/react-query";
import { getSale } from "@/api/sales";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

interface PaymentsProps {
  total: number;
  salesSession: Sale.SessionProps;
  updateSaleSession: (updates: Partial<Sale.SessionProps>) => void;
  clearCart: () => void;
}

export const Payments: React.FC<PaymentsProps> = ({
  total,
  salesSession,
  updateSaleSession,
  clearCart,
}) => {
  const navigate = useNavigate();
  const { mutateAsync: createSale, isPending: isCreatingSale } =
    useSaleCreate();
  const { mutateAsync: finishedCommand, isPending: isFinishedCommand } =
    useFinishedCommand();
  const { data: paymentMethods = [] } = usePaymentMethods();
  const { abrirRecibo, ReciboComponent } = useReciboVenda(clearCart);
  const queryClient = useQueryClient();

  const [form] = Form.useForm();
  const [selectedMethod, setSelectedMethod] =
    useState<PaymentMethod.Props | null>(null);
  const { pagamentos, carrinho, clienteSelecionado, desconto, acrescimo } =
    salesSession;

  const emptyCart = carrinho.content?.length === 0 || carrinho === null;

  const totalPago = pagamentos?.reduce((acc, p) => acc + p.valor, 0) || 0;
  const valorRestante = total - totalPago;
  const troco = valorRestante < 0 ? Math.abs(valorRestante) : 0;

  const openPaymentModal = (method: PaymentMethod.Props) => {
    setSelectedMethod(method);
    form.setFieldsValue({
      valor: valorRestante > 0 ? valorRestante : total,
    });
  };

  const closePaymentModal = () => {
    setSelectedMethod(null);
    form.resetFields();
  };

  const pagamentoExist = (id: string) =>
    pagamentos?.some((p) => p.metodoDePagamentoId === id);

  const handleAddPayment = (values: { valor: number }) => {
    if (!selectedMethod) return;
    updateSaleSession({
      pagamentos: [
        ...pagamentos,
        {
          metodoDePagamentoId: selectedMethod.id,
          valor: Number(values.valor) || 0,
          installmentCount: 1,
        },
      ],
    });
    closePaymentModal();
  };

  const handleRemovePayment = (id: string) => {
    updateSaleSession({
      pagamentos: pagamentos.filter((p) => p.metodoDePagamentoId !== id),
    });
  };

  const handleInstallmentChange = (id: string) => {
    updateSaleSession({
      pagamentos: pagamentos.map((p) =>
        p.metodoDePagamentoId === id
          ? { ...p, installmentCount: (p.installmentCount || 1) + 1 }
          : p
      ),
    });
  };

  const handlePaymentMethodClick = (forma: PaymentMethod.Props) => {
    if (pagamentoExist(forma.id)) {
      if (!forma.isCash) {
        handleInstallmentChange(forma.id);
      }
    } else {
      openPaymentModal(forma);
    }
  };

  console.log("sale session", salesSession);

  const finalizeSale = async () => {
    if (emptyCart) {
      message.error("Carrinho vazio!");
      return;
    }
    if (pagamentos?.length === 0) {
      message.error("Adicione ao menos uma forma de pagamento.");
      return;
    }

    const totalPago = pagamentos?.reduce((acc, p) => acc + p.valor, 0);
    if (totalPago < total) {
      message.error("O valor pago é menor que o total da venda.");
      return;
    }

    try {
      let payload: Partial<Sale.Props> = {
        clienteId: clienteSelecionado?.id,
        itens: carrinho.content.map(formatItem),
        troco,
        pagamentos,
        acrescimo,
        desconto,
      };

      if (salesSession.saleId) {
        const updateSale = await finishedCommand({
          id: salesSession.saleId,
          body: payload,
        });

        const completeSale = await queryClient.fetchQuery({
          queryKey: ["get-sale", updateSale.id],
          queryFn: () => getSale(updateSale.id),
        });

        console.log("complete sale", completeSale);
        abrirRecibo(completeSale);

        /*  abrirRecibo(updateSale); */

        navigate(".", { replace: true });
        /* clearCart(); */
      } else {
        const newSale = await createSale(payload);
        const completeSale = await queryClient.fetchQuery({
          queryKey: ["get-sale", newSale.id],
          queryFn: () => getSale(newSale.id),
        });
        abrirRecibo(completeSale);
      }
    } catch (error: any) {
      console.error(error.message || "Erro ao finalizar a venda.");
    }
  };

  const changeToSale = () => {
    updateSaleSession({ carrinho: { ...carrinho, mode: "sale" } });
  };

  return (
    <div className="space-y-4">
      <Button icon={<ArrowLeft size={14} />} onClick={changeToSale}>
        Voltar para o carrinho
      </Button>

      <Card>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <Text type="secondary">Total a Pagar</Text>
            <Title level={4} className="!mt-1">
              {formatCurrency(total)}
            </Title>
          </div>
          <div>
            <Text type="secondary">Valor Restante</Text>
            <Title
              level={4}
              className="!mt-1"
              type={valorRestante > 0 ? "danger" : "success"}
            >
              {formatCurrency(valorRestante > 0 ? valorRestante : 0)}
            </Title>
          </div>
          <div>
            <Text type="secondary">Troco</Text>
            <Title level={4} className="!mt-1">
              {formatCurrency(troco)}
            </Title>
          </div>
        </div>
        <Progress
          percent={total > 0 ? (totalPago / total) * 100 : 0}
          showInfo={false}
          status={valorRestante > 0 ? "active" : "success"}
        />
      </Card>

      {pagamentos?.length > 0 && (
        <List
          header={<Text strong>Pagamentos Adicionados</Text>}
          dataSource={pagamentos}
          renderItem={(pagamento) => {
            const method = paymentMethods?.find(
              (f) => f.id === pagamento.metodoDePagamentoId
            );
            return (
              <List.Item
                actions={[
                  <Button
                    type="text"
                    danger
                    icon={<MinusCircle size={14} />}
                    onClick={() =>
                      handleRemovePayment(pagamento.metodoDePagamentoId)
                    }
                  />,
                ]}
              >
                <List.Item.Meta
                  title={method?.nome}
                  description={
                    pagamento.installmentCount > 1 &&
                    `${pagamento.installmentCount}x de ${formatCurrency(
                      pagamento.valor / pagamento.installmentCount
                    )}`
                  }
                />
                <Text strong>{formatCurrency(pagamento.valor)}</Text>
              </List.Item>
            );
          }}
        />
      )}

      <Divider>Selecione a forma de pagamento</Divider>

      <List
        dataSource={paymentMethods}
        grid={{ gutter: 16, xs: 2, sm: 2, md: 3, lg: 3, xl: 3, xxl: 3 }}
        renderItem={(forma) => {
          const method = pagamentos?.find(
            (f) => f.metodoDePagamentoId === forma.id
          );
          const isAdded = pagamentoExist(forma.id);
          return (
            <List.Item key={forma.id}>
              <Badge.Ribbon
                text={`${method?.installmentCount} x Adicionado`}
                className={isAdded ? "" : "hidden"}
              >
                <CardWithDisabled
                  disabled={pagamentoExist(forma.id) && forma.isCash}
                  hoverable
                  onClick={() => handlePaymentMethodClick(forma)}
                >
                  <Text strong>{forma.nome}</Text>
                </CardWithDisabled>
              </Badge.Ribbon>
            </List.Item>
          );
        }}
      />

      <Button
        type="primary"
        block
        size="large"
        icon={<Receipt size={14} />}
        onClick={finalizeSale}
        disabled={valorRestante > 0 || isCreatingSale}
      >
        Finalizar Venda
      </Button>

      <Modal
        title={`Adicionar ${selectedMethod?.nome}`}
        open={!!selectedMethod}
        onCancel={closePaymentModal}
        onOk={() => form.submit()}
        okText="Confirmar"
        width={400}
        centered
      >
        <Form form={form} onFinish={handleAddPayment} layout="vertical">
          <Form.Item
            name="valor"
            label="Valor a ser pago"
            rules={[{ required: true, message: "O valor é obrigatório." }]}
          >
            <CurrencyInput size="large" style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
      <ReciboComponent />
    </div>
  );
};
