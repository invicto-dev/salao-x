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
  InputNumber,
  Select,
  Statistic,
  Tag,
  Avatar,
  List,
  Progress
} from 'antd';
import { 
  Gift, 
  Plus, 
  Search, 
  Edit,
  User,
  Award,
  TrendingUp,
  Star,
  Settings
} from 'lucide-react';

const { Title, Text } = Typography;
const { Option } = Select;

const Fidelidade = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [configModal, setConfigModal] = useState(false);
  const [resgateModal, setResgateModal] = useState(false);
  const [busca, setBusca] = useState('');
  const [form] = Form.useForm();
  const [configForm] = Form.useForm();
  const [resgateForm] = Form.useForm();

  // Mock data - Configurações do programa
  const configuracao = {
    pontosParaReal: 10, // 10 pontos = R$ 1,00
    realParaPonto: 1, // R$ 1,00 = 1 ponto
    descontoMaximo: 50, // Máximo 50% de desconto
    ativo: true
  };

  // Mock data - Clientes com pontos
  const clientesComPontos = [
    {
      id: '1',
      nome: 'Ana Silva',
      telefone: '(11) 99999-9999',
      pontos: 250,
      totalGasto: 2500.00,
      ultimaCompra: '2024-01-20',
      nivel: 'VIP'
    },
    {
      id: '2',
      nome: 'Maria Santos',
      telefone: '(11) 88888-8888',
      pontos: 180,
      totalGasto: 1800.00,
      ultimaCompra: '2024-01-18',
      nivel: 'Gold'
    },
    {
      id: '3',
      nome: 'Carla Oliveira',
      telefone: '(11) 77777-7777',
      pontos: 95,
      totalGasto: 950.00,
      ultimaCompra: '2024-01-15',
      nivel: 'Silver'
    },
    {
      id: '4',
      nome: 'Julia Costa',
      telefone: '(11) 66666-6666',
      pontos: 45,
      totalGasto: 450.00,
      ultimaCompra: '2024-01-10',
      nivel: 'Bronze'
    }
  ];

  // Mock data - Histórico de pontos
  const historicoPontos = [
    {
      id: '1',
      clienteId: '1',
      clienteNome: 'Ana Silva',
      tipo: 'acumulo',
      pontos: 15,
      valor: 150.00,
      data: '2024-01-20',
      descricao: 'Compra - Corte + Escova'
    },
    {
      id: '2',
      clienteId: '2',
      clienteNome: 'Maria Santos',
      tipo: 'resgate',
      pontos: -20,
      valor: 20.00,
      data: '2024-01-18',
      descricao: 'Desconto aplicado em compra'
    },
    {
      id: '3',
      clienteId: '1',
      clienteNome: 'Ana Silva',
      tipo: 'acumulo',
      pontos: 8,
      valor: 80.00,
      data: '2024-01-15',
      descricao: 'Compra - Coloração'
    }
  ];

  const getNivel = (pontos: number) => {
    if (pontos >= 200) return { nome: 'VIP', cor: 'purple' };
    if (pontos >= 150) return { nome: 'Gold', cor: 'gold' };
    if (pontos >= 100) return { nome: 'Silver', cor: 'default' };
    return { nome: 'Bronze', cor: 'orange' };
  };

  const calcularDesconto = (pontos: number) => {
    return (pontos / configuracao.pontosParaReal).toFixed(2);
  };

  const clientesFiltrados = clientesComPontos.filter(cliente =>
    cliente.nome.toLowerCase().includes(busca.toLowerCase()) ||
    cliente.telefone.includes(busca)
  );

  const columns = [
    {
      title: 'Cliente',
      key: 'cliente',
      render: (_: any, record: any) => {
        const nivel = getNivel(record.pontos);
        return (
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
                <Tag color={nivel.cor}>
                  {nivel.nome}
                </Tag>
                {record.telefone}
              </div>
            </div>
          </div>
        );
      }
    },
    {
      title: 'Pontos',
      dataIndex: 'pontos',
      key: 'pontos',
      render: (pontos: number) => (
        <div className="text-center">
          <div className="font-semibold text-salao-accent text-lg">
            {pontos}
          </div>
          <div className="text-xs text-muted-foreground">
            ≈ R$ {calcularDesconto(pontos)}
          </div>
        </div>
      )
    },
    {
      title: 'Total Gasto',
      dataIndex: 'totalGasto',
      key: 'totalGasto',
      render: (valor: number) => (
        <span className="font-semibold text-salao-success">
          R$ {valor.toFixed(2)}
        </span>
      )
    },
    {
      title: 'Última Compra',
      dataIndex: 'ultimaCompra',
      key: 'ultimaCompra',
      render: (data: string) => new Date(data).toLocaleDateString('pt-BR')
    },
    {
      title: 'Ações',
      key: 'acoes',
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="text"
            icon={<Gift size={14} />}
            onClick={() => abrirResgate(record)}
          >
            Resgatar
          </Button>
          <Button
            type="text"
            icon={<Plus size={14} />}
            onClick={() => adicionarPontos(record)}
          >
            Adicionar
          </Button>
        </Space>
      )
    }
  ];

  const historicoColumns = [
    {
      title: 'Data',
      dataIndex: 'data',
      key: 'data',
      render: (data: string) => new Date(data).toLocaleDateString('pt-BR')
    },
    {
      title: 'Cliente',
      dataIndex: 'clienteNome',
      key: 'clienteNome'
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo',
      key: 'tipo',
      render: (tipo: string) => (
        <Tag color={tipo === 'acumulo' ? 'green' : 'blue'}>
          {tipo === 'acumulo' ? 'Acúmulo' : 'Resgate'}
        </Tag>
      )
    },
    {
      title: 'Pontos',
      dataIndex: 'pontos',
      key: 'pontos',
      render: (pontos: number) => (
        <span className={pontos > 0 ? 'text-salao-success' : 'text-salao-primary'}>
          {pontos > 0 ? '+' : ''}{pontos}
        </span>
      )
    },
    {
      title: 'Valor',
      dataIndex: 'valor',
      key: 'valor',
      render: (valor: number) => `R$ ${valor.toFixed(2)}`
    },
    {
      title: 'Descrição',
      dataIndex: 'descricao',
      key: 'descricao'
    }
  ];

  const adicionarPontos = (cliente: any) => {
    form.setFieldsValue({ 
      clienteId: cliente.id,
      clienteNome: cliente.nome,
      tipo: 'acumulo'
    });
    setModalVisible(true);
  };

  const abrirResgate = (cliente: any) => {
    resgateForm.setFieldsValue({
      clienteId: cliente.id,
      clienteNome: cliente.nome,
      pontosDisponiveis: cliente.pontos,
      maxDesconto: calcularDesconto(cliente.pontos)
    });
    setResgateModal(true);
  };

  const handleSubmit = (values: any) => {
    console.log('Movimentação de pontos:', values);
    message.success('Pontos processados com sucesso!');
    setModalVisible(false);
    form.resetFields();
  };

  const handleResgate = (values: any) => {
    console.log('Resgate processado:', values);
    message.success(`Desconto de R$ ${values.valorDesconto} aplicado!`);
    setResgateModal(false);
    resgateForm.resetFields();
  };

  const handleConfigSubmit = (values: any) => {
    console.log('Configuração atualizada:', values);
    message.success('Configurações salvas com sucesso!');
    setConfigModal(false);
  };

  const totalPontosAtivos = clientesComPontos.reduce((acc, cliente) => acc + cliente.pontos, 0);
  const totalClientesAtivos = clientesComPontos.filter(c => c.pontos > 0).length;

  return (
    <div className="space-y-6">
      <div>
        <Title level={2} className="!mb-2">Programa de Fidelidade</Title>
        <p className="text-muted-foreground">
          Gerencie pontos e recompensas dos clientes
        </p>
      </div>

      {/* KPIs */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Clientes Ativos"
              value={totalClientesAtivos}
              prefix={<Award className="text-salao-primary" size={20} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total de Pontos"
              value={totalPontosAtivos}
              prefix={<Star className="text-salao-accent" size={20} />}
              valueStyle={{ color: '#ec4899' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Valor em Pontos"
              value={parseFloat(calcularDesconto(totalPontosAtivos))}
              prefix="R$"
              precision={2}
              valueStyle={{ color: '#059669' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Conversão"
              value={`R$ 1 = ${configuracao.realParaPonto} pt`}
              prefix={<TrendingUp className="text-salao-warning" size={20} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Filtros e Ações */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <Input
            placeholder="Buscar cliente por nome ou telefone..."
            prefix={<Search size={16} />}
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="max-w-md"
          />
          <Space>
            <Button
              icon={<Settings size={16} />}
              onClick={() => {
                configForm.setFieldsValue(configuracao);
                setConfigModal(true);
              }}
            >
              Configurações
            </Button>
            <Button
              type="primary"
              icon={<Plus size={16} />}
              onClick={() => setModalVisible(true)}
              className="bg-salao-primary"
            >
              Movimentar Pontos
            </Button>
          </Space>
        </div>
      </Card>

      {/* Ranking de Clientes */}
      <Card title="🏆 Ranking de Fidelidade">
        <Table
          dataSource={clientesFiltrados}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Histórico de Movimentações */}
      <Card title="📋 Histórico de Pontos">
        <Table
          dataSource={historicoPontos.slice(0, 10)}
          columns={historicoColumns}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Card>

      {/* Modal de Movimentação */}
      <Modal
        title="Movimentar Pontos"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            label="Cliente"
            name="clienteId"
            rules={[{ required: true, message: 'Selecione o cliente' }]}
          >
            <Select
              placeholder="Selecionar cliente"
              showSearch
              filterOption={(input, option) =>
                option?.label?.toString().toLowerCase().includes(input.toLowerCase()) ?? false
              }
              options={clientesComPontos.map(cliente => ({
                value: cliente.id,
                label: `${cliente.nome} - ${cliente.pontos} pontos`
              }))}
            />
          </Form.Item>

          <Form.Item
            label="Tipo de Movimentação"
            name="tipo"
            rules={[{ required: true, message: 'Selecione o tipo' }]}
          >
            <Select placeholder="Tipo de operação">
              <Option value="acumulo">Acúmulo de Pontos</Option>
              <Option value="resgate">Resgate de Pontos</Option>
              <Option value="ajuste">Ajuste Manual</Option>
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Quantidade de Pontos"
                name="pontos"
                rules={[{ required: true, message: 'Digite a quantidade' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Ex: 15"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Valor da Compra"
                name="valor"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  precision={2}
                  addonBefore="R$"
                  placeholder="0,00"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Descrição"
            name="descricao"
            rules={[{ required: true, message: 'Digite a descrição' }]}
          >
            <Input placeholder="Ex: Compra - Corte + Escova" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit"
                className="bg-salao-primary"
              >
                Processar
              </Button>
              <Button onClick={() => {
                setModalVisible(false);
                form.resetFields();
              }}>
                Cancelar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal de Resgate */}
      <Modal
        title="Resgatar Pontos"
        open={resgateModal}
        onCancel={() => {
          setResgateModal(false);
          resgateForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={resgateForm}
          layout="vertical"
          onFinish={handleResgate}
        >
          <div className="bg-salao-primary-light p-4 rounded-lg mb-4">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Pontos Disponíveis</div>
              <div className="text-2xl font-bold text-salao-primary">
                {resgateForm.getFieldValue('pontosDisponiveis')} pontos
              </div>
              <div className="text-sm text-muted-foreground">
                Máximo de desconto: R$ {resgateForm.getFieldValue('maxDesconto')}
              </div>
            </div>
          </div>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Pontos a Resgatar"
                name="pontosResgate"
                rules={[{ required: true, message: 'Digite os pontos' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  max={resgateForm.getFieldValue('pontosDisponiveis')}
                  min={1}
                  onChange={(value) => {
                    if (value) {
                      const desconto = (value / configuracao.pontosParaReal).toFixed(2);
                      resgateForm.setFieldValue('valorDesconto', desconto);
                    }
                  }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Valor do Desconto"
                name="valorDesconto"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  precision={2}
                  addonBefore="R$"
                  disabled
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
                Aplicar Desconto
              </Button>
              <Button onClick={() => {
                setResgateModal(false);
                resgateForm.resetFields();
              }}>
                Cancelar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal de Configurações */}
      <Modal
        title="Configurações do Programa"
        open={configModal}
        onCancel={() => setConfigModal(false)}
        footer={null}
      >
        <Form
          form={configForm}
          layout="vertical"
          onFinish={handleConfigSubmit}
        >
          <Form.Item
            label="Pontos por Real Gasto"
            name="realParaPonto"
            rules={[{ required: true, message: 'Configure a conversão' }]}
            help="Quantos pontos o cliente ganha para cada R$ 1,00 gasto"
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0.1}
              step={0.1}
              precision={1}
              addonAfter="pontos por R$ 1,00"
            />
          </Form.Item>

          <Form.Item
            label="Pontos para Desconto"
            name="pontosParaReal"
            rules={[{ required: true, message: 'Configure a conversão' }]}
            help="Quantos pontos equivalem a R$ 1,00 de desconto"
          >
            <InputNumber
              style={{ width: '100%' }}
              min={1}
              addonAfter="pontos = R$ 1,00"
            />
          </Form.Item>

          <Form.Item
            label="Desconto Máximo (%)"
            name="descontoMaximo"
            rules={[{ required: true, message: 'Configure o limite' }]}
            help="Máximo de desconto que pode ser aplicado em uma compra"
          >
            <InputNumber
              style={{ width: '100%' }}
              min={1}
              max={100}
              addonAfter="%"
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit"
                className="bg-salao-primary"
              >
                Salvar Configurações
              </Button>
              <Button onClick={() => setConfigModal(false)}>
                Cancelar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Fidelidade;