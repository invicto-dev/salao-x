import { useState, useMemo } from "react";
import {
  Typography,
  Card,
  Table,
  Input,
  Select,
  DatePicker,
  Tag,
  Modal,
  Drawer,
  Descriptions,
  List,
  TableColumnProps,
  Button,
} from "antd";
import { useSales, useSaleUpdateStatus } from "@/hooks/use-sales";
import { Ban, DollarSign, Edit, Receipt, Search, Trash2 } from "lucide-react";
import { useReciboVenda } from "@/hooks/use-recibo-venda";
import { formatCurrency } from "@/utils/formatCurrency";
import DropdownComponent from "@/components/Dropdown";
import { formatSaleId } from "@/utils/formatSaleId";
import PagesLayout from "@/components/layout/PagesLayout";
import { useDebounce } from "@/hooks/use-debounce";
import { ResponsiveTable } from "@/components/tables/ResponsiveTable";
import { formatDateTime } from "@/utils/formatDateTime";

const { Title, Text } = Typography;

type Venda = ReturnType<typeof useSales>["data"][0];

const Vendas = () => {
  const [params, setParams] = useState<Params>({});
  const {
    data: vendas = [],
    isLoading,
    isError,
    refetch,
  } = useSales({
    ...params,
    search: useDebounce(params.search),
  });
  const { mutate: update } = useSaleUpdateStatus();

  const [vendaSelecionada, setVendaSelecionada] = useState<Venda | null>(null);

  const { ReciboComponent, abrirRecibo } = useReciboVenda();

  const handleCancelarVenda = (vendaId: string) => {
    update({
      id: vendaId,
      body: {
        status: "CANCELADO",
      },
    });
  };

  const showModalCancelamento = (venda: Venda) => {
    Modal.confirm({
      title: "Confirmar Cancelamento",
      content: `Você tem certeza que deseja cancelar a venda #${venda.id.substring(
        0,
        8
      )}? Esta ação não pode ser desfeita.`,
      okText: "Sim, Cancelar",
      okButtonProps: { danger: true },
      cancelText: "Não",
      onOk: () => {
        handleCancelarVenda(venda.id);
        setVendaSelecionada(null);
      },
    });
  };

  // Função para mapear status para cor da Tag
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAGO":
        return "green";
      case "PENDENTE":
        return "orange";
      case "CANCELADO":
        return "red";
      default:
        return "default";
    }
  };

  const columns: TableColumnProps<Venda>[] = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      className: "font-bold",
      render: (id) => formatSaleId(id),
    },
    {
      title: "Data/Hora",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text: string) => new Date(text).toLocaleString("pt-BR"),
    },
    {
      title: "Cliente",
      dataIndex: "cliente",
      key: "cliente",
      render: (cliente: Venda["cliente"]) =>
        cliente?.nome || "Consumidor Final",
    },

    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      render: (total: string) =>
        Number(total).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        }),
    },
    {
      title: "Status",
      dataIndex: "status",
      align: "center",
      key: "status",
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },
    {
      title: "Ações",
      key: "acoes",
      align: "center" as const,
      render: (_: any, record: Venda) => (
        <DropdownComponent
          menu={{
            items: [
              {
                key: "1",
                label: "Imprimir Recibo",
                icon: <Receipt size={14} />,
                onClick: (e) => {
                  e.domEvent.stopPropagation();
                  abrirRecibo(record);
                },
              },
              {
                key: "2",
                label: "Cancelar Venda",
                icon: <Ban size={14} />,
                onClick: (e) => {
                  e.domEvent.stopPropagation();
                  showModalCancelamento(record);
                },
              },
            ],
          }}
        />
      ),
    },
  ];

  const filters = [
    {
      element: (
        <Input
          placeholder="Buscar venda por cliente ou ID..."
          prefix={<Search size={14} />}
          value={params.search}
          onChange={(e) => setParams({ ...params, search: e.target.value })}
          allowClear
        />
      ),
    },
    {
      element: (
        <Select
          placeholder="Filtrar por status"
          allowClear
          onChange={(value) => setParams({ ...params, status: value })}
          className="w-full md:w-48"
        >
          <Select.Option value="PAGO">Pago</Select.Option>
          <Select.Option value="PENDENTE">Pendente</Select.Option>
          <Select.Option value="CANCELADO">Cancelado</Select.Option>
        </Select>
      ),
    },
  ];

  return (
    <PagesLayout
      title="Histórico de Vendas"
      subtitle="Gerencie e consulte todas as vendas registradas no sistema."
      filters={filters}
      Error={{
        isError: isError,
        onClick: refetch,
      }}
    >
      <ResponsiveTable
        dataSource={vendas}
        columns={columns}
        loading={isLoading}
        onRow={(record) => ({
          onClick: () => setVendaSelecionada(record),
        })}
        rowClassName={() => "cursor-pointer"}
        locale={{
          emptyText:
            vendas.length === 0
              ? "Nenhuma venda encontrada"
              : "Nenhuma venda para mostrar",
        }}
        renderItem={(item) => (
          <List.Item onClick={() => setVendaSelecionada(item)}>
            <List.Item.Meta
              title={item.cliente?.nome || "Consumidor Final"}
              description={`${formatSaleId(item.id)} - ${formatDateTime(
                item.createdAt
              )}`}
            />
            <DropdownComponent
              menu={{
                items: [
                  {
                    key: "1",
                    label: "Imprimir Recibo",
                    icon: <Receipt size={14} />,
                    onClick: (e) => {
                      e.domEvent.stopPropagation();
                      abrirRecibo(item);
                    },
                  },
                  {
                    key: "2",
                    label: "Cancelar Venda",
                    icon: <Ban size={14} />,
                    onClick: (e) => {
                      e.domEvent.stopPropagation();
                      showModalCancelamento(item);
                    },
                  },
                ],
              }}
            />
          </List.Item>
        )}
      />

      <Drawer
        title={`Detalhes da Venda ${formatSaleId(vendaSelecionada?.id)}`}
        onClose={() => setVendaSelecionada(null)}
        open={!!vendaSelecionada}
        width={450}
      >
        {vendaSelecionada && (
          <div className="space-y-6">
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Cliente">
                {vendaSelecionada.cliente?.nome || "Consumidor Final"}
              </Descriptions.Item>
              <Descriptions.Item label="Data da Venda">
                {new Date(vendaSelecionada.createdAt).toLocaleString("pt-BR")}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={getStatusColor(vendaSelecionada.status)}>
                  {vendaSelecionada.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Subtotal da Venda">
                <span>{formatCurrency(vendaSelecionada.subtotal)}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Total da Venda">
                <span className="font-bold">
                  {formatCurrency(vendaSelecionada.total)}
                </span>
              </Descriptions.Item>
            </Descriptions>

            <div>
              <List
                header={<Text strong>Itens Vendidos</Text>}
                dataSource={vendaSelecionada.itens}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={`${item.quantidade} x ${
                        item.nome || "Item deletado"
                      }`}
                      description={formatCurrency(item.preco)}
                    />
                    <div>{formatCurrency(item.subtotal)}</div>
                  </List.Item>
                )}
                size="small"
              />
            </div>

            <div>
              <List
                header={<Text strong>Pagamentos Adicionados</Text>}
                dataSource={vendaSelecionada.pagamentos}
                locale={{ emptyText: "Nenhum pagamento informado." }}
                renderItem={(pagamento) => (
                  <List.Item>
                    <List.Item.Meta
                      title={pagamento.metodoDePagamento.nome}
                      description={
                        pagamento.metodoDePagamento.isCash &&
                        vendaSelecionada.troco > 0 ? (
                          <Typography className="text-xs">{`Troco: ${formatCurrency(
                            vendaSelecionada.troco
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
                            {pagamento.externalChargeUrl && (
                              <Typography.Link
                                href={pagamento.externalChargeUrl}
                                target="_blank"
                              >
                                {pagamento.externalChargeUrl}
                              </Typography.Link>
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
            <div className="space-y-2">
              <Button
                onClick={() => abrirRecibo(vendaSelecionada)}
                icon={<Receipt size={14} />}
                block
              >
                Imprimir Recibo
              </Button>
              {vendaSelecionada.status !== "CANCELADO" && (
                <Button
                  onClick={() => showModalCancelamento(vendaSelecionada)}
                  icon={<Ban size={14} />}
                  block
                  danger
                >
                  Cancelar Venda
                </Button>
              )}
            </div>
          </div>
        )}
      </Drawer>

      <ReciboComponent />
    </PagesLayout>
  );
};

export default Vendas;
