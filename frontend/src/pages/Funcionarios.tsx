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
  Select,
  Switch,
  Tag,
  Avatar,
  InputNumber,
  TableColumnsType,
} from "antd";
import {
  Plus,
  Search,
  Edit,
  Phone,
  Mail,
  User,
  Percent,
  Trash2,
} from "lucide-react";
import {
  useFuncionarioCreate,
  useFuncionarioDelete,
  useFuncionarios,
  useFuncionarioUpdate,
} from "@/hooks/use-funcionarios";
import { PhoneInput } from "@/components/inputs/PhoneInput";
import { NameInput } from "@/components/inputs/NameInput";
import DropdownComponent from "@/components/Dropdown";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "path";
import { formatRoleName } from "@/utils/formatRoleName";
import { hasPermission, hierarchyPositionCheck } from "@/utils/permissions";

const { Title, Text } = Typography;

const Funcionarios = () => {
  const { user } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [comissaoModal, setComissaoModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [funcionarioComissao, setFuncionarioComissao] = useState<any>(null);
  const [busca, setBusca] = useState("");
  const [form] = Form.useForm();
  const [comissaoForm] = Form.useForm();

  const {
    data: funcionarios,
    isLoading: isLoadingFuncionarios,
    isFetching: isFetchingFuncionarios,
  } = useFuncionarios();
  const { mutateAsync: createFuncionario } = useFuncionarioCreate();
  const { mutateAsync: updateFuncionario } = useFuncionarioUpdate();
  const { mutate: deleteFuncionario } = useFuncionarioDelete();

  // Mock regras de comissão específicas
  const regrasComissao = [
    {
      id: "1",
      funcionarioId: "1",
      servicoTipo: "Coloração",
      comissao: 25, // Diferente do padrão de 30%
    },
    {
      id: "2",
      funcionarioId: "1",
      servicoTipo: "Escova Progressiva",
      comissao: 20,
    },
    {
      id: "3",
      funcionarioId: "2",
      servicoTipo: "Nail Art",
      comissao: 60, // Especialidade com comissão maior
    },
  ];

  const funcionariosFiltrados = (funcionarios || []).filter(
    (funcionario) =>
      funcionario.nome.toLowerCase().includes(busca.toLowerCase()) ||
      funcionario.funcao.toLowerCase().includes(busca.toLowerCase()) ||
      funcionario.telefone.includes(busca)
  );

  const columns: TableColumnsType<Employee.Props> = [
    {
      title: "Funcionário",
      key: "funcionario",
      render: (_: any, record: any) => (
        <div className="flex items-center gap-3">
          <Avatar size={40} className="text-white" icon={<User size={20} />}>
            {record.nome
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .slice(0, 2)}
          </Avatar>
          <div>
            <div className="font-medium">{record.nome}</div>
            <div className="text-sm text-muted-foreground">{record.funcao}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Contato",
      key: "contato",
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
      ),
    },
    {
      title: "Comissão",
      dataIndex: "comissao",
      key: "comissao",
      align: "center",
      render: (comissao: number) => (
        <div className="flex items-center gap-1">
          <Percent size={14} className="text-salao-accent" />
          <span className="font-semibold text-salao-accent">{comissao}%</span>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "ativo",
      key: "ativo",
      align: "center",
      render: (ativo: boolean) => (
        <Tag color={ativo ? "green" : "red"}>{ativo ? "Ativo" : "Inativo"}</Tag>
      ),
    },
    {
      title: "Permissões",
      dataIndex: "role",
      key: "role",
      align: "center",
      render: (role: string) => (
        <Tag bordered={false}>{formatRoleName(role)}</Tag>
      ),
    },
    {
      title: "Ações",
      key: "acoes",
      align: "center",
      render: (_: any, record) => (
        <DropdownComponent
          menu={{
            items: [
              {
                key: "editar",
                icon: <Edit size={14} />,
                label: "Editar",
                onClick: () => editarFuncionario(record),
              },
              {
                key: "excluir",
                icon: <Trash2 size={14} />,
                label: "Excluir",
                onClick: () => deleteFuncionario(record.id),
                disabled:
                  record.role === "ROOT" ||
                  record.id === user.id ||
                  hierarchyPositionCheck(user.role, record.role),
              },
            ],
          }}
        />
      ),
    },
  ];

  const editarFuncionario = (funcionario: Employee.Props) => {
    setEditingEmployee(funcionario);
    form.setFieldsValue(funcionario);
    setModalVisible(true);
  };

  const novoFuncionario = () => {
    setEditingEmployee(null);
    form.resetFields();
    form.setFieldsValue({ ativo: true, comissao: 30, role: "FUNCIONARIO" });
    setModalVisible(true);
  };

  const gerenciarComissao = (funcionario: any) => {
    setFuncionarioComissao(funcionario);
    setComissaoModal(true);
  };

  const handleSubmit = async (body: any) => {
    if (!editingEmployee) {
      try {
        await createFuncionario(body);
        setModalVisible(false);
        form.resetFields();
      } catch (error) {
        console.error(error);
      }
    } else {
      try {
        await updateFuncionario({ id: editingEmployee.id, body });
        setModalVisible(false);
        form.resetFields();
        setEditingEmployee(null);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleComissaoSubmit = (values: any) => {
    console.log("Regra de comissão salva:", values);
    message.success("Regra de comissão atualizada!");
    comissaoForm.resetFields();
  };

  const regrasComissaoFuncionario = regrasComissao.filter(
    (regra) => regra.funcionarioId === funcionarioComissao?.id
  );

  const comissaoColumns = [
    {
      title: "Tipo de Serviço",
      dataIndex: "servicoTipo",
      key: "servicoTipo",
    },
    {
      title: "Comissão Específica",
      dataIndex: "comissao",
      key: "comissao",
      render: (comissao: number) => (
        <span className="font-semibold text-salao-accent">{comissao}%</span>
      ),
    },
    {
      title: "Ações",
      key: "acoes",
      render: () => (
        <Button
          disabled={true}
          type="text"
          danger
          onClick={() => message.success("Regra removida!")}
        >
          Remover
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Title level={2} className="!mb-2">
          Gestão de Funcionários
        </Title>
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
          >
            Novo Funcionário
          </Button>
        </div>
      </Card>

      {/* Tabela de Funcionários */}
      <Card title="Lista de Funcionários">
        <Table
          dataSource={funcionariosFiltrados.filter((f) => f.id !== user.id)}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          loading={isLoadingFuncionarios || isFetchingFuncionarios}
        />
      </Card>

      {/* Modal de Cadastro/Edição */}
      <Modal
        title={editingEmployee ? "Editar Funcionário" : "Novo Funcionário"}
        open={modalVisible}
        onOk={() => form.submit()}
        okText={editingEmployee ? "Atualizar" : "Cadastrar"}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingEmployee(null);
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
                <NameInput placeholder="Ex: Ana Silva" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Função/Cargo"
                name="funcao"
                rules={[{ required: true, message: "Função é obrigatória" }]}
              >
                <NameInput placeholder="Ex: Cabeleireira" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Telefone"
                name="telefone"
                rules={[{ required: true, message: "Telefone é obrigatório" }]}
              >
                <PhoneInput />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Email é obrigatório" },
                  { type: "email", message: "Email inválido" },
                ]}
              >
                <Input placeholder="funcionario@salaox.com" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Comissão Padrão (%)"
                name="comissao"
                rules={[{ required: true, message: "Comissão é obrigatória" }]}
              >
                <InputNumber
                  min={0}
                  max={100}
                  style={{ width: "100%" }}
                  placeholder="30"
                  addonAfter="%"
                />
              </Form.Item>
              <Form.Item label="Status" name="ativo" valuePropName="checked">
                <Switch
                  disabled={
                    !hasPermission(user?.role, "SECRETARIO") ||
                    (editingEmployee &&
                      hierarchyPositionCheck(user?.role, editingEmployee?.role))
                  }
                  checkedChildren="Ativo"
                  unCheckedChildren="Inativo"
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Permissão"
                name="role"
                rules={[{ required: true }]}
              >
                <Select
                  disabled={
                    !hasPermission(user?.role, "SECRETARIO") ||
                    (editingEmployee &&
                      hierarchyPositionCheck(user?.role, editingEmployee?.role))
                  }
                  options={[
                    {
                      label: "Administrador",
                      value: "ADMIN",
                      disabled: !hasPermission(user?.role, "ROOT"),
                    },
                    {
                      label: "Gerente",
                      value: "GERENTE",
                      disabled: !hasPermission(user?.role, "ADMIN"),
                    },
                    { label: "Secretário", value: "SECRETARIO" },
                    { label: "Funcionário", value: "FUNCIONARIO" },
                  ]}
                />
              </Form.Item>
              {!editingEmployee && (
                <Form.Item
                  label="Senha"
                  name="senha"
                  rules={[{ required: true }]}
                >
                  <Input.Password />
                </Form.Item>
              )}
            </Col>
          </Row>
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
                  <div className="text-sm text-muted-foreground">
                    Comissão Padrão
                  </div>
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
                  rules={[
                    { required: true, message: "Selecione o tipo de serviço" },
                  ]}
                  className="flex-1"
                >
                  <Select
                    placeholder="Tipo de Serviço"
                    style={{ width: "100%" }}
                  ></Select>
                </Form.Item>
                <Form.Item
                  name="comissao"
                  rules={[{ required: true, message: "Digite a comissão" }]}
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
                  <small>
                    Este funcionário usará a comissão padrão para todos os
                    serviços.
                  </small>
                </div>
              )}
            </Card>

            {/* Informações sobre Cálculo */}
            <Card title="ℹ️ Como Funciona" size="small">
              <div className="text-sm space-y-2">
                <p>
                  <strong>Comissão Padrão:</strong> Aplicada a todos os serviços
                  que não possuem regra específica.
                </p>
                <p>
                  <strong>Regras Específicas:</strong> Sobrescrevem a comissão
                  padrão para tipos específicos de serviço.
                </p>
                <p className="text-muted-foreground">
                  Exemplo: Se a comissão padrão é 30% mas existe uma regra
                  específica de 25% para "Coloração", todos os serviços de
                  coloração deste funcionário terão comissão de 25%.
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
