import {
  closeCaixa,
  getCaixaSummary,
  hasOpenCaixa,
  moveCaixa,
  openCaixa,
} from "@/api/caixa";
import { CurrencyInput } from "@/components/inputs/CurrencyInput";
import { formatCurrency } from "@/utils/formatCurrency";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Form, Input, message, Modal, Spin, Statistic } from "antd";
import { AxiosError } from "axios";
import { useState } from "react";

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
      message.success("Caixa aberto com sucesso.");
    },
    onError: (error: AxiosError<{ error: string }>) => {
      message.error(error.response.data.error);
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
      message.success("Caixa fechado com sucesso.");
    },
    onError: (error: AxiosError<{ error: string }>) => {
      message.error(error.response.data.error);
    },
  });
};

export const useMoveCaixa = () => {
  return useMutation({
    mutationFn: async ({ body }: { body: Caixa.BodyMoveCaixa }) => {
      return await moveCaixa(body);
    },
    onSuccess: () => message.success("Movimetação realizada com sucesso."),
    onError: (error: AxiosError<{ error: string }>) => {
      message.error(error.response.data.error);
    },
  });
};

export const useCaixaManager = () => {
  const [modalMode, setModalMode] = useState<"open" | "close" | null>(null);
  const [form] = Form.useForm();

  const { data: summary, isLoading: isLoadingSummary } = useQuery({
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

  const CaixaManagerModal = (
    <Modal
      title={modalMode === "open" ? "Abrir Caixa" : "Fechar Caixa"}
      open={modalMode !== null}
      centered
      onOk={() => form.submit()}
      onCancel={handleCancel}
      okText={modalMode === "open" ? "Abrir Caixa" : "Confirmar Fechamento"}
      confirmLoading={isOpening || isClosing}
      maskClosable={modalMode === "open"}
      closable={modalMode === "open"}
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
              rules={[{ required: true }]}
            >
              <CurrencyInput min={0} autoFocus />
            </Form.Item>
          </>
        )}

        {modalMode === "close" &&
          (isLoadingSummary ? (
            <Spin />
          ) : (
            <>
              <div className="space-y-2 mb-6 p-4 bg-muted rounded-lg">
                <Statistic
                  title="(+) Valor de Abertura"
                  value={summary?.valorAbertura}
                  formatter={formatCurrency}
                />
                <Statistic
                  title="(+) Vendas em Dinheiro"
                  value={summary?.totalLiquidoVendasDinheiro}
                  formatter={formatCurrency}
                />
                <Statistic
                  title="(+) Outras Entradas"
                  value={summary?.totalEntradas}
                  formatter={formatCurrency}
                />
                <Statistic
                  title="(-) Saídas (Sangria)"
                  value={summary?.totalSaidas}
                  formatter={formatCurrency}
                />
                <hr className="my-2" />
                <Statistic
                  title="(=) Valor Esperado em Caixa"
                  value={summary?.valorFechamentoCalculado}
                  formatter={formatCurrency}
                  valueStyle={{ color: "#059669" }}
                />
              </div>
              <Form.Item
                name="valorFechamentoInformado"
                label="Valor Contado em Caixa"
                rules={[{ required: true }]}
              >
                <CurrencyInput autoFocus />
              </Form.Item>
              <Form.Item name="observacoes" label="Observações (Opcional)">
                <Input.TextArea rows={3} />
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
