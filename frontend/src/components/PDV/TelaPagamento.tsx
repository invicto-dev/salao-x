import {
  Button,
  Card,
  Divider,
  InputNumber,
  List,
  Progress,
  Space,
  Typography,
} from "antd";
import { ArrowLeft, Receipt, X } from "lucide-react";
import React from "react";

const { Title, Text } = Typography;

interface TelaPagamentoProps {
  totalAPagar: number;
  formasDePagamento: PaymentMethod.Props[];
  pagamentos: Sale.Props["pagamentos"];
  setPagamentos: React.Dispatch<React.SetStateAction<Sale.Props["pagamentos"]>>;
  onFinalizar: (troco: number) => void;
  onVoltar: () => void;
}

export const TelaPagamento: React.FC<TelaPagamentoProps> = ({
  totalAPagar,
  formasDePagamento,
  pagamentos,
  setPagamentos,
  onFinalizar,
  onVoltar,
}) => {
  const totalPago = pagamentos.reduce((acc, p) => acc + p.valor, 0);
  const valorRestante = totalAPagar - totalPago;
  const troco = valorRestante < 0 ? Math.abs(valorRestante) : 0;

  // Função para adicionar ou atualizar um pagamento
  const handlePaymentChange = (id: string, valor: number | null) => {
    const valorNumerico = valor || 0;
    const pagamentoExistente = pagamentos.find(
      (p) => p.metodoDePagamentoId === id
    );

    if (pagamentoExistente) {
      if (valorNumerico <= 0) {
        setPagamentos(pagamentos.filter((p) => p.metodoDePagamentoId !== id));
      } else {
        setPagamentos(
          pagamentos.map((p) =>
            p.metodoDePagamentoId === id ? { ...p, valor: valorNumerico } : p
          )
        );
      }
    } else if (valorNumerico > 0) {
      setPagamentos([
        ...pagamentos,
        { metodoDePagamentoId: id, valor: valorNumerico },
      ]);
    }
  };

  return (
    <div className="space-y-4">
      <Space>
        <Button icon={<ArrowLeft size={14} />} onClick={onVoltar}>
          Voltar para o carrinho
        </Button>
      </Space>

      {/* Card com o resumo financeiro */}
      <Card>
        <div className="flex justify-between">
          <div>
            <Text type="secondary">Total a Pagar</Text>
            <Title level={4} className="!mt-1">
              R$ {totalAPagar.toFixed(2)}
            </Title>
          </div>
          {troco > 0 && (
            <div className="col-span-2">
              <Text type="secondary">Troco</Text>
              <Title level={4} className="!mt-1 text-salao-info">
                R$ {troco.toFixed(2)}
              </Title>
            </div>
          )}
          <div>
            <Text type="secondary">Valor Restante</Text>
            <Title
              level={4}
              className={`!mt-1 ${
                valorRestante > 0 ? "text-salao-danger" : "text-salao-success"
              }`}
            >
              R$ {valorRestante > 0 ? valorRestante.toFixed(2) : "0.00"}
            </Title>
          </div>
        </div>
        <Progress
          percent={totalAPagar > 0 ? (totalPago / totalAPagar) * 100 : 100}
          showInfo={false}
        />
      </Card>

      <Divider>Selecione a forma de pagamento</Divider>

      {/* Lista das formas de pagamento */}
      <List
        dataSource={formasDePagamento.sort((a, b) =>
          a.nome.localeCompare(b.nome)
        )}
        renderItem={(forma) => {
          const pagamentoAtual = pagamentos.find(
            (p) => p.metodoDePagamentoId === forma.id
          );
          return (
            <List.Item>
              <div className="w-full flex items-center justify-between gap-4">
                <Text className="font-medium flex-1">{forma.nome}</Text>
                <div className="flex items-center gap-2">
                  <InputNumber
                    min={0}
                    prefix={"R$"}
                    value={pagamentoAtual?.valor}
                    className="w-40"
                    onChange={(valor) => handlePaymentChange(forma.id, valor)}
                  />

                  <div className="w-8 h-8 flex items-center justify-center">
                    {pagamentoAtual && (
                      <Button
                        icon={<X size={14} />}
                        type="text"
                        danger
                        onClick={() => handlePaymentChange(forma.id, 0)}
                      />
                    )}
                  </div>
                </div>
              </div>
            </List.Item>
          );
        }}
      />

      <Button
        type="primary"
        block
        size="large"
        icon={<Receipt size={16} />}
        onClick={() => onFinalizar(troco)}
        disabled={valorRestante > 0}
      >
        Finalizar Venda
      </Button>
    </div>
  );
};
