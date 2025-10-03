import DropdownComponent from "@/components/Dropdown";
import { formatCurrency } from "@/utils/formatCurrency";
import { TableColumnProps, Tag } from "antd";
import { Package, Edit, Trash2 } from "lucide-react";

export const productColumns = (
  editarProduto: (product: Product.Props) => void,
  excluirProduto: (product: Product.Props) => void
): TableColumnProps<Product.Props>[] => [
  {
    title: "Produto",
    key: "produto",
    render: (_, record) => (
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
          <Package size={20} className="text-muted-foreground" />
        </div>
        <div>
          <div className="font-medium">{record.nome}</div>
          <div className="text-sm text-muted-foreground">
            {record.codigo || "Sem código"} •{" "}
            {record.categoria || "Sem categoria"}
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Preços",
    key: "precos",
    render: (_, record) => (
      <div>
        <div className="font-semibold text-salao-primary">
          {formatCurrency(record.preco)}
        </div>
        {record.valorEmAberto && (
          <div className="text-sm text-muted-foreground">Valor em aberto</div>
        )}
        {record.custo && record.custo > 0 && (
          <div className="text-sm text-muted-foreground">
            Custo: {formatCurrency(record.custo)}
          </div>
        )}

        {!record.valorEmAberto &&
          record.custo &&
          record.custo > 0 &&
          record.preco && (
            <div className="text-xs text-salao-success">{`Margem: ${(
              ((record.preco - record.custo) / record.custo) *
              100
            ).toFixed(2)} %`}</div>
          )}
      </div>
    ),
  },
  {
    title: "Estoque",
    dataIndex: "estoqueAtual",
    key: "estoque",
    render: (estoqueAtual: number, record) =>
      record.contarEstoque ? (
        <Tag
          color={
            estoqueAtual > 10 ? "green" : estoqueAtual > 0 ? "orange" : "red"
          }
        >
          {estoqueAtual} un
        </Tag>
      ) : (
        <div className="text-sm text-muted-foreground">Não habilitado</div>
      ),
  },
  {
    title: "Status",
    dataIndex: "ativo",
    key: "ativo",
    align: "center",
    render: (ativo: boolean) => (
      <Tag color={ativo ? "green" : "red"}>{ativo ? "Ativo" : "Inativo"}</Tag>
    ),
  },
  {
    title: "Ações",
    key: "acoes",
    align: "center",
    render: (_, record) => (
      <DropdownComponent
        menu={{
          items: [
            {
              key: "editar",
              icon: <Edit size={14} />,
              label: "Editar",
              onClick: () => editarProduto(record),
            },
            {
              key: "excluir",
              icon: <Trash2 size={14} />,
              label: "Excluir",
              onClick: () => excluirProduto(record),
            },
          ],
        }}
      />
    ),
  },
];
