import { useState } from 'react';
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
  Statistic
} from 'antd';
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
  User
} from 'lucide-react';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;

const Clientes = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [detalhesModal, setDetalhesModal] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [clienteSelecionado, setClienteSelecionado] = useState<any>(null);
  const [busca, setBusca] = useState('');
  const [form] = Form.useForm();

  // Mock data
  const clientes = [
    {
      id: '1',
      nome: 'Ana Silva',
      telefone: '(11) 99999-9999',
      email: 'ana.silva@email.com',
      cpf: '123.456.789-00',
      aniversario: '1990-05-15',
      pontosFidelidade: 250,
      observacoes: 'Cliente VIP, prefere atendimento de manhã',
      dataCadastro: '2023-01-10',
      ultimoAtendimento: '2024-01-20'
    },
    {
      id: '2',
      nome: 'Maria Santos',
      telefone: '(11) 88888-8888',
      email: 'maria.santos@email.com',
      cpf: '987.654.321-00',
      aniversario: '1985-08-22',
      pontosFidelidade: 180,
      observacoes: 'Alérgica a produtos com amônia',
      dataCadastro: '2023-03-15',
      ultimoAtendimento: '2024-01-18'
    },
    {
      id: '3',
      nome: 'Carla Oliveira',
      telefone: '(11) 77777-7777',
      email: 'carla.oliveira@email.com',
      cpf: '',
      aniversario: '1992-12-03',
      pontosFidelidade: 95,
      observacoes: '',
      dataCadastro: '2023-06-20',
      ultimoAtendimento: '2024-01-15'
    }
  ];

  // Mock histórico de compras
  const historicoCompras = [
    {
      id: '1',
      data: '2024-01-20',
      servicos: ['Corte Feminino', 'Escova'],
      produtos: ['Shampoo Profissional'],
      valor: 105.90,
      funcionario: 'Ana Silva',
      pontos: 10
    },
    {
      id: '2',
      data: '2023-12-15',
      servicos: ['Coloração'],
      produtos: [],
      valor: 80.00,
      funcionario: 'Maria Santos',
      pontos: 8
    }
  ];

  // Mock agendamentos
  const agendamentos = [
    {
      id: '1',
      data: '2024-01-25',
      hora: '14:00',
      servico: 'Corte Feminino',
      funcionario: 'Ana Silva',
      status: 'agendado'
    },
    {
      id: '2',
      data: '2024-01-22',
      hora: '09:30',
      servico: 'Manicure',
      funcionario: 'Carla Oliveira',
      status: 'concluido'
    }
  ];

  const clientesFiltrados = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(busca.toLowerCase()) ||
    cliente.telefone.includes(busca) ||
    cliente.email.toLowerCase().includes(busca.toLowerCase())
  );

  const columns = [
    {
      title: 'Cliente',
      key: 'cliente',
      render: (_: any, record: any) => (
        <div className="flex items-center gap-3">
          <Avatar 
            size={40} 
            className="bg-salao-primary text-white"
            icon={<User size={20} />}
          >
            {record.nome.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
          </Avatar>
          <div>
            <div className="font-medium">{record.nome}</div>
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Phone size={12} />
              {record.telefone}
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Contato',
      key: 'contato',
      render: (_: any, record: any) => (
        <div className="space-y-1">
          <div className="text-sm flex items-center gap-2">
            <Mail size={12} className="text-muted-foreground" />
            {record.email}
          </div>
          {record.aniversario && (
            <div className="text-sm flex items-center gap-2">
              <Calendar size={12} className="text-muted-foreground" />
              {dayjs(record.aniversario).format('DD/MM')}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Fidelidade',
      key: 'fidelidade',
      render: (_: any, record: any) => (
        <div className="flex items-center gap-2">
          <Gift size={16} className="text-salao-accent" />
          <span className="font-semibold text-salao-accent">
            {record.pontosFidelidade} pts
          </span>
        </div>
      )
    },
    {
      title: 'Último Atendimento',
      dataIndex: 'ultimoAtendimento',
      key: 'ultimoAtendimento',
      render: (data: string) => dayjs(data).format('DD/MM/YYYY')
    },
    {
      title: 'Ações',
      key: 'acoes',
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="text"
            onClick={() => verDetalhes(record)}
          >
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
      )
    }
  ];

  const editarCliente = (cliente: any) => {
    setEditingClient(cliente);
    const formData = {
      ...cliente,
      aniversario: cliente.aniversario ? dayjs(cliente.aniversario) : null
    };
    form.setFieldsValue(formData);
    setModalVisible(true);
  };

  const novoCliente = () => {
    setEditingClient(null);
    form.resetFields();
    setModalVisible(true);
  };

  const verDetalhes = (cliente: any) => {
    setClienteSelecionado(cliente);
    setDetalhesModal(true);
  };

  const handleSubmit = (values: any) => {
    const clienteData = {
      ...values,
      aniversario: values.aniversario ? values.aniversario.format('YYYY-MM-DD') : null
    };
    
    console.log('Cliente salvo:', clienteData);
    message.success(editingClient ? 'Cliente atualizado!' : 'Cliente cadastrado!');
    setModalVisible(false);
    form.resetFields();
    setEditingClient(null);
  };

  const comprasColumns = [
    {
      title: 'Data',
      dataIndex: 'data',
      key: 'data',
      render: (data: string) => dayjs(data).format('DD/MM/YYYY')
    },
    {
      title: 'Serviços/Produtos',
      key: 'itens',
      render: (_: any, record: any) => (
        <div className="space-y-1">
          {record.servicos.map((servico: string, i: number) => (
            <Tag key={i} color="purple">{servico}</Tag>
          ))}
          {record.produtos.map((produto: string, i: number) => (
            <Tag key={i} color="blue">{produto}</Tag>
          ))}
        </div>
      )
    },
    {
      title: 'Valor',
      dataIndex: 'valor',
      key: 'valor',
      render: (valor: number) => `R$ ${valor.toFixed(2)}`
    },
    {
      title: 'Pontos',
      dataIndex: 'pontos',
      key: 'pontos',
      render: (pontos: number) => (
        <Tag color="gold">+{pontos} pts</Tag>
      )
    }
  ];

  const agendamentosColumns = [
    {
      title: 'Data/Hora',
      key: 'dataHora',
      render: (_: any, record: any) => (
        <div>
          <div>{dayjs(record.data).format('DD/MM/YYYY')}</div>
          <div className="text-sm text-muted-foreground">{record.hora}</div>
        </div>
      )
    },
    {
      title: 'Serviço',
      dataIndex: 'servico',
      key: 'servico'
    },
    {
      title: 'Funcionário',
      dataIndex: 'funcionario',
      key: 'funcionario'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'agendado' ? 'blue' : 'green'}>
          {status === 'agendado' ? 'Agendado' : 'Concluído'}
        </Tag>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <Title level={2} className="!mb-2">Gestão de Clientes</Title>
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
            className="bg-salao-primary"
          >
            Novo Cliente
          </Button>
        </div>
      </Card>

      {/* Tabela de Clientes */}
      <Card title="👥 Lista de Clientes">
        <Table
          dataSource={clientesFiltrados}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Modal de Cadastro/Edição */}
      <Modal
        title={editingClient ? 'Editar Cliente' : 'Novo Cliente'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingClient(null);
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Nome Completo"
                name="nome"
                rules={[{ required: true, message: 'Nome é obrigatório' }]}
              >
                <Input placeholder="Ex: Ana Silva" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Telefone"
                name="telefone"
                rules={[{ required: true, message: 'Telefone é obrigatório' }]}
              >
                <Input placeholder="(11) 99999-9999" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { type: 'email', message: 'Email inválido' }
                ]}
              >
                <Input placeholder="cliente@email.com" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="CPF (opcional)"
                name="cpf"
              >
                <Input placeholder="000.000.000-00" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Data de Aniversário"
            name="aniversario"
          >
            <DatePicker 
              placeholder="Selecionar data"
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
            />
          </Form.Item>

          <Form.Item
            label="Observações"
            name="observacoes"
          >
            <TextArea 
              rows={3} 
              placeholder="Observações sobre o cliente, preferências, alergias, etc."
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit"
                className="bg-salao-primary"
              >
                {editingClient ? 'Atualizar' : 'Cadastrar'} Cliente
              </Button>
              <Button onClick={() => {
                setModalVisible(false);
                form.resetFields();
                setEditingClient(null);
              }}>
                Cancelar
              </Button>
            </Space>
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
                    valueStyle={{ color: '#ec4899' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card size="small">
                  <Statistic
                    title="Cliente desde"
                    value={dayjs(clienteSelecionado.dataCadastro).format('DD/MM/YYYY')}
                    prefix={<Calendar className="text-salao-primary" size={16} />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card size="small">
                  <Statistic
                    title="Último Atendimento"
                    value={dayjs(clienteSelecionado.ultimoAtendimento).format('DD/MM/YYYY')}
                    prefix={<ShoppingBag className="text-salao-success" size={16} />}
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
                        {dayjs(clienteSelecionado.aniversario).format('DD/MM/YYYY')}
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