import { CurrencyInput } from "@/components/inputs/CurrencyInput";
import { columnsCaixa } from "@/constants/tables/caixa";
import { useAuth } from "@/contexts/AuthContext";
import { useCaixaManager, usecaixas, useMoveCaixa } from "@/hooks/use-caixa";
import { formatCurrency } from "@/utils/formatCurrency";
import {
  Button,
  Card,
  Descriptions,
  Drawer,
  Form,
  Input,
  Modal,
  Table,
  Tag,
  Typography,
  List,
} from "antd";
import { CircleX, Plus, Search, TicketPlus, TicketX } from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";

const { Title } = Typography;

const Caixa = () => {
  const { user } = useAuth();
  const [busca, setBusca] = useState("");
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [modalMove, setModalMove] = useState({
    visible: false,
    tipo: null,
  });
  const [caixaSelecionado, setCaixaSelecionado] = useState<Caixa.Props | null>(
    null
  );
  const { openCaixaModal, closeCaixaModal, CaixaManagerModal } =
    useCaixaManager();
  const {
    data: caixas,
    isLoading: isLoadingcaixas,
    isFetching: isFetchingcaixas,
  } = usecaixas();
  const [formMove] = Form.useForm();

  const caixasFiltrados = (caixas || []).filter(
    (caixa) =>
      caixa.status.toLowerCase().includes(busca.toLowerCase()) ||
      caixa.valorAbertura.toString().includes(busca.toLowerCase()) ||
      caixa.dataAbertura.toString().includes(busca.toLowerCase()) ||
      caixa.dataFechamento.toString().includes(busca.toLowerCase()) ||
      caixa.valorFechamentoInformado?.toString().includes(busca.toLowerCase())
  );
  const { mutateAsync: moveCaixa } = useMoveCaixa();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ABERTO":
        return "green";
      case "FECHADO":
        return "red";
      default:
        return "default";
    }
  };

  const handleMovimetacao = (tipo: Caixa.CaixaMovimentacaoTipo) => {
    return () => setModalMove({ visible: true, tipo });
  };

  const handleMoveFinish = async (values: any) => {
    if (!caixaSelecionado) return;
    try {
      const body: Caixa.BodyMoveCaixa = {
        tipo: modalMove.tipo as Caixa.CaixaMovimentacaoTipo,
        valor: Number(values.valor),
        motivo: values.motivo,
      };
      await moveCaixa({
        body,
      });

      setModalMove({ visible: false, tipo: null });
      formMove.resetFields();
      setDrawerVisible(false);
    } catch (error: any) {
      console.error("Erro ao realizar movimentação:", error);
    }
  };

  const handleCloseCaixaModal = () => {
    setDrawerVisible(false);
    closeCaixaModal();
  };

  const gerenciarCaixa = useCallback((caixa: Caixa.Props) => {
    setCaixaSelecionado(caixa);
    setDrawerVisible(true);
  }, []);

  //Para evitar recriar as colunas a cada renderização
  const columns = useMemo(() => columnsCaixa(gerenciarCaixa), [gerenciarCaixa]);
  return (
    <div className="space-y-6">
      <div>
        <Title level={2} className="!mb-2">
          Gestão de Caixa
        </Title>
        <p className="text-muted-foreground">
          Abra, feche e gerencie o caixa do seu estabelecimento
        </p>
      </div>

      {/* Filtros e Ações */}
      <Card>
        <div className="flex flex-col lg:flex-row gap-4 justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <Input
              placeholder="Buscar pelo status, valor, data..."
              prefix={<Search size={16} />}
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="max-w-xs"
            />
          </div>
          <Button
            type="primary"
            icon={<Plus size={16} />}
            onClick={openCaixaModal}
          >
            Abrir Caixa
          </Button>
        </div>
      </Card>

      {/* Tabela de Caixas */}
      <Card title="Lista de Caixas">
        <Table
          dataSource={caixasFiltrados.filter((f) => f.id !== user.id)}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          loading={isLoadingcaixas || isFetchingcaixas}
          locale={{ emptyText: "Nenhum caixa encontrado" }}
        />
      </Card>

      <Drawer
        title={"Detalhes do Caixa"}
        open={drawerVisible}
        onClose={() => {
          setDrawerVisible(false);
        }}
        width={600}
      >
        {caixaSelecionado && (
          <div className="space-y-6">
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Data Abertura">
                {new Date(caixaSelecionado.dataAbertura).toLocaleString(
                  "pt-BR"
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Data Fechamento">
                {new Date(caixaSelecionado.dataFechamento).toLocaleString(
                  "pt-BR"
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Valor Abertura">
                {formatCurrency(caixaSelecionado.valorAbertura)}
              </Descriptions.Item>
              <Descriptions.Item label="Valor Fechamento Informado">
                {formatCurrency(caixaSelecionado.valorFechamentoInformado)}
              </Descriptions.Item>
              <Descriptions.Item label="Valor Fechamento Calculado">
                {formatCurrency(caixaSelecionado.valorFechamentoCalculado)}
              </Descriptions.Item>
              <Descriptions.Item label="Diferença">
                {formatCurrency(caixaSelecionado.diferenca)}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={getStatusColor(caixaSelecionado.status)}>
                  {caixaSelecionado.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Funcionário Abertura">
                {caixaSelecionado.funcionarioAbertura?.nome}
              </Descriptions.Item>
              <Descriptions.Item label="Funcionário Fechamento">
                {caixaSelecionado.funcionarioFechamento?.nome || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Observações">
                {caixaSelecionado.observacoes || "-"}
              </Descriptions.Item>
            </Descriptions>
            {/* ---- Movimentações ---- */}
            <Card size="small" title="Movimentações" className="mt-2">
              <div
                style={{ maxHeight: 250, overflowY: "auto", paddingRight: 8 }}
              >
                <List
                  itemLayout="horizontal"
                  dataSource={caixaSelecionado.movimentacoes}
                  locale={{ emptyText: "Nenhuma movimentação registrada." }}
                  renderItem={(mov) => {
                    const isEntrada = mov.tipo === "ENTRADA";
                    const sinal = isEntrada ? "+" : "-";
                    return (
                      <List.Item
                        actions={[
                          <Tag key="tipo" color={isEntrada ? "green" : "red"}>
                            {isEntrada ? "Entrada" : "Saída"}
                          </Tag>,
                        ]}
                        className="items-center"
                      >
                        <List.Item.Meta
                          title={
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                gap: 12,
                              }}
                            >
                              <span style={{ fontWeight: 500 }}>
                                {mov.motivo?.trim() || "(sem motivo)"}
                              </span>
                              <span style={{ fontWeight: 700 }}>
                                {sinal} {formatCurrency(Number(mov.valor))}
                              </span>
                            </div>
                          }
                          description={
                            <div
                              style={{
                                display: "flex",
                                gap: 8,
                                flexWrap: "wrap",
                              }}
                            >
                              <span>
                                {new Date(mov.createdAt).toLocaleString(
                                  "pt-BR"
                                )}
                              </span>
                              {mov.funcionario?.nome && (
                                <span>• {mov.funcionario.nome}</span>
                              )}
                              {mov.motivo && <span>• {mov.motivo}</span>}
                            </div>
                          }
                        />
                      </List.Item>
                    );
                  }}
                />
              </div>
            </Card>

            {caixaSelecionado.status === "ABERTO" && (
              <React.Fragment>
                <div className="space-y-2  flex justify-center gap-4 items-center">
                  <Button
                    icon={<TicketX size={14} />}
                    block
                    onClick={handleMovimetacao("SAIDA")}
                  >
                    Saidas (Sangria)
                  </Button>

                  <Button
                    icon={<TicketPlus size={14} />}
                    type="primary"
                    block
                    onClick={handleMovimetacao("ENTRADA")}
                  >
                    Entradas
                  </Button>
                </div>
                <div className="space-y-2">
                  <Button
                    icon={<CircleX size={14} />}
                    block
                    danger
                    onClick={handleCloseCaixaModal}
                  >
                    Fechar Caixa
                  </Button>
                </div>
              </React.Fragment>
            )}
          </div>
        )}
      </Drawer>
      {CaixaManagerModal}

      <Modal
        title={`Nova Movimentação - ${
          modalMove.tipo === "ENTRADA" ? "Entrada" : "Saída"
        }`}
        open={modalMove.visible}
        onCancel={() => setModalMove({ visible: false, tipo: null })}
        okText="Executar Movimentação"
        width={500}
        onOk={() => formMove.submit()}
      >
        <Form
          form={formMove}
          layout="vertical"
          initialValues={{ valor: 0, motivo: "" }}
          onFinish={handleMoveFinish}
        >
          <Form.Item
            name="valor"
            label="Valor"
            rules={[{ required: true, message: "O valor é obrigatório." }]}
          >
            <CurrencyInput />
          </Form.Item>
          <Form.Item
            name="motivo"
            label="Motivo"
            rules={[{ required: true, message: "O motivo é obrigatório." }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Caixa;
