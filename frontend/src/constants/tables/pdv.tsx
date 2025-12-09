import { formatCurrency } from "@/utils/formatCurrency";
import { Button, InputNumber, TableColumnProps, Typography } from "antd";
import { Minus, Plus, Trash2 } from "lucide-react";

const { Text } = Typography;

export const carrinhoColumns = (
  alterarQuantidade,
  removeFromCart
): TableColumnProps<Sale.CartItem>[] => [
  {
    title: "Item",
    dataIndex: "nome",
    key: "nome",
    width: "30%",
    render: (text: string) => (
      <Text ellipsis={{ tooltip: text }} className="font-medium">
        {text}
      </Text>
    ),
  },
  {
    title: "Preço Unitário",
    dataIndex: "preco",
    key: "preco",
    align: "center",
    render: (preco: number) => formatCurrency(preco),
    ellipsis: true,
  },
  {
    title: "Qtd.",
    key: "quantidade",
    align: "center",
    render: (_, record, index) => (
      <>
        <Button
          size="small"
          type="text"
          icon={<Minus size={14} />}
          onClick={() =>
            record.quantidade > 1 &&
            alterarQuantidade(index, record.quantidade - 1)
          }
        />
        <InputNumber
          value={record?.quantidade}
          /* max={produtos.find((p) => p.id === record.id)?.estoqueAtual} */
          size="small"
          onChange={(value) => value && alterarQuantidade(index, value)}
          controls={false}
          min={1}
          className="w-11 text-center"
        />
        <Button
          size="small"
          type="text"
          icon={<Plus size={14} />}
          onClick={() => alterarQuantidade(index, record.quantidade + 1)}
        />
      </>
    ),
  },
  {
    title: "Total",
    key: "total",
    align: "end",
    render: (_, record) => (
      <span className="font-semibold">
        {formatCurrency(record.preco * record.quantidade)}
      </span>
    ),
  },
  {
    title: "Ações",
    key: "acoes",
    align: "center",
    render: (_, __, index) => (
      <Button
        type="text"
        icon={<Trash2 size={14} />}
        onClick={() => removeFromCart(index)}
      />
    ),
  },
];
