import PagesLayout from "@/components/layout/PagesLayout";
import { useDebounce } from "@/hooks/use-debounce";
import { useSales } from "@/hooks/use-sales";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDateTime } from "@/utils/formatDateTime";
import { formatSaleId } from "@/utils/formatSaleId";
import {
  Button,
  Card,
  Descriptions,
  Divider,
  Drawer,
  Input,
  List,
  Typography,
} from "antd";
import { ClipboardCopy, Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface DrawerProps {
  open: boolean;
  sale: Sale.Props | null;
}

const { Title, Text } = Typography;

const Comandas = () => {
  const navigate = useNavigate();
  const [params, setParams] = useState<Params>({});
  const [drawer, setDrawer] = useState<DrawerProps>({
    open: false,
    sale: null,
  });
  const {
    data: sales = [],
    isLoading,
    isError,
    refetch,
  } = useSales({
    search: useDebounce(params.search),
    status: "PENDENTE",
  });

  const filters = [
    {
      element: (
        <Input
          placeholder="Buscar comanda por cliente ou ID..."
          prefix={<Search size={14} />}
          onChange={(e) => setParams({ ...params, search: e.target.value })}
          allowClear
        />
      ),
    },
  ];

  const descriptions = [
    {
      label: "Cliente",
      children: drawer.sale?.cliente?.nome || "Consumidor Final",
    },
    {
      label: "Data da Venda",
      children: formatDateTime(drawer.sale?.createdAt),
    },
    {
      label: "Sub-total",
      children: formatCurrency(drawer.sale?.subtotal),
    },
    {
      label: "Total",
      children: formatCurrency(drawer.sale?.total),
    },
  ];

  const navigateToPdv = (id: string) => {
    navigate({
      pathname: "/pdv",
      search: `?pedido=${id}`,
    });
  };

  return (
    <PagesLayout
      title="Comandas"
      subtitle="Gerencie todas as vendas em aberto no sistema."
      filters={filters}
      Error={{
        isError: isError,
        onClick: refetch,
      }}
    >
      <List
        grid={{
          gutter: 16,
          xs: 1,
          sm: 2,
          md: 2,
          lg: 4,
          xl: 4,
          xxl: 5,
        }}
        locale={{ emptyText: "Nenhuma comanda encontrada" }}
        dataSource={sales}
        loading={isLoading}
        renderItem={(sale) => (
          <List.Item>
            <Card hoverable onClick={() => setDrawer({ open: true, sale })}>
              <div className="flex text-center justify-center w-full">
                <div className="flex flex-col">
                  <Title className="!m-2" level={4}>
                    {formatSaleId(sale.id)}
                  </Title>
                  <Text type="secondary" className="text-xs ">
                    {sale.cliente?.nome || "Consumidor Final"}
                  </Text>
                  <Title className="!mb-2" level={3}>
                    {formatCurrency(sale.total)}
                  </Title>
                  <Text type="secondary" className="text-xs ">
                    {formatDateTime(sale.updatedAt)}
                  </Text>
                </div>
              </div>
            </Card>
          </List.Item>
        )}
      />
      <Drawer
        title={`Detalhes do pedido ${formatSaleId(drawer.sale?.id)}`}
        open={drawer.open}
        onClose={() => setDrawer({ ...drawer, open: false })}
        width={450}
      >
        <div className="space-y-4">
          <Descriptions size="small" column={1} bordered items={descriptions} />
          <List
            header={<Text strong>Itens do Pedido</Text>}
            size="small"
            dataSource={drawer.sale?.itens}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  title={`${item.quantidade} x ${
                    item.produto?.nome || item.servico?.nome || "Item deletado"
                  }`}
                  description={formatCurrency(item.preco)}
                />
                <div>{formatCurrency(item.subtotal)}</div>
              </List.Item>
            )}
          />

          <Button
            onClick={() => navigateToPdv(drawer.sale.id)}
            icon={<ClipboardCopy size={14} />}
            type="primary"
            block
          >
            Resgatar Pedido
          </Button>
        </div>
      </Drawer>
    </PagesLayout>
  );
};

export default Comandas;
