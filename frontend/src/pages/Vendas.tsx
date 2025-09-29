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
  Row,
  Col,
  TableColumnProps,
  Divider,
  Button,
} from "antd";
import { useSales, useSaleUpdateStatus } from "@/hooks/use-sales";
import { Ban, Receipt, Search } from "lucide-react";
import { useReciboVenda } from "@/hooks/use-recibo-venda";
import { formatCurrency } from "@/utils/formatCurrency";
import DropdownComponent from "@/components/Dropdown";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

type Venda = ReturnType<typeof useSales>["data"][0];

const Vendas = () => {
  const { data: vendas, isLoading } = useSales();
  const { mutate: update } = useSaleUpdateStatus();

  const [buscaCliente, setBuscaCliente] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string | null>(null);
  const [filtroData, setFiltroData] = useState<[any, any] | null>(null);

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

  // Memoizando os dados filtrados para melhor performance
  const vendasFiltradas = useMemo(() => {
    if (!vendas) return [];

    return vendas.filter((venda) => {
      // Filtro por nome do cliente
      const matchCliente =
        !buscaCliente ||
        venda.cliente?.nome.toLowerCase().includes(buscaCliente.toLowerCase());

      // Filtro por status
      const matchStatus = !filtroStatus || venda.status === filtroStatus;

      // Filtro por data
      const matchData =
        !filtroData ||
        (new Date(venda.createdAt) >= filtroData[0].startOf("day").toDate() &&
          new Date(venda.createdAt) <= filtroData[1].endOf("day").toDate());

      return matchCliente && matchStatus && matchData;
    });
  }, [vendas, buscaCliente, filtroStatus, filtroData]);

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

  return (
    <div className="space-y-6">
      <div>
        <Title level={2} className="!mb-2">
          Histórico de Vendas
        </Title>
        <p className="text-muted-foreground">
          Gerencie e consulte todas as vendas registradas no sistema.
        </p>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Input
            placeholder="Buscar por cliente..."
            prefix={<Search size={14} />}
            value={buscaCliente}
            onChange={(e) => setBuscaCliente(e.target.value)}
            className="flex-1"
          />
          <div className="flex gap-4">
            <Select
              placeholder="Filtrar por status"
              allowClear
              onChange={(value) => setFiltroStatus(value)}
              className="w-full md:w-48"
            >
              <Select.Option value="PAGO">Pago</Select.Option>
              <Select.Option value="PENDENTE">Pendente</Select.Option>
              <Select.Option value="CANCELADO">Cancelado</Select.Option>
            </Select>
            <RangePicker
              placeholder={["Data de início", "Data de fim"]}
              onChange={(dates) => setFiltroData(dates as any)}
              className="w-full md:w-auto"
            />
          </div>
        </div>
        <Table
          dataSource={vendasFiltradas}
          columns={columns}
          loading={isLoading}
          rowKey="id"
          onRow={(record) => ({
            onClick: () => setVendaSelecionada(record),
          })}
          rowClassName={() => "cursor-pointer"}
          pagination={{ pageSize: 10 }}
          locale={{
            emptyText:
              vendasFiltradas.length === 0
                ? "Nenhuma venda encontrada"
                : "Nenhuma venda para mostrar",
          }}
        />
      </Card>

      {/* Drawer para exibir detalhes da venda */}
      <Drawer
        title={`Detalhes da Venda #${vendaSelecionada?.id.substring(0, 8)}`}
        width={500}
        onClose={() => setVendaSelecionada(null)}
        open={!!vendaSelecionada}
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
              <Descriptions.Item label="(+) Acréscimo">
                <span>{formatCurrency(vendaSelecionada.acrescimo)}</span>
              </Descriptions.Item>
              <Descriptions.Item label="(-) Desconto">
                <span>{formatCurrency(vendaSelecionada.desconto)}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Total da Venda">
                <span className="font-bold">
                  {formatCurrency(vendaSelecionada.total)}
                </span>
              </Descriptions.Item>
            </Descriptions>

            <div>
              <Title level={5}>Itens Vendidos</Title>
              <List
                dataSource={vendaSelecionada.itens}
                renderItem={(item) => (
                  <List.Item>
                    <Row justify="space-between" className="w-full">
                      <Col>
                        <Row>
                          <Text
                            ellipsis={{
                              tooltip:
                                item.produto?.nome ||
                                item.servico?.nome ||
                                "item deletado",
                            }}
                          >
                            {item.quantidade} x{" "}
                            {item.produto?.nome ||
                              item.servico?.nome ||
                              "Item Deletado"}
                          </Text>
                        </Row>
                        <Row className="text-xs text-muted-foreground">
                          {formatCurrency(item.preco)}
                        </Row>
                      </Col>
                      <Col>{formatCurrency(item.subtotal)}</Col>
                    </Row>
                  </List.Item>
                )}
                size="small"
              />
            </div>

            <div>
              <Title level={5}>Pagamentos</Title>
              <List
                dataSource={vendaSelecionada.pagamentos}
                renderItem={(pagamento) => (
                  <List.Item>
                    <Row justify="space-between" className="w-full">
                      <Col>{pagamento.metodoDePagamento.nome}</Col>
                      <Col>
                        {Number(pagamento.valor).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </Col>
                    </Row>
                  </List.Item>
                )}
                size="small"
              />
              <Divider />
              <div className="mx-4">
                <Row justify="space-between" className="w-full">
                  <Col>Troco</Col>
                  <Col>
                    {Number(vendaSelecionada.troco).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </Col>
                </Row>
              </div>
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

      {/* Recibo de Venda Modal */}
      <ReciboComponent />
    </div>
  );
};

export default Vendas;
