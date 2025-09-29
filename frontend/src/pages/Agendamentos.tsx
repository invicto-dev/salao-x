import { useState } from "react";
import {
  Card,
  Calendar,
  Badge,
  Modal,
  Form,
  Button,
  Select,
  TimePicker,
  Input,
  Space,
  Typography,
  message,
  Row,
  Col,
  Tag,
  List,
  Divider,
} from "antd";
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  User,
  Scissors,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import dayjs, { Dayjs } from "dayjs";
import type { CalendarProps } from "antd";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface Agendamento {
  id: string;
  clienteId: string;
  clienteNome: string;
  clienteTelefone: string;
  funcionarioId: string;
  funcionarioNome: string;
  servicoId: string;
  servicoNome: string;
  data: string;
  hora: string;
  duracao: number;
  status:
    | "agendado"
    | "confirmado"
    | "em-andamento"
    | "concluido"
    | "cancelado";
  observacoes?: string;
  preco: number;
}

const Agendamentos = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAgendamento, setEditingAgendamento] =
    useState<Agendamento | null>(null);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [form] = Form.useForm();

  // Mock data
  const agendamentos: Agendamento[] = [
    {
      id: "1",
      clienteId: "1",
      clienteNome: "Ana Silva",
      clienteTelefone: "(11) 99999-9999",
      funcionarioId: "1",
      funcionarioNome: "Maria Santos",
      servicoId: "1",
      servicoNome: "Corte Feminino",
      data: "2024-01-25",
      hora: "09:00",
      duracao: 60,
      status: "agendado",
      observacoes: "Cliente prefere corte mais curto",
      preco: 50.0,
    },
    {
      id: "2",
      clienteId: "2",
      clienteNome: "Carla Oliveira",
      clienteTelefone: "(11) 88888-8888",
      funcionarioId: "2",
      funcionarioNome: "Ana Costa",
      servicoId: "2",
      servicoNome: "Coloração",
      data: "2024-01-25",
      hora: "14:00",
      duracao: 120,
      status: "confirmado",
      preco: 80.0,
    },
    {
      id: "3",
      clienteId: "3",
      clienteNome: "Julia Santos",
      clienteTelefone: "(11) 77777-7777",
      funcionarioId: "3",
      funcionarioNome: "Beatriz Lima",
      servicoId: "3",
      servicoNome: "Manicure",
      data: "2024-01-25",
      hora: "16:30",
      duracao: 45,
      status: "agendado",
      preco: 25.0,
    },
    {
      id: "4",
      clienteId: "1",
      clienteNome: "Ana Silva",
      clienteTelefone: "(11) 99999-9999",
      funcionarioId: "1",
      funcionarioNome: "Maria Santos",
      servicoId: "4",
      servicoNome: "Escova",
      data: "2024-01-26",
      hora: "10:00",
      duracao: 45,
      status: "concluido",
      preco: 30.0,
    },
  ];

  const clientes = [
    { id: "1", nome: "Ana Silva", telefone: "(11) 99999-9999" },
    { id: "2", nome: "Carla Oliveira", telefone: "(11) 88888-8888" },
    { id: "3", nome: "Julia Santos", telefone: "(11) 77777-7777" },
  ];

  const funcionarios = [
    { id: "1", nome: "Maria Santos", especialidades: ["Corte", "Escova"] },
    {
      id: "2",
      nome: "Ana Costa",
      especialidades: ["Coloração", "Tratamentos"],
    },
    { id: "3", nome: "Beatriz Lima", especialidades: ["Manicure", "Pedicure"] },
  ];

  const servicos = [
    { id: "1", nome: "Corte Feminino", duracao: 60, preco: 50.0 },
    { id: "2", nome: "Coloração", duracao: 120, preco: 80.0 },
    { id: "3", nome: "Manicure", duracao: 45, preco: 25.0 },
    { id: "4", nome: "Escova", duracao: 45, preco: 30.0 },
    { id: "5", nome: "Pedicure", duracao: 60, preco: 35.0 },
  ];

  const getStatusConfig = (status: string) => {
    const configs = {
      agendado: {
        color: "blue",
        icon: <CalendarIcon size={12} />,
        text: "Agendado",
      },
      confirmado: {
        color: "green",
        icon: <CheckCircle size={12} />,
        text: "Confirmado",
      },
      "em-andamento": {
        color: "orange",
        icon: <Clock size={12} />,
        text: "Em Andamento",
      },
      concluido: {
        color: "green",
        icon: <CheckCircle size={12} />,
        text: "Concluído",
      },
      cancelado: {
        color: "red",
        icon: <XCircle size={12} />,
        text: "Cancelado",
      },
    };
    return configs[status as keyof typeof configs] || configs["agendado"];
  };

  const getAgendamentosPorData = (date: Dayjs) => {
    return agendamentos
      .filter(
        (ag) =>
          dayjs(ag.data).format("YYYY-MM-DD") === date.format("YYYY-MM-DD")
      )
      .sort((a, b) => a.hora.localeCompare(b.hora));
  };

  const dateCellRender = (value: Dayjs) => {
    const agendamentosData = getAgendamentosPorData(value);
    return (
      <div className="space-y-1">
        {agendamentosData.slice(0, 3).map((ag) => {
          const statusConfig = getStatusConfig(ag.status);
          return (
            <Badge
              key={ag.id}
              status={statusConfig.color as any}
              text={
                <span className="text-xs">
                  {ag.hora} - {ag.clienteNome}
                </span>
              }
            />
          );
        })}
        {agendamentosData.length > 3 && (
          <div className="text-xs text-muted-foreground">
            +{agendamentosData.length - 3} mais
          </div>
        )}
      </div>
    );
  };

  const onDateSelect = (value: Dayjs) => {
    setSelectedDate(value);
  };

  const novoAgendamento = () => {
    setEditingAgendamento(null);
    form.resetFields();
    form.setFieldsValue({
      data: selectedDate,
      status: "agendado",
    });
    setModalVisible(true);
  };

  const editarAgendamento = (agendamento: Agendamento) => {
    setEditingAgendamento(agendamento);
    form.setFieldsValue({
      ...agendamento,
      data: dayjs(agendamento.data),
      hora: dayjs(agendamento.hora, "HH:mm"),
    });
    setModalVisible(true);
  };

  const alterarStatus = (agendamentoId: string, novoStatus: string) => {
    message.success(
      `Status alterado para: ${getStatusConfig(novoStatus).text}`
    );
  };

  const verificarConflito = (
    funcionarioId: string,
    data: Dayjs,
    hora: Dayjs,
    duracao: number,
    agendamentoId?: string
  ) => {
    const agendamentosData = getAgendamentosPorData(data).filter(
      (ag) =>
        ag.funcionarioId === funcionarioId &&
        ag.id !== agendamentoId &&
        ag.status !== "cancelado"
    );

    const horaInicio = hora.hour() * 60 + hora.minute();
    const horaFim = horaInicio + duracao;

    return agendamentosData.some((ag) => {
      const agHoraInicio =
        parseInt(ag.hora.split(":")[0]) * 60 + parseInt(ag.hora.split(":")[1]);
      const agHoraFim = agHoraInicio + ag.duracao;
      return horaInicio < agHoraFim && horaFim > agHoraInicio;
    });
  };

  const handleSubmit = (values: any) => {
    const servico = servicos.find((s) => s.id === values.servicoId);

    if (servico) {
      const temConflito = verificarConflito(
        values.funcionarioId,
        values.data,
        values.hora,
        servico.duracao,
        editingAgendamento?.id
      );

      if (temConflito) {
        message.error(
          "Conflito de horário! Este funcionário já possui agendamento neste horário."
        );
        return;
      }
    }

    message.success(
      editingAgendamento ? "Agendamento atualizado!" : "Agendamento criado!"
    );
    setModalVisible(false);
    form.resetFields();
    setEditingAgendamento(null);
  };

  const agendamentosHoje = getAgendamentosPorData(selectedDate);

  return (
    <div className="space-y-6">
      <div>
        <Title level={2} className="!mb-2">
          Agendamentos
        </Title>
        <p className="text-muted-foreground">
          Gerencie agendamentos e horários do salão
        </p>
      </div>

      <Row gutter={[16, 16]}>
        {/* Calendário */}
        <Col xs={24} lg={16}>
          <Card
            title="📅 Calendário de Agendamentos"
            extra={
              <Button
                type="primary"
                icon={<Plus size={16} />}
                onClick={novoAgendamento}
                className="bg-salao-primary"
              >
                Novo Agendamento
              </Button>
            }
          >
            <Calendar
              value={selectedDate}
              onSelect={onDateSelect}
              cellRender={dateCellRender}
              className="agendamentos-calendar"
            />
          </Card>
        </Col>

        {/* Lista do Dia */}
        <Col xs={24} lg={8}>
          <Card
            title={`📋 ${selectedDate.format("DD/MM/YYYY")}`}
            extra={
              <Tag color="blue">{agendamentosHoje.length} agendamento(s)</Tag>
            }
          >
            {agendamentosHoje.length > 0 ? (
              <List
                dataSource={agendamentosHoje}
                renderItem={(item) => {
                  const statusConfig = getStatusConfig(item.status);
                  return (
                    <List.Item
                      className="border-b border-border last:border-b-0 py-3"
                      actions={[
                        <Button
                          type="text"
                          size="small"
                          onClick={() => editarAgendamento(item)}
                        >
                          Editar
                        </Button>,
                      ]}
                    >
                      <div className="w-full">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <Clock
                              size={14}
                              className="text-muted-foreground"
                            />
                            <span className="font-semibold">{item.hora}</span>
                          </div>
                          <Tag
                            color={statusConfig.color}
                            icon={statusConfig.icon}
                          >
                            {statusConfig.text}
                          </Tag>
                        </div>

                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2">
                            <User size={12} className="text-muted-foreground" />
                            <span className="font-medium">
                              {item.clienteNome}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Scissors
                              size={12}
                              className="text-muted-foreground"
                            />
                            <span>{item.servicoNome}</span>
                            <span className="text-muted-foreground">
                              ({item.duracao}min)
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <User size={12} className="text-muted-foreground" />
                            <span className="text-muted-foreground">
                              {item.funcionarioNome}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Phone
                                size={12}
                                className="text-muted-foreground"
                              />
                              <span className="text-muted-foreground">
                                {item.clienteTelefone}
                              </span>
                            </div>
                            <span className="font-semibold text-salao-primary">
                              R$ {item.preco.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {item.status === "agendado" && (
                          <div className="mt-3 flex gap-2">
                            <Button
                              size="small"
                              type="primary"
                              onClick={() =>
                                alterarStatus(item.id, "confirmado")
                              }
                              className="bg-salao-success"
                            >
                              Confirmar
                            </Button>
                            <Button
                              size="small"
                              onClick={() =>
                                alterarStatus(item.id, "em-andamento")
                              }
                            >
                              Iniciar
                            </Button>
                            <Button
                              size="small"
                              danger
                              onClick={() =>
                                alterarStatus(item.id, "cancelado")
                              }
                            >
                              Cancelar
                            </Button>
                          </div>
                        )}

                        {item.status === "confirmado" && (
                          <div className="mt-3 flex gap-2">
                            <Button
                              size="small"
                              type="primary"
                              onClick={() =>
                                alterarStatus(item.id, "em-andamento")
                              }
                            >
                              Iniciar Atendimento
                            </Button>
                          </div>
                        )}

                        {item.status === "em-andamento" && (
                          <div className="mt-3">
                            <Button
                              size="small"
                              type="primary"
                              onClick={() =>
                                alterarStatus(item.id, "concluido")
                              }
                              className="bg-salao-success"
                            >
                              Finalizar Atendimento
                            </Button>
                          </div>
                        )}
                      </div>
                    </List.Item>
                  );
                }}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon size={32} className="mx-auto mb-2 opacity-50" />
                <p>Nenhum agendamento para este dia</p>
                <Button
                  type="link"
                  onClick={novoAgendamento}
                  className="text-salao-primary"
                >
                  Criar primeiro agendamento
                </Button>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Modal de Cadastro/Edição */}
      <Modal
        title={editingAgendamento ? "Editar Agendamento" : "Novo Agendamento"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingAgendamento(null);
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Cliente"
                name="clienteId"
                rules={[{ required: true, message: "Selecione o cliente" }]}
              >
                <Select
                  placeholder="Selecionar cliente"
                  showSearch
                  filterOption={(input, option) =>
                    option?.label
                      ?.toString()
                      .toLowerCase()
                      .includes(input.toLowerCase()) ?? false
                  }
                  options={clientes.map((cliente) => ({
                    value: cliente.id,
                    label: `${cliente.nome} - ${cliente.telefone}`,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Serviço"
                name="servicoId"
                rules={[{ required: true, message: "Selecione o serviço" }]}
              >
                <Select placeholder="Selecionar serviço">
                  {servicos.map((servico) => (
                    <Option key={servico.id} value={servico.id}>
                      {servico.nome} - {servico.duracao}min - R${" "}
                      {servico.preco.toFixed(2)}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Funcionário"
            name="funcionarioId"
            rules={[{ required: true, message: "Selecione o funcionário" }]}
          >
            <Select placeholder="Selecionar funcionário">
              {funcionarios.map((funcionario) => (
                <Option key={funcionario.id} value={funcionario.id}>
                  {funcionario.nome} - {funcionario.especialidades.join(", ")}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Data"
                name="data"
                rules={[{ required: true, message: "Selecione a data" }]}
              >
                <Input type="date" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Horário"
                name="hora"
                rules={[{ required: true, message: "Selecione o horário" }]}
              >
                <TimePicker
                  format="HH:mm"
                  minuteStep={15}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Status"
            name="status"
            rules={[{ required: true, message: "Selecione o status" }]}
          >
            <Select placeholder="Status do agendamento">
              <Option value="agendado">Agendado</Option>
              <Option value="confirmado">Confirmado</Option>
              <Option value="em-andamento">Em Andamento</Option>
              <Option value="concluido">Concluído</Option>
              <Option value="cancelado">Cancelado</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Observações" name="observacoes">
            <TextArea
              rows={3}
              placeholder="Observações sobre o agendamento..."
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                className="bg-salao-primary"
              >
                {editingAgendamento ? "Atualizar" : "Criar"} Agendamento
              </Button>
              <Button
                onClick={() => {
                  setModalVisible(false);
                  form.resetFields();
                  setEditingAgendamento(null);
                }}
              >
                Cancelar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Agendamentos;
