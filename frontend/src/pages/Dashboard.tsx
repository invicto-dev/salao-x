import { Card, Col, Row, Statistic, Table, Tag, Progress, Typography } from 'antd';
import { TrendingUp, TrendingDown, DollarSign, Users, Package, Calendar } from 'lucide-react';

const { Title } = Typography;

const Dashboard = () => {
  // Mock data para demonstração
  const kpis = [
    {
      title: 'Faturamento Hoje',
      value: 2850.50,
      prefix: 'R$',
      suffix: '',
      change: 12.5,
      icon: <DollarSign className="text-salao-success" size={24} />
    },
    {
      title: 'Clientes Atendidos',
      value: 24,
      suffix: 'hoje',
      change: 8.3,
      icon: <Users className="text-salao-primary" size={24} />
    },
    {
      title: 'Produtos Vendidos',
      value: 45,
      suffix: 'unidades',
      change: -3.2,
      icon: <Package className="text-salao-accent" size={24} />
    },
    {
      title: 'Agendamentos',
      value: 18,
      suffix: 'hoje',
      change: 15.7,
      icon: <Calendar className="text-salao-warning" size={24} />
    }
  ];

  const topServicos = [
    { nome: 'Corte Feminino', vendas: 15, receita: 750.00 },
    { nome: 'Escova', vendas: 12, receita: 360.00 },
    { nome: 'Coloração', vendas: 8, receita: 640.00 },
    { nome: 'Manicure', vendas: 10, receita: 250.00 },
    { nome: 'Pedicure', vendas: 8, receita: 200.00 }
  ];

  const topProdutos = [
    { nome: 'Shampoo Profissional', vendas: 8, receita: 240.00 },
    { nome: 'Condicionador', vendas: 6, receita: 180.00 },
    { nome: 'Máscara Hidratante', vendas: 4, receita: 160.00 },
    { nome: 'Óleo Capilar', vendas: 5, receita: 125.00 },
    { nome: 'Finalizador', vendas: 3, receita: 90.00 }
  ];

  const comissoesAPagar = [
    { funcionario: 'Ana Silva', valor: 285.50, servicos: 12 },
    { funcionario: 'Maria Santos', valor: 195.75, servicos: 8 },
    { funcionario: 'Carla Oliveira', valor: 125.25, servicos: 5 },
    { funcionario: 'Julia Costa', valor: 98.50, servicos: 4 }
  ];

  const servicosColumns = [
    {
      title: 'Serviço',
      dataIndex: 'nome',
      key: 'nome',
    },
    {
      title: 'Vendas',
      dataIndex: 'vendas',
      key: 'vendas',
      render: (value: number) => <Tag color="blue">{value}</Tag>
    },
    {
      title: 'Receita',
      dataIndex: 'receita',
      key: 'receita',
      render: (value: number) => `R$ ${value.toFixed(2)}`
    }
  ];

  const produtosColumns = [
    {
      title: 'Produto',
      dataIndex: 'nome',
      key: 'nome',
    },
    {
      title: 'Vendas',
      dataIndex: 'vendas',
      key: 'vendas',
      render: (value: number) => <Tag color="green">{value}</Tag>
    },
    {
      title: 'Receita',
      dataIndex: 'receita',
      key: 'receita',
      render: (value: number) => `R$ ${value.toFixed(2)}`
    }
  ];

  const comissoesColumns = [
    {
      title: 'Funcionário',
      dataIndex: 'funcionario',
      key: 'funcionario',
    },
    {
      title: 'Serviços',
      dataIndex: 'servicos',
      key: 'servicos',
      render: (value: number) => <Tag color="purple">{value}</Tag>
    },
    {
      title: 'Comissão',
      dataIndex: 'valor',
      key: 'valor',
      render: (value: number) => (
        <span className="font-semibold text-salao-success">
          R$ {value.toFixed(2)}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <Title level={2} className="!mb-2">Dashboard</Title>
        <p className="text-muted-foreground">
          Visão geral do seu salão de beleza
        </p>
      </div>

      {/* KPIs */}
      <Row gutter={[16, 16]}>
        {kpis.map((kpi, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Statistic
                    title={kpi.title}
                    value={kpi.value}
                    prefix={kpi.prefix}
                    suffix={kpi.suffix}
                    precision={kpi.prefix === 'R$' ? 2 : 0}
                  />
                  <div className="flex items-center mt-2 text-sm">
                    {kpi.change > 0 ? (
                      <TrendingUp size={14} className="text-salao-success mr-1" />
                    ) : (
                      <TrendingDown size={14} className="text-salao-error mr-1" />
                    )}
                    <span className={kpi.change > 0 ? 'text-salao-success' : 'text-salao-error'}>
                      {Math.abs(kpi.change)}%
                    </span>
                    <span className="text-muted-foreground ml-1">vs ontem</span>
                  </div>
                </div>
                <div className="ml-4">
                  {kpi.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Charts e Tabelas */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="🏆 Top Serviços do Dia" className="h-full">
            <Table
              dataSource={topServicos}
              columns={servicosColumns}
              pagination={false}
              size="small"
              rowKey="nome"
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="📦 Top Produtos Vendidos" className="h-full">
            <Table
              dataSource={topProdutos}
              columns={produtosColumns}
              pagination={false}
              size="small"
              rowKey="nome"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="💰 Comissões a Pagar" className="h-full">
            <Table
              dataSource={comissoesAPagar}
              columns={comissoesColumns}
              pagination={false}
              size="small"
              rowKey="funcionario"
            />
            <div className="mt-4 p-3 bg-salao-primary-light rounded-lg">
              <div className="text-sm text-muted-foreground">Total de comissões</div>
              <div className="text-lg font-semibold text-salao-primary">
                R$ {comissoesAPagar.reduce((acc, item) => acc + item.valor, 0).toFixed(2)}
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="📊 Meta Mensal" className="h-full">
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Faturamento</span>
                  <span className="text-sm text-muted-foreground">
                    R$ 45.650 / R$ 60.000
                  </span>
                </div>
                <Progress percent={76} strokeColor="#7c3aed" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Clientes Atendidos</span>
                  <span className="text-sm text-muted-foreground">
                    387 / 500
                  </span>
                </div>
                <Progress percent={77} strokeColor="#ec4899" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Produtos Vendidos</span>
                  <span className="text-sm text-muted-foreground">
                    645 / 800
                  </span>
                </div>
                <Progress percent={81} strokeColor="#059669" />
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;