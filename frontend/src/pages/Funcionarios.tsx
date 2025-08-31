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
  Select,
  Switch,
  Tag,
  Avatar,
  Tabs,
  InputNumber
} from 'antd';
import { 
  UserCheck, 
  Plus, 
  Search, 
  Edit,
  Phone,
  Mail,
  User,
  Percent,
  DollarSign
} from 'lucide-react';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const Funcionarios = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [comissaoModal, setComissaoModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [funcionarioComissao, setFuncionarioComissao] = useState<any>(null);
  const [busca, setBusca] = useState('');
  const [form] = Form.useForm();
  const [comissaoForm] = Form.useForm();

  // Mock data
  const funcionarios = [
    {
      id: '1',
      nome: 'Ana Silva',
      telefone: '(11) 99999-9999',
      email: 'ana.silva@salaox.com',
      funcao: 'Cabeleireira Senior',
      comissaoDefault: 30,
      ativo: true,
      dataCadastro: '2023-01-15',
      especialidades: ['Corte', 'Coloração', 'Escova']
    },
    {
      id: '2',
      nome: 'Maria Santos',
      telefone: '(11) 88888-8888',
      email: 'maria.santos@salaox.com',
      funcao: 'Manicure',
      comissaoDefault: 50,
      ativo: true,
      dataCadastro: '2023-02-20',
      especialidades: ['Manicure', 'Pedicure', 'Nail Art']
    },
    {
      id: '3',
      nome: 'Carla Oliveira',
      telefone: '(11) 77777-7777',
      email: 'carla.oliveira@salaox.com',
      funcao: 'Esteticista',
      comissaoDefault: 35,
      ativo: false,
      dataCadastro: '2023-03-10',
      especialidades: ['Limpeza de Pele', 'Hidratação', 'Massagem']
    }
  ];

  // Mock regras de comissão específicas
  const regrasComissao = [
    {
      id: '1',
      funcionarioId: '1',
      servicoTipo: 'Coloração',
      comissao: 25 // Diferente do padrão de 30%
    },
    {
      id: '2',
      funcionarioId: '1',
      servicoTipo: 'Escova Progressiva',
      comissao: 20
    },
    {
      id: '3',
      funcionarioId: '2',
      servicoTipo: 'Nail Art',
      comissao: 60 // Especialidade com comissão maior
    }
  ];

  const funcoes = [
    'Cabeleireira Senior',
    'Cabeleireira Junior',
    'Manicure',
    'Pedicure',
    'Esteticista',
    'Massoterapeuta',
    'Recepcionista',
    'Gerente'
  ];

  const tiposServico = [
    'Corte Feminino',
    'Corte Masculino',
    'Escova',
    'Coloração',
    'Escova Progressiva',
    'Manicure',
    'Pedicure',
    'Nail Art',
    'Limpeza de Pele',
    'Hidratação Facial',
    'Massagem'
  ];

  const funcionariosFiltrados = funcionarios.filter(funcionario =>
    funcionario.nome.toLowerCase().includes(busca.toLowerCase()) ||
    funcionario.funcao.toLowerCase().includes(busca.toLowerCase()) ||
    funcionario.telefone.includes(busca)
  );

  const columns = [
    {
      title: 'Funcionário',
      key: 'funcionario',
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
            <div className="text-sm text-muted-foreground">{record.funcao}</div>
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
            <Phone size={12} className="text-muted-foreground" />
            {record.telefone}
          </div>
          <div className="text-sm flex items-center gap-2">
            <Mail size={12} className="text-muted-foreground" />
            {record.email}
          </div>
        </div>
      )
    },
    {
      title: 'Especialidades',
      dataIndex: 'especialidades',
      key: 'especialidades',
      render: (especialidades: string[]) => (
        <div className="space-y-1">
          {especialidades.slice(0, 2).map((esp, index) => (
            <Tag key={index} color="blue">
              {esp}
            </Tag>
          ))}
          {especialidades.length > 2 && (
            <Tag color="default">
              +{especialidades.length - 2} mais
            </Tag>
          )}
        </div>
      )
    },
    {
      title: 'Comissão Padrão',
      dataIndex: 'comissaoDefault',
      key: 'comissaoDefault',
      render: (comissao: number) => (
        <div className="flex items-center gap-1">
          <Percent size={14} className="text-salao-accent" />
          <span className="font-semibold text-salao-accent">{comissao}%</span>
        </div>
      )
    },
    {
      title: 'Status',
      dataIndex: 'ativo',
      key: 'ativo',
      render: (ativo: boolean) => (
        <Tag color={ativo ? 'green' : 'red'}>
          {ativo ? 'Ativo' : 'Inativo'}
        </Tag>
      )
    },
    {
      title: 'Ações',
      key: 'acoes',
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="text"
            icon={<Edit size={14} />}
            onClick={() => editarFuncionario(record)}
          >
            Editar
          </Button>
          <Button
            type="text"
            icon={<Percent size={14} />}
            onClick={() => gerenciarComissao(record)}
          >
            Comissões
          </Button>
        </Space>
      )
    }
  ];

  const editarFuncionario = (funcionario: any) => {
    setEditingEmployee(funcionario);
    form.setFieldsValue(funcionario);
    setModalVisible(true);
  };

  const novoFuncionario = () => {
    setEditingEmployee(null);
    form.resetFields();
    form.setFieldsValue({ ativo: true, comissaoDefault: 30 });
    setModalVisible(true);
  };

  const gerenciarComissao = (funcionario: any) => {
    setFuncionarioComissao(funcionario);
    setComissaoModal(true);
  };

  const handleSubmit = (values: any) => {
    console.log('Funcionário salvo:', values);
    message.success(editingEmployee ? 'Funcionário atualizado!' : 'Funcionário cadastrado!');
    setModalVisible(false);
    form.resetFields();
    setEditingEmployee(null);
  };

  const handleComissaoSubmit = (values: any) => {
    console.log('Regra de comissão salva:', values);
    message.success('Regra de comissão atualizada!');
    comissaoForm.resetFields();
  };

  const regrasComissaoFuncionario = regrasComissao.filter(
    regra => regra.funcionarioId === funcionarioComissao?.id
  );

  const comissaoColumns = [
    {
      title: 'Tipo de Serviço',
      dataIndex: 'servicoTipo',
      key: 'servicoTipo'
    },
    {
      title: 'Comissão Específica',
      dataIndex: 'comissao',
      key: 'comissao',
      render: (comissao: number) => (
        <span className="font-semibold text-salao-accent">{comissao}%</span>
      )
    },
    {
      title: 'Ações',
      key: 'acoes',
      render: (_: any, record: any) => (
        <Button
          type="text"
          danger
          onClick={() => message.success('Regra removida!')}
        >
          Remover
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <Title level={2} className="!mb-2">Gestão de Funcionários</Title>
        <p className="text-muted-foreground">
          Cadastre funcionários e gerencie comissões
        </p>
      </div>

      {/* Filtros e Ações */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <Input
            placeholder="Buscar por nome, função ou telefone..."
            prefix={<Search size={16} />}
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="max-w-md"
          />
          <Button
            type="primary"
            icon={<Plus size={16} />}
            onClick={novoFuncionario}
            className="bg-salao-primary"
          >
            Novo Funcionário
          </Button>
        </div>
      </Card>

      {/* Tabela de Funcionários */}
      <Card title="👩‍💼 Lista de Funcionários">
        <Table
          dataSource={funcionariosFiltrados}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Modal de Cadastro/Edição */}
      <Modal
        title={editingEmployee ? 'Editar Funcionário' : 'Novo Funcionário'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingEmployee(null);
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
                label="Função/Cargo"
                name="funcao"
                rules={[{ required: true, message: 'Função é obrigatória' }]}
              >
                <Select placeholder="Selecionar função">
                  {funcoes.map(funcao => (
                    <Option key={funcao} value={funcao}>{funcao}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Telefone"
                name="telefone"
                rules={[{ required: true, message: 'Telefone é obrigatório' }]}
              >
                <Input placeholder="(11) 99999-9999" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: 'Email é obrigatório' },
                  { type: 'email', message: 'Email inválido' }
                ]}
              >
                <Input placeholder="funcionario@salaox.com" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Especialidades"
            name="especialidades"
          >
            <Select
              mode="multiple"
              placeholder="Selecionar especialidades"
              style={{ width: '100%' }}
            >
              {tiposServico.map(tipo => (
                <Option key={tipo} value={tipo}>{tipo}</Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Comissão Padrão (%)"
                name="comissaoDefault"
                rules={[{ required: true, message: 'Comissão é obrigatória' }]}
              >
                <InputNumber 
                  min={0} 
                  max={100}
                  style={{ width: '100%' }}
                  placeholder="30"
                  addonAfter="%"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Status"
                name="ativo"
                valuePropName="checked"
              >
                <Switch 
                  checkedChildren="Ativo" 
                  unCheckedChildren="Inativo"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit"
                className="bg-salao-primary"
              >
                {editingEmployee ? 'Atualizar' : 'Cadastrar'} Funcionário
              </Button>
              <Button onClick={() => {
                setModalVisible(false);
                form.resetFields();
                setEditingEmployee(null);
              }}>
                Cancelar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal de Gestão de Comissões */}
      <Modal
        title={`Comissões - ${funcionarioComissao?.nome}`}
        open={comissaoModal}
        onCancel={() => {
          setComissaoModal(false);
          setFuncionarioComissao(null);
          comissaoForm.resetFields();
        }}
        footer={null}
        width={700}
      >
        {funcionarioComissao && (
          <div className="space-y-6">
            {/* Informações do Funcionário */}
            <Card size="small" className="bg-muted">
              <div className="flex items-center justify-between">
                <div>
                  <Text strong>{funcionarioComissao.nome}</Text>
                  <div className="text-sm text-muted-foreground">
                    {funcionarioComissao.funcao}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Comissão Padrão</div>
                  <div className="font-semibold text-salao-accent">
                    {funcionarioComissao.comissaoDefault}%
                  </div>
                </div>
              </div>
            </Card>

            {/* Nova Regra de Comissão */}
            <Card title="➕ Nova Regra Específica" size="small">
              <Form
                form={comissaoForm}
                layout="inline"
                onFinish={handleComissaoSubmit}
                className="w-full"
              >
                <Form.Item
                  name="servicoTipo"
                  rules={[{ required: true, message: 'Selecione o tipo de serviço' }]}
                  className="flex-1"
                >
                  <Select placeholder="Tipo de Serviço" style={{ width: '100%' }}>
                    {tiposServico.map(tipo => (
                      <Option key={tipo} value={tipo}>{tipo}</Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  name="comissao"
                  rules={[{ required: true, message: 'Digite a comissão' }]}
                >
                  <InputNumber 
                    min={0} 
                    max={100}
                    placeholder="Comissão (%)"
                    addonAfter="%"
                  />
                </Form.Item>
                <Form.Item>
                  <Button 
                    type="primary" 
                    htmlType="submit"
                    className="bg-salao-primary"
                  >
                    Adicionar
                  </Button>
                </Form.Item>
              </Form>
            </Card>

            {/* Regras Específicas Existentes */}
            <Card title="📋 Regras Específicas" size="small">
              {regrasComissaoFuncionario.length > 0 ? (
                <Table
                  dataSource={regrasComissaoFuncionario}
                  columns={comissaoColumns}
                  rowKey="id"
                  pagination={false}
                  size="small"
                />
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  Nenhuma regra específica configurada.
                  <br />
                  <small>Este funcionário usará a comissão padrão para todos os serviços.</small>
                </div>
              )}
            </Card>

            {/* Informações sobre Cálculo */}
            <Card title="ℹ️ Como Funciona" size="small">
              <div className="text-sm space-y-2">
                <p>
                  <strong>Comissão Padrão:</strong> Aplicada a todos os serviços que não possuem regra específica.
                </p>
                <p>
                  <strong>Regras Específicas:</strong> Sobrescrevem a comissão padrão para tipos específicos de serviço.
                </p>
                <p className="text-muted-foreground">
                  Exemplo: Se a comissão padrão é 30% mas existe uma regra específica de 25% para "Coloração", 
                  todos os serviços de coloração deste funcionário terão comissão de 25%.
                </p>
              </div>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Funcionarios;