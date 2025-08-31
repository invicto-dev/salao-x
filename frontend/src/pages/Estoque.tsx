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
  Space,
  Typography,
  message,
  Statistic,
  Row,
  Col
} from 'antd';
import { 
  Package, 
  Plus, 
  Search, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Edit,
  RotateCcw
} from 'lucide-react';

const { Title } = Typography;
const { Option } = Select;

const Estoque = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [movimentacaoModal, setMovimentacaoModal] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [busca, setBusca] = useState('');
  const [form] = Form.useForm();

  // Mock data
  const produtos = [
    {
      id: '1',
      nome: 'Shampoo Profissional',
      categoria: 'Cabelo',
      estoque: 15,
      estoqueMinimo: 10,
      preco: 29.90,
      custo: 18.50,
      status: 'ativo'
    },
    {
      id: '2',
      nome: 'Condicionador',
      categoria: 'Cabelo',
      estoque: 8,
      estoqueMinimo: 10,
      preco: 25.90,
      custo: 15.20,
      status: 'ativo'
    },
    {
      id: '3',
      nome: 'Esmalte Vermelho',
      categoria: 'Unhas',
      estoque: 25,
      estoqueMinimo: 15,
      preco: 12.90,
      custo: 6.50,
      status: 'ativo'
    },
    {
      id: '4',
      nome: 'Creme Hidratante',
      categoria: 'Pele',
      estoque: 3,
      estoqueMinimo: 5,
      preco: 35.90,
      custo: 22.00,
      status: 'ativo'
    }
  ];

  const movimentacoes = [
    {
      id: '1',
      produto: 'Shampoo Profissional',
      tipo: 'entrada',
      quantidade: 20,
      data: '2024-01-15',
      motivo: 'Compra'
    },
    {
      id: '2',
      produto: 'Condicionador',
      tipo: 'saida',
      quantidade: 5,
      data: '2024-01-14',
      motivo: 'Venda'
    },
    {
      id: '3',
      produto: 'Esmalte Vermelho',
      tipo: 'ajuste',
      quantidade: -2,
      data: '2024-01-13',
      motivo: 'Quebra'
    }
  ];

  const categorias = ['Cabelo', 'Unhas', 'Pele', 'Maquiagem'];

  const getStatusEstoque = (estoque: number, minimo: number) => {
    if (estoque === 0) return { color: 'red', text: 'Sem estoque' };
    if (estoque <= minimo) return { color: 'orange', text: 'Estoque baixo' };
    return { color: 'green', text: 'Normal' };
  };

  const produtosFiltrados = produtos.filter(produto => {
    const matchBusca = produto.nome.toLowerCase().includes(busca.toLowerCase());
    const matchCategoria = !filtroCategoria || produto.categoria === filtroCategoria;
    return matchBusca && matchCategoria;
  });

  const produtosEstoqueBaixo = produtos.filter(p => p.estoque <= p.estoqueMinimo);

  const columns = [
    {
      title: 'Produto',
      dataIndex: 'nome',
      key: 'nome',
      render: (text: string, record: any) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-sm text-muted-foreground">{record.categoria}</div>
        </div>
      )
    },
    {
      title: 'Estoque Atual',
      dataIndex: 'estoque',
      key: 'estoque',
      render: (estoque: number, record: any) => {
        const status = getStatusEstoque(estoque, record.estoqueMinimo);
        return (
          <div>
            <div className="font-semibold">{estoque} un</div>
            <Tag color={status.color}>
              {status.text}
            </Tag>
          </div>
        );
      }
    },
    {
      title: 'Estoque Mínimo',
      dataIndex: 'estoqueMinimo',
      key: 'estoqueMinimo',
      render: (value: number) => `${value} un`
    },
    {
      title: 'Preço/Custo',
      key: 'preco',
      render: (_: any, record: any) => (
        <div>
          <div className="font-medium text-salao-primary">R$ {record.preco.toFixed(2)}</div>
          <div className="text-sm text-muted-foreground">Custo: R$ {record.custo.toFixed(2)}</div>
        </div>
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
            onClick={() => {
              form.setFieldsValue(record);
              setModalVisible(true);
            }}
          >
            Editar
          </Button>
          <Button
            type="text"
            icon={<RotateCcw size={14} />}
            onClick={() => setMovimentacaoModal(true)}
          >
            Movimentar
          </Button>
        </Space>
      )
    }
  ];

  const movimentacoesColumns = [
    {
      title: 'Data',
      dataIndex: 'data',
      key: 'data',
      render: (data: string) => new Date(data).toLocaleDateString('pt-BR')
    },
    {
      title: 'Produto',
      dataIndex: 'produto',
      key: 'produto'
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo',
      key: 'tipo',
      render: (tipo: string) => {
        const config = {
          entrada: { color: 'green', icon: <TrendingUp size={12} /> },
          saida: { color: 'red', icon: <TrendingDown size={12} /> },
          ajuste: { color: 'orange', icon: <RotateCcw size={12} /> }
        };
        const item = config[tipo as keyof typeof config];
        return (
          <Tag color={item.color} icon={item.icon}>
            {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
          </Tag>
        );
      }
    },
    {
      title: 'Quantidade',
      dataIndex: 'quantidade',
      key: 'quantidade',
      render: (qtd: number) => (
        <span className={qtd > 0 ? 'text-salao-success' : 'text-salao-error'}>
          {qtd > 0 ? '+' : ''}{qtd}
        </span>
      )
    },
    {
      title: 'Motivo',
      dataIndex: 'motivo',
      key: 'motivo'
    }
  ];

  const handleSubmit = (values: any) => {
    console.log('Produto salvo:', values);
    message.success('Produto atualizado com sucesso!');
    setModalVisible(false);
    form.resetFields();
  };

  return (
    <div className="space-y-6">
      <div>
        <Title level={2} className="!mb-2">Controle de Estoque</Title>
        <p className="text-muted-foreground">
          Gerencie o estoque de produtos do salão
        </p>
      </div>

      {/* KPIs */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total de Produtos"
              value={produtos.length}
              prefix={<Package className="text-salao-primary" size={20} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Estoque Baixo"
              value={produtosEstoqueBaixo.length}
              prefix={<AlertTriangle className="text-salao-warning" size={20} />}
              valueStyle={{ color: produtosEstoqueBaixo.length > 0 ? '#d97706' : undefined }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Valor Total em Estoque"
              value={produtos.reduce((acc, p) => acc + (p.estoque * p.custo), 0)}
              prefix="R$"
              precision={2}
              valueStyle={{ color: '#059669' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Produtos com Estoque Baixo */}
      {produtosEstoqueBaixo.length > 0 && (
        <Card title="⚠️ Produtos com Estoque Baixo" className="border-salao-warning">
          <div className="space-y-2">
            {produtosEstoqueBaixo.map(produto => (
              <div key={produto.id} className="flex justify-between items-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <div>
                  <div className="font-medium">{produto.nome}</div>
                  <div className="text-sm text-muted-foreground">
                    Estoque: {produto.estoque} / Mínimo: {produto.estoqueMinimo}
                  </div>
                </div>
                <Button type="primary" size="small" className="bg-salao-primary">
                  Repor Estoque
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Filtros e Ações */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-4 flex-1">
            <Input
              placeholder="Buscar produtos..."
              prefix={<Search size={16} />}
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="max-w-xs"
            />
            <Select
              placeholder="Filtrar por categoria"
              allowClear
              value={filtroCategoria}
              onChange={setFiltroCategoria}
              className="min-w-[150px]"
            >
              {categorias.map(cat => (
                <Option key={cat} value={cat}>{cat}</Option>
              ))}
            </Select>
          </div>
          <Space>
            <Button
              type="primary"
              icon={<Plus size={16} />}
              className="bg-salao-primary"
              onClick={() => setMovimentacaoModal(true)}
            >
              Nova Movimentação
            </Button>
          </Space>
        </div>
      </Card>

      {/* Tabela de Produtos */}
      <Card title="📦 Produtos em Estoque">
        <Table
          dataSource={produtosFiltrados}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Últimas Movimentações */}
      <Card title="📋 Últimas Movimentações">
        <Table
          dataSource={movimentacoes.slice(0, 5)}
          columns={movimentacoesColumns}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Card>

      {/* Modal de Edição */}
      <Modal
        title="Editar Produto"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
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
                label="Nome do Produto"
                name="nome"
                rules={[{ required: true, message: 'Nome é obrigatório' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Categoria"
                name="categoria"
                rules={[{ required: true, message: 'Categoria é obrigatória' }]}
              >
                <Select>
                  {categorias.map(cat => (
                    <Option key={cat} value={cat}>{cat}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Estoque Atual"
                name="estoque"
                rules={[{ required: true, message: 'Estoque é obrigatório' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Estoque Mínimo"
                name="estoqueMinimo"
                rules={[{ required: true, message: 'Estoque mínimo é obrigatório' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Preço de Venda"
                name="preco"
                rules={[{ required: true, message: 'Preço é obrigatório' }]}
              >
                <InputNumber 
                  min={0} 
                  precision={2} 
                  style={{ width: '100%' }}
                  addonBefore="R$"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" className="bg-salao-primary">
                Salvar
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

      {/* Modal de Movimentação */}
      <Modal
        title="Nova Movimentação de Estoque"
        open={movimentacaoModal}
        onCancel={() => setMovimentacaoModal(false)}
        footer={null}
      >
        <Form layout="vertical">
          <Form.Item label="Produto" required>
            <Select placeholder="Selecionar produto">
              {produtos.map(produto => (
                <Option key={produto.id} value={produto.id}>
                  {produto.nome} (Estoque atual: {produto.estoque})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Tipo de Movimentação" required>
            <Select placeholder="Selecionar tipo">
              <Option value="entrada">Entrada</Option>
              <Option value="saida">Saída</Option>
              <Option value="ajuste">Ajuste</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Quantidade" required>
            <InputNumber 
              style={{ width: '100%' }} 
              placeholder="Quantidade (use - para saída/ajuste negativo)"
            />
          </Form.Item>

          <Form.Item label="Motivo" required>
            <Select placeholder="Selecionar motivo">
              <Option value="compra">Compra</Option>
              <Option value="venda">Venda</Option>
              <Option value="quebra">Quebra</Option>
              <Option value="vencimento">Vencimento</Option>
              <Option value="ajuste">Ajuste de inventário</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                className="bg-salao-primary"
                onClick={() => {
                  message.success('Movimentação registrada com sucesso!');
                  setMovimentacaoModal(false);
                }}
              >
                Confirmar
              </Button>
              <Button onClick={() => setMovimentacaoModal(false)}>
                Cancelar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Estoque;