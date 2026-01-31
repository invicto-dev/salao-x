import { formatCurrency } from "@/utils/formatCurrency";
import { ColumnDef } from "@tanstack/react-table";
import { CircleArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const columnsCaixa = (
  gerenciarCaixa: (caixa: any) => void
): ColumnDef<any>[] => [
  {
    accessorKey: "dataAbertura",
    header: "Data Abertura",
    cell: ({ row }) => (
      <div className="font-medium">
        {new Date(row.original.dataAbertura).toLocaleString("pt-BR")}
      </div>
    ),
  },
  {
    accessorKey: "dataFechamento",
    header: "Data Fechamento",
    cell: ({ row }) => (
      <div className="font-medium text-muted-foreground">
        {row.original.dataFechamento
          ? new Date(row.original.dataFechamento).toLocaleString("pt-BR")
          : "-"}
      </div>
    ),
  },
  {
    accessorKey: "valorAbertura",
    header: "Abertura",
    cell: ({ row }) => formatCurrency(row.original.valorAbertura),
  },
  {
    accessorKey: "valorFechamentoInformado",
    header: "Fechamento Inf.",
    cell: ({ row }) => row.original.valorFechamentoInformado
      ? formatCurrency(row.original.valorFechamentoInformado)
      : "-",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge
          variant={status === "ABERTO" ? "outline" : "secondary"}
          className={status === "ABERTO" ? "text-emerald-600 border-emerald-600" : "text-destructive border-destructive"}
        >
          {status}
        </Badge>
      );
    },
  },
  {
    id: "acoes",
    header: "Ações",
    cell: ({ row }) => (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => gerenciarCaixa(row.original)}
      >
        <CircleArrowRight className="mr-2 h-4 w-4" />
        Ver Detalhes
      </Button>
    ),
  },
];
