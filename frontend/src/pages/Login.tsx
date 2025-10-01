import { Card, Form, Input, Button, Checkbox, Typography, message } from "antd";
import { Mail, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

interface LoginFormValues {
  email: string;
  password: string;
  remember?: boolean;
}

const Login = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate(); // Hook para navegação

  const onFinish = async (values: LoginFormValues) => {
    try {
      await login(values.email, values.password);
      message.success("Login realizado com sucesso!");
      navigate("/pdv");
    } catch (error) {
      message.error(error.response.data.error);
      console.error("Falha no login:", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md shadow-lg">
        <div className="text-center mb-8">
          <Title level={2}>Acesse sua Conta</Title>
          <Text type="secondary">
            Bem-vindo(a) de volta! Por favor, insira suas credenciais.
          </Text>
        </div>

        <Form
          name="login_form"
          layout="vertical"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          size="large"
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Por favor, insira seu email!" },
              { type: "email", message: "O email inserido não é válido!" },
            ]}
          >
            <Input
              prefix={
                <Mail className="site-form-item-icon text-gray-400" size={14} />
              }
              placeholder="seuemail@exemplo.com"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Senha"
            rules={[
              { required: true, message: "Por favor, insira sua senha!" },
            ]}
          >
            <Input.Password
              prefix={
                <Lock className="site-form-item-icon text-gray-400" size={14} />
              }
              placeholder="Senha"
            />
          </Form.Item>

          <Form.Item>
            <div className="flex justify-between items-center">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>Lembrar-me</Checkbox>
              </Form.Item>
              <a className="login-form-forgot" href="">
                Esqueceu a senha?
              </a>
            </div>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full"
              loading={isLoading} // O botão fica em estado de loading enquanto a função 'login' executa
            >
              Entrar
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
