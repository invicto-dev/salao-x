import {
  closeCaixa,
  getCaixas,
  getCaixaSummary,
  hasOpenCaixa,
  moveCaixa,
  openCaixa,
} from "@/api/caixa";
import { CurrencyInput } from "@/components/inputs/CurrencyInput";
import { formatCurrency } from "@/utils/formatCurrency";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Col,
  Divider,
  Form,
  Input,
  message,
  Modal,
  Row,
  Spin,
  Statistic,
  Typography,
} from "antd";
import { AxiosError } from "axios";
import { useState } from "react";

export const usecaixas = () => {
  return useQuery<Caixa.Props[]>({
    queryKey: ["get-caixas"],
    queryFn: getCaixas,
  });
};

export const useHasOpenCaixa = () => {
  return useQuery<Caixa.Props | null>({
    queryKey: ["has-open-caixa"],
    queryFn: hasOpenCaixa,
  });
};

export const useOpenCaixa = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ body }: { body: Caixa.BodyOpen }) => {
      return await openCaixa(body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["has-open-caixa"] });
      queryClient.invalidateQueries({ queryKey: ["get-caixas"] });
      message.success("Caixa aberto com sucesso.");
    },
    onError: (error: AxiosError<{ error: string }>) => {
      message.error(error.response?.data?.error || "Erro ao abrir caixa");
    },
  });
};

export const useCloseCaixa = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ body }: { body: Caixa.BodyClose }) => {
      return await closeCaixa(body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["has-open-caixa"] });
      queryClient.invalidateQueries({ queryKey: ["get-caixas"] });
      message.success("Caixa fechado com sucesso.");
    },
    onError: (error: AxiosError<{ error: string }>) => {
      message.error(error.response?.data?.error || "Erro ao fechar caixa");
    },
  });
};

export const useMoveCaixa = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ body }: { body: Caixa.BodyMoveCaixa }) => {
      return await moveCaixa(body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get-caixas"] });
      queryClient.invalidateQueries({ queryKey: ["get-caixa-summary"] });
      message.success("Movimentação realizada com sucesso.");
    },
    onError: (error: AxiosError<{ error: string }>) => {
      message.error(error.response?.data?.error || "Erro na movimentação");
    },
  });
};

