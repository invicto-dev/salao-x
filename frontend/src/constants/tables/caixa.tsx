import { formatCurrency } from "@/utils/formatCurrency";
import { Button, Space, TableColumnsType, Tag } from "antd";
import { CircleArrowRight } from "lucide-react";

export const columnsCaixa = (
  gerenciarCaixa: (caixa: Caixa.Props) => void
): TableColumnsType<Caixa.Props> => [
  {
    title: "Data Abertura",
    dataIndex: "dataAbertura",
    key: "dataAbertura",
    render: (dataAbertura) => (
      <div className="flex items-center gap-3">
        <div>
          <div className="font-medium">
            {new Date(dataAbertura).toLocaleString("pt-BR")}
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Data Fechamento",
    dataIndex: "dataFechamento",
    key: "dataFechamento",
    render: (dataFechamento) => (
      <div className="flex items-center gap-3">
        <div>
          <div className="font-medium">
            {dataFechamento
              ? new Date(dataFechamento).toLocaleString("pt-BR")
              : "-"}
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Valor Abertura",
    dataIndex: "valorAbertura",
    key: "valorAbertura",
    render: (valorAbertura) => (
      <div className="flex items-center gap-3">
        <div>
          <div className="font-medium">{formatCurrency(valorAbertura)}</div>
        </div>
      </div>
    ),
  },
  {
    title: "Valor Fechamento Informado",
    dataIndex: "valorFechamentoInformado",
    key: "valorFechamentoInformado",
    render: (valorFechamentoInformado) => (
      <div className="flex items-center gap-3">
        <div>
          <div className="font-medium">
            {valorFechamentoInformado
              ? formatCurrency(valorFechamentoInformado)
              : "-"}
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    align: "center",
    render: (status: string) => (
      <Tag color={status === "ABERTO" ? "green" : "red"}>{status}</Tag>
    ),
  },
  {
    title: "Ações",
    key: "acoes",
    align: "center",
    render: (_: any, record: any) => (
      <Space>
        <Button
          type="text"
          icon={<CircleArrowRight size={14} />}
          onClick={() => gerenciarCaixa(record)}
        >
          Ver Detalhes
        </Button>
      </Space>
    ),
  },
];
