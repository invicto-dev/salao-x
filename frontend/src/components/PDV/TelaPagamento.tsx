import {
  Button,
  Card,
  Divider,
  List,
  Modal,
  Progress,
  Typography,
  Form,
  Space,
} from "antd";
import { ArrowLeft, CheckCircle, MinusCircle, Receipt } from "lucide-react";
import React, { useState } from "react";
import { CurrencyInput } from "../inputs/CurrencyInput";
import { formatCurrency } from "@/utils/formatCurrency";

const { Title, Text } = Typography;

interface TelaPagamentoProps {
  totalAPagar: number;
  formasDePagamento: PaymentMethod.Props[];
  pagamentos: Sale.Props["pagamentos"];
  setPagamentos: (pagamentos: Sale.Props["pagamentos"]) => void;
  onFinalizar: (troco: number) => void;
  onVoltar: () => void;
  loading: boolean;
}

export const TelaPagamento: React.FC<TelaPagamentoProps> = ({
  totalAPagar,
  formasDePagamento,
  pagamentos,
  setPagamentos,
  onFinalizar,
  onVoltar,
  loading,
}) => {
  const [form] = Form.useForm();
  const [selectedMethod, setSelectedMethod] =
    useState<PaymentMethod.Props | null>(null);

  const totalPago = pagamentos.reduce((acc, p) => acc + p.valor, 0) || 0;
  const valorRestante = totalAPagar - totalPago;
  const troco = valorRestante < 0 ? Math.abs(valorRestante) : 0;

  const openPaymentModal = (method: PaymentMethod.Props) => {
    setSelectedMethod(method);
    form.setFieldsValue({
      valor: valorRestante > 0 ? valorRestante : totalAPagar,
    });
  };

  const closePaymentModal = () => {
    setSelectedMethod(null);
    form.resetFields();
  };

  const pagamentoExist = (id: string) =>
    pagamentos.some((p) => p.metodoDePagamentoId === id);

  const handleAddPayment = (values: { valor: number }) => {
    if (!selectedMethod) return;
    setPagamentos([
      ...pagamentos,
      {
        metodoDePagamentoId: selectedMethod.id,
        valor: Number(values.valor) || 0,
        installmentCount: 1,
      },
    ]);
    closePaymentModal();
  };

  const handleRemovePayment = (id: string) => {
    setPagamentos(pagamentos.filter((p) => p.metodoDePagamentoId !== id));
  };

  const handleInstallmentChange = (id: string) => {
    setPagamentos(
      pagamentos.map((p) =>
        p.metodoDePagamentoId === id
          ? { ...p, installmentCount: (p.installmentCount || 1) + 1 }
          : p
      )
    );
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

  return (
    <div className="space-y-4">
      <Button icon={<ArrowLeft size={14} />} onClick={onVoltar}>
        Voltar para o carrinho
      </Button>

      <Card>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <Text type="secondary">Total a Pagar</Text>
            <Title level={4} className="!mt-1">
              {formatCurrency(totalAPagar)}
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
          percent={totalAPagar > 0 ? (totalPago / totalAPagar) * 100 : 0}
          showInfo={false}
          status={valorRestante > 0 ? "active" : "success"}
        />
      </Card>

      {pagamentos.length > 0 && (
        <List
          header={<Text strong>Pagamentos Adicionados</Text>}
          bordered
          dataSource={pagamentos}
          renderItem={(pagamento) => {
            const method = formasDePagamento.find(
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
        dataSource={formasDePagamento.sort((a, b) =>
          a.nome.localeCompare(b.nome)
        )}
        grid={{ gutter: 16, xs: 2, sm: 2, md: 3, lg: 3, xl: 3, xxl: 3 }}
        renderItem={(forma) => {
          const isAdded = pagamentoExist(forma.id);
          const disableCash = forma.isCash && isAdded;
          return (
            <List.Item key={forma.id}>
              <Card
                className={`${disableCash ? "cursor-not-allowed" : ""}`}
                hoverable
                onClick={() => handlePaymentMethodClick(forma)}
              >
                <Space>
                  {isAdded && <CheckCircle size={14} />}
                  <Text
                    disabled={pagamentoExist(forma.id) && forma.isCash}
                    strong
                  >
                    {forma.nome}
                  </Text>
                </Space>
              </Card>
            </List.Item>
          );
        }}
      />

      <Button
        type="primary"
        block
        size="large"
        icon={<Receipt size={14} />}
        onClick={() => onFinalizar(troco)}
        disabled={valorRestante > 0 || loading}
        loading={loading}
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
    </div>
  );
};
