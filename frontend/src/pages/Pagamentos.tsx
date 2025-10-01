import { useState } from "react";
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  Tag,
  Modal,
  Form,
  Switch,
  Typography,
  message,
  Row,
  Col,
  Upload,
  TableColumnProps,
} from "antd";
import { Plus, Search, Upload as UploadIcon, List } from "lucide-react";

import { NameInput } from "@/components/inputs/NameInput";
import {
  usePaymentMethodCreate,
  usePaymentMethodDelete,
  usePaymentMethods,
  usePaymentMethodUpdate,
} from "@/hooks/use-payment-methods";
import DropdownComponent from "@/components/Dropdown";

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const MetodoDePagamentos = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPaymentMethod, setEditingPaymentMethod] =
    useState<PaymentMethod.Props>(null);
  const [filtroStatus, setFiltroStatus] = useState(undefined);
  const [busca, setBusca] = useState("");
  const [form] = Form.useForm();
  const { data: paymentMethods } = usePaymentMethods();
  const { mutate: createPaymentMethod } = usePaymentMethodCreate();
  const { mutate: updatePaymentMethod } = usePaymentMethodUpdate();
  const { mutate: deletePaymentMethod } = usePaymentMethodDelete();

  const paymentMethodsFiltered = (paymentMethods || []).filter(
    (paymentMethod) => {
      const matchBusca = paymentMethod.nome
        .toLowerCase()
        .includes(busca.toLowerCase());

      const matchStatus =
        (filtroStatus || "") === "" ||
        (filtroStatus === "ativo" && paymentMethod.ativo) ||
        (filtroStatus === "inativo" && !paymentMethod.ativo);
      return matchBusca && matchStatus;
    }
  );

  const columns: TableColumnProps<PaymentMethod.Props>[] = [
    {
      title: "Nome",
      dataIndex: "nome",
      key: "nome",
      render: (nome) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
            <List size={20} className="text-muted-foreground" />
          </div>
          <div>
            <div className="font-medium">{nome}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Descrição",
      dataIndex: "descricao",
      key: "descricao",
    },
    {
      title: "Status",
      dataIndex: "ativo",
      key: "ativo",
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
                key: "1",
                label: "Editar",
                onClick: () => editarMetodoDePagamento(record),
              },
              {
                key: "2",
                label: "Excluir",
                onClick: () => excluirMetodoDePagamento(record),
              },
            ],
          }}
        />
      ),
    },
  ];

  const editarMetodoDePagamento = (paymentMethod: PaymentMethod.Props) => {
    setEditingPaymentMethod(paymentMethod);
    form.setFieldsValue(paymentMethod);
    setModalVisible(true);
  };

  const excluirMetodoDePagamento = (paymentMethod: PaymentMethod.Props) => {
    Modal.confirm({
      title: "Confirmar Exclusão",
      content: `Você tem certeza que deseja excluir o método de pagamento ${paymentMethod.nome}?`,
      okText: "Sim, Excluir",
      okButtonProps: { danger: true },
      cancelText: "Não",
      onOk: () => deletePaymentMethod(paymentMethod.id),
    });
  };

  const handleSubmit = (values: PaymentMethod.Props) => {
    try {
      if (!editingPaymentMethod) {
        createPaymentMethod(values);
        setModalVisible(false);
        form.resetFields();
      } else {
        updatePaymentMethod({
          id: editingPaymentMethod.id,
          body: values,
        });
        setModalVisible(false);
        form.resetFields();
        setEditingPaymentMethod(null);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const novoMetodoDePagamento = () => {
    setEditingPaymentMethod(null);
    form.resetFields();
    setModalVisible(true);
  };

  const uploadProps = {
    name: "file",
    showUploadList: false,
    beforeUpload: (file: any) => {
      const isJpgOrPng =
        file.type === "image/jpeg" || file.type === "image/png";
      if (!isJpgOrPng) {
        message.error("Você só pode fazer upload de arquivos JPG/PNG!");
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error("A imagem deve ter menos de 2MB!");
      }
      return false; // Simular upload (não enviar arquivo)
    },
  };

  return (
    <div className="space-y-6">
      <div>
        <Title level={2} className="!mb-2">
          Gestão de Metodos de Pagamento
        </Title>
        <p className="text-muted-foreground">
          Cadastre e gerencie seus métodos de pagamento aceitos
        </p>
      </div>

      <Card>
        <div className="flex flex-col lg:flex-row gap-4 justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <Input
              placeholder="Buscar pelo nome..."
              prefix={<Search size={14} />}
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="max-w-xs"
            />
            <Select
              placeholder="Status"
              allowClear
              value={filtroStatus}
              onChange={setFiltroStatus}
              className="min-w-[120px]"
            >
              <Option value="ativo">Ativo</Option>
              <Option value="inativo">Inativo</Option>
            </Select>
          </div>
          <Button
            type="primary"
            icon={<Plus size={14} />}
            onClick={novoMetodoDePagamento}
          >
            Novo Método de Pagamento
          </Button>
        </div>
      </Card>

      <Card title="Lista de Métodos de Pagamento">
        <Table
          dataSource={paymentMethodsFiltered}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={
          editingPaymentMethod
            ? "Editar Metodo de Pagamento"
            : "Novo Metodo de Pagamento"
        }
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingPaymentMethod(null);
        }}
        onOk={() => form.submit()}
        okText={editingPaymentMethod ? "Salvar" : "Cadastrar"}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ ativo: true }}
        >
          <Row gutter={16}>
            <Col xs={24} lg={16}>
              <Form.Item
                label="Nome"
                name="nome"
                rules={[{ required: true, message: "Nome é obrigatório" }]}
              >
                <NameInput placeholder="Ex: Vale Alimentação" />
              </Form.Item>

              <Form.Item label="Descrição" name="descricao">
                <TextArea
                  rows={3}
                  placeholder="Descreva o método de pagamento..."
                />
              </Form.Item>
            </Col>

            <Col xs={24} lg={8}>
              <Form.Item label="Imagem da Metodo de Pagamento">
                <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                  <Upload disabled {...uploadProps}>
                    <div className="space-y-2">
                      <UploadIcon
                        size={32}
                        className="mx-auto text-muted-foreground"
                      />
                      <div className="text-sm text-muted-foreground">
                        Clique para fazer upload
                      </div>
                      <div className="text-xs text-muted-foreground">
                        PNG, JPG até 2MB
                      </div>
                    </div>
                  </Upload>
                </div>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col xs={24} sm={8}>
              <Form.Item label="Status" name="ativo" valuePropName="checked">
                <Switch checkedChildren="Ativo" unCheckedChildren="Inativo" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default MetodoDePagamentos;
