import { useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Table, 
  Select, 
  Input, 
  InputNumber, 
  Space, 
  Tag, 
  Divider, 
  Typography, 
  Radio, 
  message,
  Modal
} from 'antd';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  Search, 
  User, 
  CreditCard,
  Printer,
  Calculator
} from 'lucide-react';

const { Title, Text } = Typography;
const { Option } = Select;

interface CartItem {
  id: string;
  nome: string;
  tipo: 'produto' | 'servico';
  preco: number;
  quantidade: number;
  funcionario?: string;
  comissao?: number;
}

const PDV = () => {
  const [carrinho, setCarrinho] = useState<CartItem[]>([]);
  const [clienteSelecionado, setClienteSelecionado] = useState<string>('');
  const [formaPagamento, setFormaPagamento] = useState<string>('dinheiro');
  const [desconto, setDesconto] = useState<number>(0);
  const [busca, setBusca] = useState<string>('');
  const [reciboPrint, setReciboPrint] = useState(false);

  // Mock data
  const produtos = [
    { id: '1', nome: 'Shampoo Profissional', preco: 29.90, estoque: 15 },
    { id: '2', nome: 'Condicionador', preco: 25.90, estoque: 12 },
    { id: '3', nome: 'Máscara Hidratante', preco: 45.90, estoque: 8 },
    { id: '4', nome: 'Óleo Capilar', preco: 35.90, estoque: 5 },
  ];

  const servicos = [
    { id: '5', nome: 'Corte Feminino', preco: 50.00, duracao: 60, comissao: 30 },
    { id: '6', nome: 'Escova', preco: 30.00, duracao: 45, comissao: 40 },
    { id: '7', nome: 'Coloração', preco: 80.00, duracao: 120, comissao: 25 },
    { id: '8', nome: 'Manicure', preco: 25.00, duracao: 45, comissao: 50 },
  ];

  const clientes = [
    { id: '1', nome: 'Ana Silva', telefone: '(11) 99999-9999' },
    { id: '2', nome: 'Maria Santos', telefone: '(11) 88888-8888' },
    { id: '3', nome: 'Carla Oliveira', telefone: '(11) 77777-7777' },
  ];

  const funcionarios = [
    { id: '1', nome: 'Ana Silva' },
    { id: '2', nome: 'Maria Santos' },
    { id: '3', nome: 'Carla Oliveira' },
  ];

  const adicionarAoCarrinho = (item: any, tipo: 'produto' | 'servico') => {
    const novoItem: CartItem = {
      id: item.id,
      nome: item.nome,
      tipo,
      preco: item.preco,
      quantidade: 1,
      comissao: tipo === 'servico' ? item.comissao : undefined
    };

    const itemExistente = carrinho.find(c => c.id === item.id && c.tipo === tipo);
    
    if (itemExistente && tipo === 'produto') {
      setCarrinho(carrinho.map(c => 
        c.id === item.id && c.tipo === tipo 
          ? { ...c, quantidade: c.quantidade + 1 }
          : c
      ));
    } else {
      setCarrinho([...carrinho, novoItem]);
    }
  };

  const removerDoCarrinho = (index: number) => {
    setCarrinho(carrinho.filter((_, i) => i !== index));
  };

  const alterarQuantidade = (index: number, novaQuantidade: number) => {
    if (novaQuantidade <= 0) {
      removerDoCarrinho(index);
      return;
    }
    
    setCarrinho(carrinho.map((item, i) => 
      i === index ? { ...item, quantidade: novaQuantidade } : item
    ));
  };

  const alterarFuncionario = (index: number, funcionarioId: string) => {
    setCarrinho(carrinho.map((item, i) => 
      i === index ? { ...item, funcionario: funcionarioId } : item
    ));
  };

  const calcularSubtotal = () => {
    return carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
  };

  const calcularTotal = () => {
    const subtotal = calcularSubtotal();
    return subtotal - (subtotal * desconto / 100);
  };

  const calcularComissaoTotal = () => {
    return carrinho
      .filter(item => item.tipo === 'servico' && item.comissao)
      .reduce((acc, item) => acc + ((item.preco * item.quantidade) * (item.comissao || 0) / 100), 0);
  };

  const finalizarVenda = () => {
    if (carrinho.length === 0) {
      message.error('Carrinho vazio!');
      return;
    }

    if (!clienteSelecionado) {
      message.error('Selecione um cliente!');
      return;
    }

    // Verificar se serviços têm funcionários
    const servicosSemFuncionario = carrinho.filter(item => 
      item.tipo === 'servico' && !item.funcionario
    );

    if (servicosSemFuncionario.length > 0) {
      message.error('Selecione funcionários para todos os serviços!');
      return;
    }

    message.success('Venda finalizada com sucesso!');
    setReciboPrint(true);
  };

  const limparCarrinho = () => {
    setCarrinho([]);
    setClienteSelecionado('');
    setDesconto(0);
    setFormaPagamento('dinheiro');
  };

  const carrinhoColumns = [
    {
      title: 'Item',
      dataIndex: 'nome',
      key: 'nome',
      render: (text: string, record: CartItem) => (
        <div>
          <div className="font-medium">{text}</div>
          <Tag color={record.tipo === 'produto' ? 'blue' : 'purple'}>
            {record.tipo === 'produto' ? 'Produto' : 'Serviço'}
          </Tag>
        </div>
      )
    },
    {
      title: 'Preço Unit.',
      dataIndex: 'preco',
      key: 'preco',
      render: (preco: number) => `R$ ${preco.toFixed(2)}`
    },
    {
      title: 'Qtd.',
      key: 'quantidade',
      render: (_: any, record: CartItem, index: number) => (
        <div className="flex items-center gap-2">
          <Button
            size="small"
            icon={<Minus size={12} />}
            onClick={() => alterarQuantidade(index, record.quantidade - 1)}
          />
          <span className="w-8 text-center">{record.quantidade}</span>
          <Button
            size="small"
            icon={<Plus size={12} />}
            onClick={() => alterarQuantidade(index, record.quantidade + 1)}
          />
        </div>
      )
    },
    {
      title: 'Funcionário',
      key: 'funcionario',
      render: (_: any, record: CartItem, index: number) => (
        record.tipo === 'servico' ? (
          <Select
            placeholder="Selecionar"
            style={{ width: 120 }}
            size="small"
            value={record.funcionario}
            onChange={(value) => alterarFuncionario(index, value)}
          >
            {funcionarios.map(func => (
              <Option key={func.id} value={func.id}>
                {func.nome}
              </Option>
            ))}
          </Select>
        ) : '-'
      )
    },
    {
      title: 'Total',
      key: 'total',
      render: (_: any, record: CartItem) => (
        <span className="font-semibold">
          R$ {(record.preco * record.quantidade).toFixed(2)}
        </span>
      )
    },
    {
      title: 'Ações',
      key: 'acoes',
      render: (_: any, record: CartItem, index: number) => (
        <Button
          type="text"
          danger
          icon={<Trash2 size={14} />}
          onClick={() => removerDoCarrinho(index)}
        />
      )
    }
  ];

  const filteredProdutos = produtos.filter(produto =>
    produto.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const filteredServicos = servicos.filter(servico =>
    servico.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <Title level={2} className="!mb-2">PDV - Ponto de Venda</Title>
        <p className="text-muted-foreground">
          Sistema completo para vendas e atendimento
        </p>
      </div>

      <Row gutter={[16, 16]}>
        {/* Produtos e Serviços */}
        <Col xs={24} lg={14}>
          <Card title="Produtos e Serviços" className="h-full">
            <div className="mb-4">
              <Input
                placeholder="Buscar produtos ou serviços..."
                prefix={<Search size={16} />}
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              {/* Produtos */}
              {filteredProdutos.length > 0 && (
                <div>
                  <Title level={5} className="!mb-3">Produtos</Title>
                  <Row gutter={[8, 8]}>
                    {filteredProdutos.map(produto => (
                      <Col xs={12} sm={8} md={6} key={produto.id}>
                        <Card
                          size="small"
                          className="text-center cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => adicionarAoCarrinho(produto, 'produto')}
                        >
                          <div className="space-y-2">
                            <div className="font-medium text-sm">{produto.nome}</div>
                            <div className="text-salao-primary font-semibold">
                              R$ {produto.preco.toFixed(2)}
                            </div>
                            <Tag 
                              color={produto.estoque > 5 ? 'green' : 'orange'}
                            >
                              Estoque: {produto.estoque}
                            </Tag>
                          </div>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </div>
              )}

              {/* Serviços */}
              {filteredServicos.length > 0 && (
                <div>
                  <Title level={5} className="!mb-3">Serviços</Title>
                  <Row gutter={[8, 8]}>
                    {filteredServicos.map(servico => (
                      <Col xs={12} sm={8} md={6} key={servico.id}>
                        <Card
                          size="small"
                          className="text-center cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => adicionarAoCarrinho(servico, 'servico')}
                        >
                          <div className="space-y-2">
                            <div className="font-medium text-sm">{servico.nome}</div>
                            <div className="text-salao-primary font-semibold">
                              R$ {servico.preco.toFixed(2)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {servico.duracao}min | {servico.comissao}%
                            </div>
                          </div>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </div>
              )}
            </div>
          </Card>
        </Col>

        {/* Carrinho */}
        <Col xs={24} lg={10}>
          <Card 
            title={
              <div className="flex items-center gap-2">
                <ShoppingCart size={16} />
                Carrinho ({carrinho.length})
              </div>
            }
            className="h-full"
          >
            <div className="space-y-4">
              {/* Cliente */}
              <div>
                <Text strong className="block mb-2">Cliente</Text>
                <Select
                  placeholder="Selecionar cliente"
                  style={{ width: '100%' }}
                  value={clienteSelecionado}
                  onChange={setClienteSelecionado}
                  showSearch
                  filterOption={(input, option) =>
                    option?.label?.toString().toLowerCase().includes(input.toLowerCase()) ?? false
                  }
                >
                  {clientes.map(cliente => (
                    <Option key={cliente.id} value={cliente.id}>
                      {cliente.nome} - {cliente.telefone}
                    </Option>
                  ))}
                </Select>
              </div>

              {/* Itens do Carrinho */}
              <div>
                <Table
                  dataSource={carrinho}
                  columns={carrinhoColumns}
                  pagination={false}
                  size="small"
                  scroll={{ x: true }}
                  locale={{ emptyText: 'Carrinho vazio' }}
                />
              </div>

              {/* Desconto */}
              <div>
                <Text strong className="block mb-2">Desconto (%)</Text>
                <InputNumber
                  min={0}
                  max={100}
                  value={desconto}
                  onChange={(value) => setDesconto(value || 0)}
                  style={{ width: '100%' }}
                />
              </div>

              {/* Resumo */}
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>R$ {calcularSubtotal().toFixed(2)}</span>
                </div>
                {desconto > 0 && (
                  <div className="flex justify-between text-salao-success">
                    <span>Desconto ({desconto}%):</span>
                    <span>- R$ {(calcularSubtotal() * desconto / 100).toFixed(2)}</span>
                  </div>
                )}
                <Divider className="!my-2" />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span className="text-salao-primary">R$ {calcularTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Comissão Total:</span>
                  <span>R$ {calcularComissaoTotal().toFixed(2)}</span>
                </div>
              </div>

              {/* Forma de Pagamento */}
              <div>
                <Text strong className="block mb-2">Forma de Pagamento</Text>
                <Radio.Group
                  value={formaPagamento}
                  onChange={(e) => setFormaPagamento(e.target.value)}
                  className="w-full"
                >
                  <Space direction="vertical" className="w-full">
                    <Radio value="dinheiro">Dinheiro</Radio>
                    <Radio value="cartao">Cartão</Radio>
                    <Radio value="pix">PIX</Radio>
                    <Radio value="crediario">Crediário (Asaas)</Radio>
                  </Space>
                </Radio.Group>
              </div>

              {/* Ações */}
              <div className="space-y-2">
                <Button
                  type="primary"
                  block
                  icon={<CreditCard size={16} />}
                  onClick={finalizarVenda}
                  disabled={carrinho.length === 0}
                  className="bg-salao-primary"
                >
                  Finalizar Venda
                </Button>
                <Button
                  block
                  icon={<Trash2 size={16} />}
                  onClick={limparCarrinho}
                  disabled={carrinho.length === 0}
                >
                  Limpar Carrinho
                </Button>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Modal do Recibo */}
      <Modal
        title="Recibo de Venda"
        open={reciboPrint}
        onCancel={() => setReciboPrint(false)}
        footer={[
          <Button key="print" icon={<Printer size={16} />} onClick={() => window.print()}>
            Imprimir
          </Button>,
          <Button key="close" onClick={() => setReciboPrint(false)}>
            Fechar
          </Button>
        ]}
        width={400}
      >
        <div className="space-y-4 print:text-black">
          <div className="text-center">
            <Title level={4} className="!mb-1">Salão X</Title>
            <p className="text-sm">Recibo de Venda</p>
          </div>
          
          <Divider />
          
          <div>
            <p><strong>Cliente:</strong> {clientes.find(c => c.id === clienteSelecionado)?.nome}</p>
            <p><strong>Data:</strong> {new Date().toLocaleDateString('pt-BR')}</p>
            <p><strong>Hora:</strong> {new Date().toLocaleTimeString('pt-BR')}</p>
          </div>
          
          <Divider />
          
          <div className="space-y-2">
            {carrinho.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>{item.nome} x{item.quantidade}</span>
                <span>R$ {(item.preco * item.quantidade).toFixed(2)}</span>
              </div>
            ))}
          </div>
          
          <Divider />
          
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>R$ {calcularSubtotal().toFixed(2)}</span>
            </div>
            {desconto > 0 && (
              <div className="flex justify-between">
                <span>Desconto:</span>
                <span>R$ {(calcularSubtotal() * desconto / 100).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-lg">
              <span>Total:</span>
              <span>R$ {calcularTotal().toFixed(2)}</span>
            </div>
          </div>
          
          <div className="text-center text-sm text-muted-foreground mt-4">
            <p>Obrigado pela preferência!</p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PDV;