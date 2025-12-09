// src/components/ReciboVenda.tsx
import { formatCurrency } from "@/utils/formatCurrency";
import { formatSaleId } from "@/utils/formatSaleId";
import { Modal, Button, Typography, Divider, Descriptions, List } from "antd";
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
      width={450}
    >
      <div id="recibo-content" className="space-y-4">
        <div className="text-center">
          <Title level={4} className="!mb-1">
            {nomeEmpresa}
          </Title>
          <p className="text-sm">Recibo de Venda</p>
          {venda.id && (
            <Text type="secondary" className="text-xs">
              {formatSaleId(venda.id)}
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

        <List
          dataSource={venda.itens}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                title={`${item.quantidade} x ${item.nome || "Item deletado"}`}
                description={formatCurrency(item.preco)}
              />
              <div>{formatCurrency(item.subtotal)}</div>
            </List.Item>
          )}
          size="small"
        />

        <Divider className="!my-2" />

        <div className="space-y-1 mx-4 text-sm">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{formatCurrency(venda.subtotal)}</span>
          </div>
          <div className="flex justify-between font-semibold text-base pt-1">
            <span>Total:</span>
            <span>{formatCurrency(venda.total)}</span>
          </div>
        </div>

        <Divider className="!my-2 !text-xs !font-semibold">PAGAMENTOS</Divider>

        <List
          dataSource={venda.pagamentos}
          locale={{ emptyText: "Nenhum pagamento informado." }}
          renderItem={(pagamento) => (
            <List.Item>
              <List.Item.Meta
                title={pagamento.metodoDePagamento.nome}
                description={
                  pagamento.metodoDePagamento.isCash && venda.troco > 0 ? (
                    <Typography className="text-xs">{`Troco: ${formatCurrency(
                      venda.troco
                    )}`}</Typography>
                  ) : (
                    <div>
                      {pagamento.installmentCount && (
                        <Typography className="text-xs">{`${
                          pagamento.installmentCount
                        } X ${formatCurrency(
                          pagamento.valor / pagamento.installmentCount
                        )}`}</Typography>
                      )}
                    </div>
                  )
                }
              />
              <div>{formatCurrency(pagamento.valor)}</div>
            </List.Item>
          )}
          size="small"
        />
      </div>

      <div className="text-center text-xs text-gray-500 pt-4">
        <p>Obrigado pela preferência!</p>
      </div>
    </Modal>
  );
};