export const useCaixaManager = () => {
  const [modalMode, setModalMode] = useState<"open" | "close" | null>(null);
  const [form] = Form.useForm();

  const { data: summary, isLoading: isLoadingSummary } =
    useQuery<Caixa.SummaryResponse>({
      queryKey: ["get-caixa-summary"],
      queryFn: getCaixaSummary,
      enabled: modalMode === "close",
    });

  const { mutate: openCaixaMutate, isPending: isOpening } = useOpenCaixa();
  const { mutate: closeCaixaMutate, isPending: isClosing } = useCloseCaixa();

  const handleOpen = () => setModalMode("open");
  const handleClose = () => setModalMode("close");
  const handleCancel = () => {
    form.resetFields();
    setModalMode(null);
  };

  const onFinish = (values: any) => {
    if (modalMode === "open") {
      openCaixaMutate(
        { body: { valorAbertura: Number(values.valorAbertura) } },
        { onSuccess: handleCancel }
      );
    } else if (modalMode === "close") {
      closeCaixaMutate(
        {
          body: {
            valorFechamentoInformado: Number(values.valorFechamentoInformado),
            observacoes: values.observacoes,
          },
        },
        { onSuccess: handleCancel }
      );
    }
  };

  const totalEsperadoEmCaixa =
    (summary?.valorAbertura || 0) + (summary?.saldoFisicoDinheiro || 0);

  const CaixaManagerModal = (
    <Modal
      title={modalMode === "open" ? "Abrir Caixa" : "Fechar Caixa"}
      open={modalMode !== null}
      width={700}
      centered
      onOk={() => form.submit()}
      onCancel={handleCancel}
      okText={modalMode === "open" ? "Abrir Caixa" : "Confirmar Fechamento"}
      confirmLoading={isOpening || isClosing}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        {modalMode === "open" && (
          <>
            <Alert
              type="info"
              showIcon
              className="!mb-6"
              message="Insira o valor inicial (fundo de troco) para abrir o caixa e iniciar as vendas."
            />
            <Form.Item
              name="valorAbertura"
              label="Valor de Abertura"
              rules={[{ required: true, message: "Informe o valor inicial" }]}
            >
              <CurrencyInput min={0} autoFocus />
            </Form.Item>
          </>
        )}

        {modalMode === "close" &&
          (isLoadingSummary ? (
            <div className="flex justify-center items-center py-10">
              <Spin tip="Calculando totais..." />
            </div>
          ) : (
            <>
              <div className=" p-5 rounded-lg border mb-6">
                <Typography.Title
                  level={5}
                  className="!mb-4 flex items-center gap-2"
                >
                  💵 Conferência Física (Gaveta)
                </Typography.Title>

                <Row gutter={[16, 16]}>
                  {/* Fundo de Troco */}
                  <Col span={8}>
                    <Statistic
                      title="Valor de Abertura"
                      value={summary?.valorAbertura}
                      formatter={formatCurrency}
                    />
                  </Col>

                  {/* Vendas em Dinheiro (Líquido) */}
                  {summary?.resumoPorMetodo
                    .filter((m) => m.isCash)
                    .map((metodo) => (
                      <Col span={8} key={metodo.metodoId}>
                        <Statistic
                          title={`(+) Vendas ${metodo.nome}`}
                          value={metodo.valorLiquido}
                          formatter={formatCurrency}
                        />
                      </Col>
                    ))}

                  {/* Movimentações */}
                  <Col span={8}>
                    <Statistic
                      title="(+) Entradas / Sangria"
                      value={summary?.totalEntradas}
                      formatter={formatCurrency}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="(-) Saídas / Sangria"
                      value={summary?.totalSaidas}
                      formatter={formatCurrency}
                      valueStyle={{ color: "#cf1322" }}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="(-) Troco Devolvido"
                      value={summary?.totalTroco}
                      formatter={formatCurrency}
                      valueStyle={{ color: "#cf1322" }}
                    />
                  </Col>
                </Row>

                <Divider className="my-4" />

                <div className="flex justify-between items-end">
                  <span className="text-emerald-900 font-medium">
                    Valor esperado na gaveta:
                  </span>
                  <span className="text-2xl font-bold text-emerald-700">
                    {formatCurrency(totalEsperadoEmCaixa)}
                  </span>
                </div>
              </div>

              {/* BLOCO 2: OUTROS MEIOS (DIGITAL) */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
                <Typography.Title level={5} className="!mb-3 !text-gray-600">
                  💳 Outros Recebimentos (Digital)
                </Typography.Title>
                <Row gutter={[16, 16]}>
                  {summary?.resumoPorMetodo
                    .filter((m) => !m.isCash)
                    .map((metodo) => (
                      <Col span={8} key={metodo.metodoId}>
                        <Statistic
                          title={metodo.nome}
                          value={metodo.valorBruto}
                          formatter={formatCurrency}
                          valueStyle={{ fontSize: 16 }}
                        />
                      </Col>
                    ))}

                  {summary?.resumoPorMetodo.filter((m) => !m.isCash).length ===
                    0 && (
                    <Col span={24}>
                      <span className="text-gray-400 text-sm">
                        Nenhuma venda digital neste caixa.
                      </span>
                    </Col>
                  )}
                </Row>
              </div>

              {/* BLOCO 3: INPUT DE CONFERÊNCIA */}
              <Alert
                message="Conte o dinheiro físico da gaveta e informe abaixo para fechar."
                type="warning"
                className="mb-4"
              />

              <Form.Item
                name="valorFechamentoInformado"
                label="Valor Contado em Dinheiro"
                rules={[{ required: true, message: "Informe o valor contado" }]}
              >
                <CurrencyInput autoFocus size="large" />
              </Form.Item>

              <Form.Item
                name="observacoes"
                label="Observações (Quebra de caixa, justificativas, etc)"
              >
                <Input.TextArea rows={2} />
              </Form.Item>
            </>
          ))}
      </Form>
    </Modal>
  );

  return {
    openCaixaModal: handleOpen,
    closeCaixaModal: handleClose,
    CaixaManagerModal,
  };
};
