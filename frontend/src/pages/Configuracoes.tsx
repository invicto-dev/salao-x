import {
  Card,
  Form,
  Input,
  Button,
  Switch,
  Space,
  Typography,
  Row,
  Col,
  Divider,
  Select,
  InputNumber,
  Tabs,
  Statistic,
} from "antd";
import {
  Save,
  Building,
  Bell,
  Database,
  Upload as UploadIcon,
} from "lucide-react";
import {
  useConfiguracoes,
  useConfiguracoesUpdate,
} from "@/hooks/use-configuracoes";
import { useQuery } from "@tanstack/react-query";
import { getCurrencyCode } from "@/utils/getCurrencyCode";
import packageJson from "../../package.json";

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const Configuracoes = () => {
  const [form] = Form.useForm();
  const [notificacoesForm] = Form.useForm();
  const [sistemaForm] = Form.useForm();
  const { data, isLoading, isError } = useConfiguracoes();
  const { mutate: updateConfiguracoes, isPending } = useConfiguracoesUpdate();

  const { data: currencies = [] } = useQuery({
    queryKey: ["get-currencies"],
    queryFn: getCurrencyCode,
  });

  const onSave = (values: Salon.Config) => {
    updateConfiguracoes({
      id: data.id,
      body: values,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <Title level={2} className="!mb-2">
          Configurações
        </Title>
        <p className="text-muted-foreground">
          Gerencie as configurações do sistema e da empresa
        </p>
      </div>

      <Tabs defaultActiveKey="1" size="large">
        <TabPane
          tab={
            <span className="flex items-center gap-2">
              <Building size={14} />
              Empresa
            </span>
          }
          key="1"
        >
          <Card loading={isLoading} title="Informações da Empresa">
            <Form
              form={form}
              layout="vertical"
              initialValues={data}
              onFinish={onSave}
            >
              <Row gutter={16}>
                <Col xs={24} lg={16}>
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Nome da Empresa"
                        name="nomeEmpresa"
                        rules={[
                          { required: true, message: "Nome é obrigatório" },
                        ]}
                      >
                        <Input placeholder="Nome da empresa" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item label="CNPJ" name="cnpj">
                        <Input placeholder="00.000.000/0000-00" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item label="Endereço" name="endereco">
                    <Input placeholder="Rua, número" />
                  </Form.Item>

                  <Row gutter={16}>
                    <Col xs={24} sm={8}>
                      <Form.Item label="Bairro" name="bairro">
                        <Input placeholder="Bairro" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Form.Item label="Cidade" name="cidade">
                        <Input placeholder="Cidade" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Form.Item label="CEP" name="cep">
                        <Input placeholder="00000-000" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item label="Telefone" name="telefone">
                        <Input placeholder="(11) 3333-4444" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Email"
                        name="email"
                        rules={[{ type: "email", message: "Email inválido" }]}
                      >
                        <Input placeholder="contato@salaox.com" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item label="Site" name="site">
                    <Input placeholder="www.salaox.com" />
                  </Form.Item>
                </Col>

                {/* <Col xs={24} lg={8}>
                  <Form.Item label="Logo da Empresa">
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                      <Upload {...uploadProps}>
                        <div className="space-y-2">
                          <UploadIcon
                            size={32}
                            className="mx-auto text-muted-foreground"
                          />
                          <div className="text-sm">
                            Clique para fazer upload do logo
                          </div>
                          <div className="text-xs text-muted-foreground">
                            PNG, JPG até 2MB
                          </div>
                        </div>
                      </Upload>
                    </div>
                  </Form.Item>
                </Col> */}
              </Row>

              <Divider />

              {/* <Title level={4}>⏰ Horário de Funcionamento</Title>
                {
                  Object.keys(
                    data.horarioFuncionamento
                  ).map((dia) => {
                    return (
                      <Row gutter={16}>
                      <Col xs={24} sm={8} key={dia}>
                        <Text strong>{dia}</Text>
                        <div className="flex gap-2 mt-2">
                          <Form.Item
                            name={["horarioFuncionamento", dia, "inicio"]}
                          >
                            <Input placeholder="08:00" />
                          </Form.Item>
                          <span className="flex items-center">às</span>
                          <Form.Item
                            name={["horarioFuncionamento", dia, "fim"]}
                          >
                            <Input placeholder="18:00" />
                          </Form.Item>
                        </div>
                      </Col>
              </Row>
                    );
                  })
                } */}

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Intervalo Padrão (minutos)"
                    name="intervaloPadrao"
                    help="Tempo de intervalo entre agendamentos"
                  >
                    <InputNumber min={5} max={60} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Antecedência Mínima (minutos)"
                    name="antecedenciaMinima"
                    help="Tempo mínimo para agendar um serviço"
                  >
                    <InputNumber
                      min={15}
                      max={1440}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={isPending}>
                  Salvar Configurações da Empresa
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>

        <TabPane
          disabled={true}
          tab={
            <span className="flex items-center gap-2">
              <Bell size={14} />
              Notificações
            </span>
          }
          key="2"
        >
          <Card loading={isLoading} title="Configurações de Notificações">
            <Form
              form={notificacoesForm}
              layout="vertical"
              initialValues={data}
              onFinish={onSave}
            >
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Card size="small" title="Email">
                    <Space direction="vertical" className="w-full">
                      <Form.Item name="emailAtivo" valuePropName="checked">
                        <Switch
                          checkedChildren="Ativo"
                          unCheckedChildren="Inativo"
                        />
                        <Text className="ml-2">Notificações por email</Text>
                      </Form.Item>

                      <Form.Item label="Servidor SMTP" name="smtpServer">
                        <Input placeholder="smtp.gmail.com" />
                      </Form.Item>

                      <Form.Item label="Email de Envio" name="emailEnvio">
                        <Input placeholder="noreply@salaox.com" />
                      </Form.Item>
                    </Space>
                  </Card>
                </Col>

                <Col xs={24} sm={12}>
                  <Card size="small" title="💬 WhatsApp">
                    <Space direction="vertical" className="w-full">
                      <Form.Item name="whatsappAtivo" valuePropName="checked">
                        <Switch
                          checkedChildren="Ativo"
                          unCheckedChildren="Inativo"
                        />
                        <Text className="ml-2">Notificações por WhatsApp</Text>
                      </Form.Item>

                      <Form.Item label="Token da API" name="whatsappToken">
                        <Input.Password placeholder="Token do WhatsApp Business API" />
                      </Form.Item>

                      <Form.Item label="Número de Envio" name="whatsappNumero">
                        <Input placeholder="5511999999999" />
                      </Form.Item>
                    </Space>
                  </Card>
                </Col>
              </Row>

              <Divider />

              <Title level={4}> Tipos de Notificação</Title>

              <Row gutter={16}>
                <Col xs={24} sm={8}>
                  <Form.Item
                    name="notificarAgendamentos"
                    valuePropName="checked"
                  >
                    <Switch />
                    <Text className="ml-2">Confirmação de agendamentos</Text>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item
                    name="notificarEstoqueBaixo"
                    valuePropName="checked"
                  >
                    <Switch />
                    <Text className="ml-2">Estoque baixo</Text>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item
                    name="notificarAniversarios"
                    valuePropName="checked"
                  >
                    <Switch />
                    <Text className="ml-2">Aniversários de clientes</Text>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<Save size={14} />}
                >
                  Salvar Configurações de Notificações
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>

        <TabPane
          tab={
            <span className="flex items-center gap-2">
              <Database size={14} />
              Sistema
            </span>
          }
          key="3"
        >
          <Card loading={isLoading} title="Configurações do Sistema">
            <Form
              form={sistemaForm}
              layout="vertical"
              initialValues={data}
              onFinish={onSave}
            >
              <Title level={4}>Integração Asaas (Crediário)</Title>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="API Key Asaas"
                    name="asaasApiKey"
                    help="Chave da API do Asaas para integração de crediário"
                  >
                    <Input.Password placeholder="$aact_..." />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Ambiente"
                    name="asaasEnvironment"
                    initialValue="sandbox"
                  >
                    <Select>
                      <Option value="sandbox">Sandbox (Testes)</Option>
                      <Option value="production">Produção</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                className="mt-4"
                label="Habilitar integração com Asaas"
                name="asaasActive"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Divider />

              <Title level={4}>Localização</Title>

              <Row gutter={16}>
                <Space direction="vertical" className="w-full">
                  <Form.Item label="Fuso Horário" name="timezone">
                    <Select>
                      <Option value="America/Sao_Paulo">
                        São Paulo (GMT-3)
                      </Option>
                      <Option value="America/Rio_Branco">
                        Rio Branco (GMT-5)
                      </Option>
                      <Option value="America/Manaus">Manaus (GMT-4)</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item label="Moeda" name="currency">
                    <Select
                      showSearch
                      optionFilterProp="label"
                      options={[
                        ...currencies,
                        { simbolo: "BRL", nome: "Real Brasileiro" },
                      ]
                        .sort((a, b) => a.nome.localeCompare(b.nome))
                        .map((c) => ({
                          label: `${c.nome} (${c.simbolo})`,
                          value: c.simbolo,
                        }))}
                    />
                  </Form.Item>
                </Space>
              </Row>

              <Divider />

              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Salvar Configurações do Sistema
                </Button>
              </Form.Item>
            </Form>
          </Card>

          <Card title="Informações do Sistema" className="mt-4">
            <Row gutter={16}>
              <Col xs={24} sm={8}>
                <Card size="small">
                  <Statistic
                    title="Versão do Sistema"
                    value={packageJson.version}
                  />
                </Card>
              </Col>
            </Row>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Configuracoes;
