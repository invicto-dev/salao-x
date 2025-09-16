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
  InputNumber,
  Switch,
  Space,
  Typography,
  message,
  Row,
  Col,
  TimePicker,
  TableColumnProps,
  Checkbox,
  Tooltip,
} from "antd";
import {
  Scissors,
  Plus,
  Search,
  Edit,
  Eye,
  EyeOff,
  Clock,
  Check,
  Type,
  Album,
  Barcode,
} from "lucide-react";
import dayjs from "dayjs";
import {
  useServiceCreate,
  useServices,
  useServiceUpdate,
} from "@/hooks/use-services";
import { NameInput } from "@/components/inputs/NameInput";

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const Servicos = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [openValue, setOpenValue] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState(undefined);
  const [filtroStatus, setFiltroStatus] = useState(undefined);
  const [busca, setBusca] = useState("");
  const [form] = Form.useForm();
  const { data: servicos } = useServices();
  const { mutate: createService } = useServiceCreate();
  const { mutate: updateService } = useServiceUpdate();

  const categorias = [
    "Cabelo",
    "Unhas",
    "Pele",
    "Maquiagem",
    "Depilação",
    "Massagem",
  ];

  const servicosFiltrados = (servicos || []).filter((servico) => {
    const matchBusca =
      servico.nome.toLowerCase().includes(busca.toLowerCase()) ||
      (servico.codigo || "").toLowerCase().includes(busca.toLowerCase());
    const matchCategoria =
      !(filtroCategoria || "") || servico.categoria === (filtroCategoria || "");
    const matchStatus =
      (filtroStatus || "") === "" ||
      (filtroStatus === "ativo" && (servico.ativo || "")) ||
      (filtroStatus === "inativo" && !(servico.ativo || ""));
    return matchBusca && matchCategoria && matchStatus;
  });

  const formatDuracao = (minutos: number) => {
    if (minutos < 60) {
      return `${minutos}min`;
    }
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return mins > 0 ? `${horas}h ${mins}min` : `${horas}h`;
  };

  const columns: TableColumnProps<Service.Props>[] = [
    {
      title: "Serviço",
      key: "servico",
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-salao-primary-light rounded-lg flex items-center justify-center">
            <Scissors size={20} className="text-salao-primary" />
          </div>
          <div>
            <div className=" font-medium">{record.nome}</div>

            {record.categoria && (
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <Album size={12} />
                {record.categoria}
              </div>
            )}
            {record.codigo && (
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <Barcode size={12} />
                {record.codigo}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Preço",
      dataIndex: "preco",
      key: "preco",
      render: (preco: number, record) => (
        <div className="font-semibold text-salao-primary">
          {record.valorEmAberto ? "Valor em aberto" : `R$ ${preco}`}
        </div>
      ),
    },
    {
      title: "Duração",
      dataIndex: "duracao",
      key: "duracao",
      render: (duracao: number) => (
        <div className="flex items-center gap-1">
          <Clock size={14} className="text-muted-foreground" />
          <span>{duracao ? formatDuracao(duracao) : "Não definido"}</span>
        </div>
      ),
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
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<Edit size={14} />}
            onClick={() => editarServico(record)}
          >
            Editar
          </Button>
        </Space>
      ),
    },
  ];

  const editarServico = (servico: Service.Props) => {
    setEditingService(servico);
    const formData = {
      ...servico,
      duracao: dayjs().startOf("day").add(servico.duracao, "minute"),
    };
    setOpenValue(servico.valorEmAberto);
    form.setFieldsValue(formData);
    setModalVisible(true);
  };

  const novoServico = () => {
    setEditingService(null);
    form.resetFields();
    form.setFieldsValue({
      ativo: true,
      duracao: dayjs().startOf("day").add(60, "minute"),
    });
    setModalVisible(true);
  };

  const handleSubmit = (values: Service.Props) => {
    try {
      const duracaoMinutos =
        values?.duracao?.hour() * 60 + values?.duracao?.minute();
      if (!editingService) {
        createService({ ...values, duracao: duracaoMinutos });
        setModalVisible(false);
        form.resetFields();
        setOpenValue(false);
      } else {
        updateService({
          id: editingService.id,
          body: { ...values, duracao: duracaoMinutos || undefined },
        });
        setModalVisible(false);
        form.resetFields();
        setEditingService(null);
        setOpenValue(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Title level={2} className="!mb-2">
          Gestão de Serviços
        </Title>
        <p className="text-muted-foreground">
          Cadastre e gerencie serviços oferecidos pelo salão
        </p>
      </div>

      {/* Filtros e Ações */}
      <Card>
        <div className="flex flex-col lg:flex-row gap-4 justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <Input
              placeholder="Buscar por nome ou código..."
              prefix={<Search size={16} />}
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="max-w-xs"
            />
            <Select
              placeholder="Categoria"
              allowClear
              value={filtroCategoria}
              onChange={setFiltroCategoria}
              className="min-w-[150px]"
            >
              {categorias.map((cat) => (
                <Option key={cat} value={cat}>
                  {cat}
                </Option>
              ))}
            </Select>
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
            icon={<Plus size={16} />}
            onClick={novoServico}
          >
            Novo Serviço
          </Button>
        </div>
      </Card>

      {/* Tabela de Serviços */}
      <Card title="Lista de Serviços">
        <Table
          dataSource={servicosFiltrados}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Modal de Cadastro/Edição */}
      <Modal
        title={editingService ? "Editar Serviço" : "Novo Serviço"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingService(null);
          setOpenValue(false);
        }}
        onOk={() => form.submit()}
        okText={editingService ? "Salvar" : "Cadastrar"}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Nome do Serviço"
                name="nome"
                rules={[{ required: true, message: "Nome é obrigatório" }]}
              >
                <NameInput placeholder="Ex: Corte Feminino" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Código" name="codigo">
                <Input placeholder="Ex: CORT001" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Categoria" name="categoria">
            <Select placeholder="Selecionar categoria">
              {categorias.map((cat) => (
                <Option key={cat} value={cat}>
                  {cat}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Descrição" name="descricao">
            <TextArea rows={3} placeholder="Descreva o serviço..." />
          </Form.Item>
          <Form.Item name="valorEmAberto" valuePropName="checked">
            <Checkbox
              checked={openValue}
              onChange={(e) => setOpenValue(e.target.checked)}
              children="Valor em aberto?"
            />
          </Form.Item>

          <Row gutter={16}>
            {!openValue && (
              <Col xs={24} sm={8}>
                <Form.Item
                  label="Preço"
                  name="preco"
                  rules={[
                    { required: !openValue, message: "Preço é obrigatório" },
                  ]}
                  className="flex-1"
                >
                  <InputNumber
                    min={0}
                    precision={2}
                    style={{ width: "100%" }}
                    addonBefore="R$"
                    placeholder="0,00"
                  />
                </Form.Item>
              </Col>
            )}
            <Col xs={24} sm={8}>
              <Form.Item label="Duração Estimada" name="duracao">
                <TimePicker
                  format="HH:mm"
                  placeholder="Selecionar duração"
                  style={{ width: "100%" }}
                  showNow={false}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Status" name="ativo" valuePropName="checked">
            <Switch checkedChildren="Ativo" unCheckedChildren="Inativo" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Servicos;
