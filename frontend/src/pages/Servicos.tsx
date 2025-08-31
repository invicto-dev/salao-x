import { useState } from 'react';
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
  TimePicker
} from 'antd';
import { 
  Scissors, 
  Plus, 
  Search, 
  Edit,
  Eye,
  EyeOff,
  Clock
} from 'lucide-react';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const Servicos = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [busca, setBusca] = useState('');
  const [form] = Form.useForm();

  // Mock data
  const servicos = [
    {
      id: '1',
      nome: 'Corte Feminino',
      codigo: 'CORT001',
      categoria: 'Cabelo',
      preco: 50.00,
      duracao: 60,
      comissaoDefault: 30,
      ativo: true,
      descricao: 'Corte feminino personalizado',
    },
    {
      id: '2',
      nome: 'Escova Progressiva',
      codigo: 'ESC001',
      categoria: 'Cabelo',
      preco: 150.00,
      duracao: 180,
      comissaoDefault: 25,
      ativo: true,
      descricao: 'Escova progressiva para alisamento',
    },
    {
      id: '3',
      nome: 'Coloração Completa',
      codigo: 'COL001',
      categoria: 'Cabelo',
      preco: 80.00,
      duracao: 120,
      comissaoDefault: 25,
      ativo: true,
      descricao: 'Coloração completa do cabelo',
    },
    {
      id: '4',
      nome: 'Manicure Simples',
      codigo: 'MAN001',
      categoria: 'Unhas',
      preco: 25.00,
      duracao: 45,
      comissaoDefault: 50,
      ativo: true,
      descricao: 'Manicure simples com esmaltação',
    },
    {
      id: '5',
      nome: 'Pedicure Completa',
      codigo: 'PED001',
      categoria: 'Unhas',
      preco: 35.00,
      duracao: 60,
      comissaoDefault: 45,
      ativo: false,
      descricao: 'Pedicure completa com hidratação',
    }
  ];

  const categorias = ['Cabelo', 'Unhas', 'Pele', 'Maquiagem', 'Depilação', 'Massagem'];

  const servicosFiltrados = servicos.filter(servico => {
    const matchBusca = servico.nome.toLowerCase().includes(busca.toLowerCase()) || 
                      servico.codigo.toLowerCase().includes(busca.toLowerCase());
    const matchCategoria = !filtroCategoria || servico.categoria === filtroCategoria;
    const matchStatus = filtroStatus === '' || 
                       (filtroStatus === 'ativo' && servico.ativo) ||
                       (filtroStatus === 'inativo' && !servico.ativo);
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

  const columns = [
    {
      title: 'Serviço',
      key: 'servico',
      render: (_: any, record: any) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-salao-primary-light rounded-lg flex items-center justify-center">
            <Scissors size={20} className="text-salao-primary" />
          </div>
          <div>
            <div className="font-medium">{record.nome}</div>
            <div className="text-sm text-muted-foreground">
              {record.codigo} • {record.categoria}
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Preço',
      dataIndex: 'preco',
      key: 'preco',
      render: (preco: number) => (
        <div className="font-semibold text-salao-primary">
          R$ {preco.toFixed(2)}
        </div>
      )
    },
    {
      title: 'Duração',
      dataIndex: 'duracao',
      key: 'duracao',
      render: (duracao: number) => (
        <div className="flex items-center gap-1">
          <Clock size={14} className="text-muted-foreground" />
          <span>{formatDuracao(duracao)}</span>
        </div>
      )
    },
    {
      title: 'Comissão',
      dataIndex: 'comissaoDefault',
      key: 'comissaoDefault',
      render: (comissao: number) => (
        <Tag color="purple">{comissao}%</Tag>
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
            onClick={() => editarServico(record)}
          >
            Editar
          </Button>
          <Button
            type="text"
            icon={record.ativo ? <EyeOff size={14} /> : <Eye size={14} />}
            onClick={() => toggleStatus(record.id)}
          >
            {record.ativo ? 'Inativar' : 'Ativar'}
          </Button>
        </Space>
      )
    }
  ];

  const editarServico = (servico: any) => {
    setEditingService(servico);
    const formData = {
      ...servico,
      duracao: dayjs().startOf('day').add(servico.duracao, 'minute')
    };
    form.setFieldsValue(formData);
    setModalVisible(true);
  };

  const novoServico = () => {
    setEditingService(null);
    form.resetFields();
    form.setFieldsValue({ 
      ativo: true, 
      comissaoDefault: 30,
      duracao: dayjs().startOf('day').add(60, 'minute')
    });
    setModalVisible(true);
  };

  const toggleStatus = (id: string) => {
    message.success('Status alterado com sucesso!');
  };

  const handleSubmit = (values: any) => {
    // Converter duração de dayjs para minutos
    const duracaoMinutos = values.duracao.hour() * 60 + values.duracao.minute();
    const servicoData = {
      ...values,
      duracao: duracaoMinutos
    };
    
    console.log('Serviço salvo:', servicoData);
    message.success(editingService ? 'Serviço atualizado!' : 'Serviço criado!');
    setModalVisible(false);
    form.resetFields();
    setEditingService(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <Title level={2} className="!mb-2">Gestão de Serviços</Title>
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
              {categorias.map(cat => (
                <Option key={cat} value={cat}>{cat}</Option>
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
            className="bg-salao-primary"
          >
            Novo Serviço
          </Button>
        </div>
      </Card>

      {/* Tabela de Serviços */}
      <Card title="✂️ Lista de Serviços">
        <Table
          dataSource={servicosFiltrados}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Modal de Cadastro/Edição */}
      <Modal
        title={editingService ? 'Editar Serviço' : 'Novo Serviço'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingService(null);
        }}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Nome do Serviço"
                name="nome"
                rules={[{ required: true, message: 'Nome é obrigatório' }]}
              >
                <Input placeholder="Ex: Corte Feminino" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Código"
                name="codigo"
                rules={[{ required: true, message: 'Código é obrigatório' }]}
              >
                <Input placeholder="Ex: CORT001" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Categoria"
            name="categoria"
            rules={[{ required: true, message: 'Categoria é obrigatória' }]}
          >
            <Select placeholder="Selecionar categoria">
              {categorias.map(cat => (
                <Option key={cat} value={cat}>{cat}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Descrição"
            name="descricao"
          >
            <TextArea 
              rows={3} 
              placeholder="Descreva o serviço..."
            />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Preço"
                name="preco"
                rules={[{ required: true, message: 'Preço é obrigatório' }]}
              >
                <InputNumber 
                  min={0} 
                  precision={2} 
                  style={{ width: '100%' }}
                  addonBefore="R$"
                  placeholder="0,00"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Duração Estimada"
                name="duracao"
                rules={[{ required: true, message: 'Duração é obrigatória' }]}
              >
                <TimePicker
                  format="HH:mm"
                  placeholder="Selecionar duração"
                  style={{ width: '100%' }}
                  showNow={false}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
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
          </Row>

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

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit"
                className="bg-salao-primary"
              >
                {editingService ? 'Atualizar' : 'Criar'} Serviço
              </Button>
              <Button onClick={() => {
                setModalVisible(false);
                form.resetFields();
                setEditingService(null);
              }}>
                Cancelar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Servicos;