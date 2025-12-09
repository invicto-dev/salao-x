import { useCustomers } from "@/hooks/use-customer";
import { useDebounce } from "@/hooks/use-debounce";
import { Avatar, Drawer, Input, List, Typography } from "antd";
import { Search } from "lucide-react";
import { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (customer: Customer.Props) => void;
}

const { Title } = Typography;

export default function SelectCustomerDrawer({
  open,
  onClose,
  onSelect,
}: Props) {
  const [params, setParams] = useState<Params>({});
  const { data: customers = [] } = useCustomers({
    search: useDebounce(params.search),
  });

  const handleSelect = (customer: Customer.Props) => {
    onSelect(customer);
    onClose();
  };

  return (
    <Drawer
      title={
        <Input
          className="font-normal"
          allowClear
          placeholder="Buscar pelo nome, telefone ou CPF/CNPJ..."
          prefix={<Search size={14} />}
          onChange={(e) => setParams({ ...params, search: e.target.value })}
        />
      }
      closeIcon={null}
      open={open}
      onClose={onClose}
      footer={null}
    >
      <List
        dataSource={customers}
        renderItem={(customer) => (
          <List.Item
            onClick={() => handleSelect(customer)}
            className="cursor-pointer"
          >
            <List.Item.Meta
              avatar={
                <Avatar className="mt-2">{customer.nome.charAt(0)}</Avatar>
              }
              title={<Title level={5}>{customer.nome}</Title>}
              description={customer.cpfCnpj || "-"}
            />
          </List.Item>
        )}
        locale={{
          emptyText: "Nenhum cliente encontrado",
        }}
      />
    </Drawer>
  );
}
