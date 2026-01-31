import DropdownComponent from "@/components/Dropdown";
import { formatCurrency } from "@/utils/formatCurrency";
import { ColumnDef } from "@tanstack/react-table";
import { Package, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const productColumns = (
  editarProduto: (product: any) => void,
  excluirProduto: (product: any) => void
): ColumnDef<any>[] => [
  {
    accessorKey: "nome",
    header: "Produto",
    cell: ({ row }) => {
      const record = row.original;
      return (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
            <Package size={18} className="text-muted-foreground" />
          </div>
          <div>
            <div className="font-medium">{record.nome}</div>
            <div className="text-xs text-muted-foreground">
              {record.codigo || "Sem código"} •{" "}
              {record.categoria?.nome || record.categoria || "Sem categoria"}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    id: "precos",
    header: "Preços",
    cell: ({ row }) => {
      const record = row.original;
      return (
        <div className="space-y-0.5">
          <div className="font-semibold text-primary">
            {formatCurrency(record.preco)}
          </div>
          {record.valorEmAberto && (
            <div className="text-xs text-muted-foreground italic">Valor em aberto</div>
          )}
          {record.custo && record.custo > 0 && (
            <div className="text-xs text-muted-foreground">
              Custo: {formatCurrency(record.custo)}
            </div>
          )}
          {!record.valorEmAberto &&
            record.custo &&
            record.custo > 0 &&
            record.preco && (
              <div className="text-[10px] text-emerald-600 font-medium">{`Margem: ${(
                ((record.preco - record.custo) / record.custo) *
                100
              ).toFixed(2)} %`}</div>
            )}
        </div>
      );
    },
  },
  {
    accessorKey: "estoqueAtual",
    header: "Estoque",
    cell: ({ row }) => {
      const record = row.original;
      const estoqueAtual = record.estoqueAtual;
      if (!record.contarEstoque) {
        return <span className="text-xs text-muted-foreground">Desabilitado</span>;
      }

      let variant: "default" | "outline" | "destructive" | "secondary" = "default";
      let className = "";

      if (estoqueAtual > 10) {
        className = "bg-emerald-500 hover:bg-emerald-600";
      } else if (estoqueAtual > 0) {
        className = "bg-amber-500 hover:bg-amber-600";
      } else {
        variant = "destructive";
      }

      return (
        <Badge variant={variant} className={className}>
          {estoqueAtual} un
        </Badge>
      );
    },
  },
  {
    accessorKey: "ativo",
    header: "Status",
    cell: ({ row }) => {
      const ativo = row.original.ativo;
      return (
        <Badge variant={ativo ? "outline" : "secondary"} className={ativo ? "text-emerald-600 border-emerald-600" : ""}>
          {ativo ? "Ativo" : "Inativo"}
        </Badge>
      );
    },
  },
  {
    id: "acoes",
    header: "Ações",
    cell: ({ row }) => {
      const record = row.original;
      return (
        <div className="flex justify-center">
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
                  danger: true,
                },
              ],
            }}
          />
        </div>
      );
    },
  },
];
