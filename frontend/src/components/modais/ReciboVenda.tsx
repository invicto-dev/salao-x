// src/components/ReciboVenda.tsx
import { formatCurrency } from "@/utils/formatCurrency";
import { Modal, Button, Typography, Divider, Descriptions } from "antd";
import { Printer } from "lucide-react";

const { Title, Text } = Typography;

interface ReciboVendaProps {
  venda: Sale.Props | null;
  open: boolean;
  onClose: () => void;
  nomeEmpresa?: string;
}

export const ReciboVenda = ({
  venda,
  open,
  onClose,
  nomeEmpresa = "Salão X",
}: ReciboVendaProps) => {
  if (!venda) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      title="Recibo de Venda"
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="print" icon={<Printer size={14} />} onClick={handlePrint}>
          Imprimir
        </Button>,
        <Button key="close" onClick={onClose}>
          Fechar
        </Button>,
      ]}
      width={400}
    >
      <div id="recibo-content" className="space-y-4">
        <div className="text-center">
          <Title level={4} className="!mb-1">
            {nomeEmpresa}
          </Title>
          <p className="text-sm">Recibo de Venda</p>
          {venda.id && (
            <Text type="secondary" className="text-xs">
              ID: {venda.id.substring(0, 8)}
            </Text>
          )}
        </div>

        <Divider className="!my-2" />

        <Descriptions column={1} size="small">
          <Descriptions.Item label="Cliente">
            {venda.cliente?.nome || "Consumidor Final"}
          </Descriptions.Item>
          <Descriptions.Item label="Data">
            {new Date(venda.createdAt).toLocaleString("pt-BR")}
          </Descriptions.Item>
        </Descriptions>

        <Divider className="!my-2 !text-xs !font-semibold">ITENS</Divider>

        <div className="space-y-1">
          {venda.itens.map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span className="break-words pr-2 truncate">
                {item.quantidade}x {item.produto?.nome || item.servico?.nome}
              </span>
              <span>{formatCurrency(item.subtotal)}</span>
            </div>
          ))}
        </div>

        <Divider className="!my-2" />

        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{formatCurrency(venda.subtotal)}</span>
          </div>
          {venda.acrescimo > 0 && (
            <div className="flex justify-between">
              <span>Acréscimo:</span>
              <span>+ {formatCurrency(venda.acrescimo)}</span>
            </div>
          )}
          {venda.desconto > 0 && (
            <div className="flex justify-between">
              <span>Desconto:</span>
              <span>- {formatCurrency(venda.desconto)}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold text-base pt-1">
            <span>Total:</span>
            <span>{formatCurrency(venda.total)}</span>
          </div>
        </div>

        <Divider className="!my-2 !text-xs !font-semibold">PAGAMENTOS</Divider>

        <div className="space-y-1 text-sm">
          {venda.pagamentos.map((p, index) => (
            <div key={index} className="flex justify-between">
              <span>{p.metodoDePagamento.nome}</span>
              <span>{formatCurrency(p.valor)}</span>
            </div>
          ))}
          <div className="flex justify-between">
            <span>Troco</span>
            <span>{formatCurrency(venda.troco)}</span>
          </div>
        </div>

        <div className="text-center text-xs text-gray-500 pt-4">
          <p>Obrigado pela preferência!</p>
        </div>
      </div>
    </Modal>
  );
};
