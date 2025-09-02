import { useState } from "react";
import {
  Card,
  Table,
  Button,
  Input,
  Modal,
  Form,
  Space,
  Typography,
  message,
  Row,
  Col,
  DatePicker,
  Tabs,
  Tag,
  Avatar,
  Statistic,
  Switch,
} from "antd";
import {
  Users,
  Plus,
  Search,
  Edit,
  Phone,
  Mail,
  Gift,
  Calendar,
  ShoppingBag,
  User,
  IdCard,
} from "lucide-react";
import dayjs from "dayjs";
import {
  useCustomerCreate,
  useCustomers,
  useCustomerUpdate,
} from "@/hooks/use-customer";
import { PhoneInput } from "@/components/inputs/PhoneInput";
import { CpfInput } from "@/components/inputs/CpfInput";
import { NameInput } from "@/components/inputs/NameInput";
import { ColumnsType } from "antd/es/table";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;

const Clientes = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [detalhesModal, setDetalhesModal] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [clienteSelecionado, setClienteSelecionado] = useState<any>(null);
  const [busca, setBusca] = useState("");
  const [form] = Form.useForm();
  const { data: costumers, isLoading } = useCustomers();
  const { mutate: createCustomer } = useCustomerCreate();
  const { mutate: updateCustomer } = useCustomerUpdate();

  // Mock histórico de compras
  const historicoCompras = [
    {
      id: "1",
      data: "2024-01-20",
      servicos: ["Corte Feminino", "Escova"],
      produtos: ["Shampoo Profissional"],
      valor: 105.9,
      funcionario: "Ana Silva",
      pontos: 10,
    },
    {
      id: "2",
      data: "2023-12-15",
      servicos: ["Coloração"],
      produtos: [],
      valor: 80.0,
      funcionario: "Maria Santos",
      pontos: 8,
    },
  ];

  // Mock agendamentos
  const agendamentos = [
    {
      id: "1",
      data: "2024-01-25",
      hora: "14:00",
      servico: "Corte Feminino",
      funcionario: "Ana Silva",
      status: "agendado",
    },
    {
      id: "2",
      data: "2024-01-22",
      hora: "09:30",
      servico: "Manicure",
      funcionario: "Carla Oliveira",
      status: "concluido",
    },
  ];

  const clientesFiltrados = (costumers || []).filter(
    (cliente) =>
      cliente.nome.toLowerCase().includes(busca.toLowerCase()) ||
      cliente.telefone.includes(busca) ||
      cliente?.email?.toLowerCase().includes(busca.toLowerCase())
  );

  const columns: ColumnsType<Customer.Props> = [
    {
      title: "Cliente",
      key: "cliente",
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar size={40} icon={<User size={20} />}>
            {record.nome
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .slice(0, 2)}
          </Avatar>
          <div>
            <div className="font-medium">{record.nome}</div>
            {record.cpf && (
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <IdCard size={12} />
                {record.cpf}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Contato",
      key: "contato",
      render: (_, record) => (
        <div className="space-y-1">
          {record.telefone && (
            <div className="text-sm flex items-center gap-2">
              <Phone size={12} className="text-muted-foreground" />
              {record.telefone}
            </div>
          )}
          {record.email && (
            <div className="text-sm flex items-center gap-2">
              <Mail size={12} className="text-muted-foreground" />
              {record.email}
            </div>
          )}

          {record.aniversario && (
            <div className="text-sm flex items-center gap-2">
              <Calendar size={12} className="text-muted-foreground" />
              {dayjs(record.aniversario).format("DD/MM")}
            </div>
          )}
        </div>
      ),
    },
    /* {
      title: "Fidelidade",
      key: "fidelidade",
      render: (_: any, record: any) => (
        <div className="flex items-center gap-2">
          <Gift size={16} className="text-salao-accent" />
          <span className="font-semibold text-salao-accent">
            {record.pontosFidelidade} pts
          </span>
        </div>
      ),
    }, */
    /* {
      title: "Último Atendimento",
      dataIndex: "ultimoAtendimento",
      key: "ultimoAtendimento",
      render: (data: string) => dayjs(data).format("DD/MM/YYYY"),
    }, */
    {
      title: "Status",
      align: "center",
      dataIndex: "ativo",
      key: "ativo",
      render: (ativo) => (
        <Tag color={ativo ? "green" : "red"}>{ativo ? "Ativo" : "Inativo"}</Tag>
      ),
    },
    {
      title: "Ações",
      key: "acoes",
      align: "center",
      render: (_, record) => (
        <Space>
          <Button disabled type="text" onClick={() => verDetalhes(record)}>
            Ver Detalhes
          </Button>
          <Button
            type="text"
            icon={<Edit size={14} />}
            onClick={() => editarCliente(record)}
          >
            Editar
          </Button>
        </Space>
      ),
    },
  ];

  const editarCliente = (cliente: Customer.Props) => {
    setEditingClient(cliente);
    const formData = {
      ...cliente,
      aniversario: cliente.aniversario ? dayjs(cliente.aniversario) : null,
    };
    form.setFieldsValue(formData);
    setModalVisible(true);
  };

  const novoCliente = () => {
    setEditingClient(null);
    form.resetFields();
    setModalVisible(true);
  };

  const verDetalhes = (cliente: Customer.Props) => {
    setClienteSelecionado(cliente);
    setDetalhesModal(true);
  };

  const handleSubmit = (values: Customer.Props) => {
    const formatDate = dayjs(values.aniversario).format("DD/MM/YYYY");

    try {
      if (!editingClient) {
        createCustomer(values);
        setModalVisible(false);
        form.resetFields();
      } else {
        updateCustomer({
          id: editingClient.id,
          body: values,
        });
        setModalVisible(false);
        form.resetFields();
        setEditingClient(null);
      }
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);
    }
  };

  const comprasColumns = [
    {
      title: "Data",
      dataIndex: "data",
      key: "data",
      render: (data: string) => dayjs(data).format("DD/MM/YYYY"),
    },
    {
      title: "Serviços/Produtos",
      key: "itens",
      render: (_: any, record: any) => (
        <div className="space-y-1">
          {record.servicos.map((servico: string, i: number) => (
            <Tag key={i} color="purple">
              {servico}
            </Tag>
          ))}
          {record.produtos.map((produto: string, i: number) => (
            <Tag key={i} color="blue">
              {produto}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: "Valor",
      dataIndex: "valor",
      key: "valor",
      render: (valor: number) => `R$ ${valor.toFixed(2)}`,
    },
    {
      title: "Pontos",
      dataIndex: "pontos",
      key: "pontos",
      render: (pontos: number) => <Tag color="gold">+{pontos} pts</Tag>,
    },
  ];

  const agendamentosColumns = [
    {
      title: "Data/Hora",
      key: "dataHora",
      render: (_: any, record: any) => (
        <div>
          <div>{dayjs(record.data).format("DD/MM/YYYY")}</div>
          <div className="text-sm text-muted-foreground">{record.hora}</div>
        </div>
      ),
    },
    {
      title: "Serviço",
      dataIndex: "servico",
      key: "servico",
    },
    {
      title: "Funcionário",
      dataIndex: "funcionario",
      key: "funcionario",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "agendado" ? "blue" : "green"}>
          {status === "agendado" ? "Agendado" : "Concluído"}
        </Tag>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Title level={2} className="!mb-2">
          Gestão de Clientes
        </Title>
        <p className="text-muted-foreground">
          Cadastre e gerencie informações dos clientes
        </p>
      </div>

      {/* Filtros e Ações */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <Input
            placeholder="Buscar por nome, telefone ou email..."
            prefix={<Search size={16} />}
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="max-w-md"
          />
          <Button
            type="primary"
            icon={<Plus size={16} />}
            onClick={novoCliente}
          >
            Novo Cliente
          </Button>
        </div>
      </Card>

      {/* Tabela de Clientes */}
      <Card title="Lista de Clientes">
        <Table
          dataSource={clientesFiltrados}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Modal de Cadastro/Edição */}
      <Modal
        title={editingClient ? "Editar Cliente" : "Novo Cliente"}
        open={modalVisible}
        onOk={() => form.submit()}
        okText={editingClient ? "Atualizar" : "Cadastrar"}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingClient(null);
        }}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Nome Completo"
                name="nome"
                rules={[{ required: true, message: "Nome é obrigatório" }]}
              >
                <NameInput placeholder="Ex: Joana Pereira" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Telefone"
                name="telefone"
                rules={[
                  { required: true, message: "Telefone é obrigatório" },
                  {
                    pattern: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
                    message: "Formato inválido. Use (11) 99999-9999",
                  },
                ]}
              >
                <PhoneInput />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[{ type: "email", message: "Email inválido" }]}
              >
                <Input placeholder="cliente@email.com" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="CPF (opcional)"
                name="cpf"
                rules={[
                  {
                    pattern: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
                    message: "Formato inválido. Use 000.000.000-00",
                  },
                ]}
              >
                <CpfInput />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label="Data de Aniversário" name="aniversario">
                <DatePicker
                  placeholder="Selecionar data"
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Status" name="ativo" valuePropName="checked">
                <Switch checkedChildren="Ativo" unCheckedChildren="Inativo" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Observações" name="observacoes">
            <TextArea
              rows={3}
              placeholder="Observações sobre o cliente, preferências, alergias, etc."
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal de Detalhes do Cliente */}
      <Modal
        title={`Detalhes - ${clienteSelecionado?.nome}`}
        open={detalhesModal}
        onCancel={() => {
          setDetalhesModal(false);
          setClienteSelecionado(null);
        }}
        footer={null}
        width={800}
      >
        {clienteSelecionado && (
          <div className="space-y-6">
            {/* Informações Básicas */}
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8}>
                <Card size="small">
                  <Statistic
                    title="Pontos de Fidelidade"
                    value={clienteSelecionado.pontosFidelidade}
                    prefix={<Gift className="text-salao-accent" size={16} />}
                    valueStyle={{ color: "#ec4899" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card size="small">
                  <Statistic
                    title="Cliente desde"
                    value={dayjs(clienteSelecionado.dataCadastro).format(
                      "DD/MM/YYYY"
                    )}
                    prefix={
                      <Calendar className="text-salao-primary" size={16} />
                    }
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card size="small">
                  <Statistic
                    title="Último Atendimento"
                    value={dayjs(clienteSelecionado.ultimoAtendimento).format(
                      "DD/MM/YYYY"
                    )}
                    prefix={
                      <ShoppingBag className="text-salao-success" size={16} />
                    }
                  />
                </Card>
              </Col>
            </Row>

            {/* Tabs com Histórico */}
            <Tabs defaultActiveKey="1">
              <TabPane tab="💰 Histórico de Compras" key="1">
                <Table
                  dataSource={historicoCompras}
                  columns={comprasColumns}
                  rowKey="id"
                  pagination={false}
                  size="small"
                />
              </TabPane>
              <TabPane tab="📅 Agendamentos" key="2">
                <Table
                  dataSource={agendamentos}
                  columns={agendamentosColumns}
                  rowKey="id"
                  pagination={false}
                  size="small"
                />
              </TabPane>
              <TabPane tab="ℹ️ Informações" key="3">
                <div className="space-y-4">
                  <div>
                    <Text strong>Telefone:</Text>
                    <Text className="ml-2">{clienteSelecionado.telefone}</Text>
                  </div>
                  <div>
                    <Text strong>Email:</Text>
                    <Text className="ml-2">{clienteSelecionado.email}</Text>
                  </div>
                  {clienteSelecionado.cpf && (
                    <div>
                      <Text strong>CPF:</Text>
                      <Text className="ml-2">{clienteSelecionado.cpf}</Text>
                    </div>
                  )}
                  {clienteSelecionado.aniversario && (
                    <div>
                      <Text strong>Aniversário:</Text>
                      <Text className="ml-2">
                        {dayjs(clienteSelecionado.aniversario).format(
                          "DD/MM/YYYY"
                        )}
                      </Text>
                    </div>
                  )}
                  {clienteSelecionado.observacoes && (
                    <div>
                      <Text strong>Observações:</Text>
                      <div className="mt-1 p-3 bg-muted rounded">
                        {clienteSelecionado.observacoes}
                      </div>
                    </div>
                  )}
                </div>
              </TabPane>
            </Tabs>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Clientes;
