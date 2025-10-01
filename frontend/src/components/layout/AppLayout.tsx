import {
  Layout,
  Menu,
  Button,
  Breadcrumb,
  Drawer,
  Dropdown,
  Segmented,
} from "antd";
import { useMemo, useState } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Package,
  Users,
  UserCheck,
  Settings,
  Moon,
  Sun,
  List as ListIcon,
  Store,
  Scissors,
  WalletCards,
  DollarSign,
  LogOut,
  User2,
  PanelLeft,
  PanelRight,
} from "lucide-react";

// Pages
import Dashboard from "../../pages/Dashboard";
import PDV from "../../pages/PDV";
import Estoque from "../../pages/Estoque";
import Produtos from "../../pages/Produtos";
import Servicos from "../../pages/Servicos";
import Clientes from "../../pages/Clientes";
import Funcionarios from "../../pages/Funcionarios";
import Agendamentos from "../../pages/Agendamentos";
import Fidelidade from "../../pages/Fidelidade";
import Configuracoes from "../../pages/Configuracoes";
import Categorias from "@/pages/Categorias";
import MetodoDePagamentos from "@/pages/Pagamentos";
import Vendas from "@/pages/Vendas";
import { useAuth } from "@/contexts/AuthContext";
import { hasPermission } from "@/utils/permissions";
import { json } from "stream/consumers";

const { Header, Sider, Content } = Layout;

interface AppLayoutProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

const AppLayout = ({ isDarkMode, onToggleTheme }: AppLayoutProps) => {
  const { logout, user } = useAuth();
  const [collapsed, setCollapsed] = useState(
    JSON.parse(localStorage.getItem("collapsed") || "false")
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    /* {
      key: "/",
      icon: <BarChart3 size={14} />,
      label: "Dashboard",
      permission: "GERENTE",
    }, */
    {
      key: "/pdv",
      icon: <ShoppingCart size={14} />,
      label: "PDV",
      permission: "FUNCIONARIO",
    },
    {
      key: "/vendas",
      icon: <DollarSign size={14} />,
      label: "Vendas",
      permission: "FUNCIONARIO",
    },
    {
      key: "produtos-servicos",
      label: "Produtos & Serviços",
      icon: <Package size={14} />,
      permission: "FUNCIONARIO",
      children: [
        {
          key: "/produtos",
          icon: <Package size={14} />,
          label: "Produtos",
        },
        {
          key: "/servicos",
          icon: <Scissors size={14} />,
          label: "Serviços",
        },
        {
          key: "/estoque",
          icon: <Store size={14} />,
          label: "Estoque",
        },
      ],
    },
    {
      key: "gestao",
      label: "Gestão",
      icon: <Users size={14} />,
      permission: "SECRETARIO",
      children: [
        /* {
          key: "/agendamentos",
          icon: <Calendar size={14} />,
          label: "Agendamentos",
        }, */
        {
          key: "/categorias",
          icon: <ListIcon size={14} />,
          label: "Categorias",
        },
        {
          key: "/clientes",
          icon: <Users size={14} />,
          label: "Clientes",
        },
        {
          key: "/funcionarios",
          icon: <UserCheck size={14} />,
          label: "Funcionários",
        },
        {
          key: "/metodos-de-pagamento",
          icon: <WalletCards size={14} />,
          label: "Métodos de Pagamento",
        },
      ],
    },
    /* {
      key: "/fidelidade",
      icon: <Gift size={14} />,
      label: "Fidelidade",
      permission: "SECRETARIO",
    }, */
    {
      key: "/configuracoes",
      icon: <Settings size={14} />,
      label: "Configurações",
      permission: "ADMIN",
    },
  ];

  const filteredMenuItems = useMemo(() => {
    if (!user?.role) return []; // Se não houver usuário ou role, retorna menu vazio

    // Função recursiva para filtrar os itens e seus filhos
    const filter = (items) => {
      return items.reduce((acc, item) => {
        // 1. Verifica se o usuário tem permissão para o item atual
        if (hasPermission(user.role, item.permission)) {
          // 2. Se o item tiver filhos, filtra os filhos recursivamente
          if (item.children) {
            const filteredChildren = filter(item.children);
            // 3. Só adiciona o item pai se ele ainda tiver filhos visíveis após o filtro
            if (filteredChildren.length > 0) {
              acc.push({ ...item, children: filteredChildren });
            }
          } else {
            // 4. Se não tiver filhos, apenas adiciona o item
            acc.push(item);
          }
        }
        return acc;
      }, []);
    };

    return filter(menuItems);
  }, [user]);

  const handleMenuClick = (item: any) => {
    if (item.key) {
      navigate(item.key);
      setMobileMenuOpen(false);
    }
  };

  const getSelectedKeys = () => {
    const currentPath = location.pathname;
    return [currentPath];
  };

  const getOpenKeys = () => {
    const currentPath = location.pathname;
    if (
      currentPath.includes("/produtos") ||
      currentPath.includes("/servicos") ||
      currentPath.includes("/estoque")
    ) {
      return ["produtos-servicos"];
    }
    if (
      currentPath.includes("/clientes") ||
      currentPath.includes("/funcionarios") ||
      currentPath.includes("/agendamentos")
    ) {
      return ["gestao"];
    }
    return [];
  };

  const getBreadcrumb = () => {
    const currentPath = location.pathname;
    const breadcrumbs = [{ title: "Salão X" }];

    const menuItem = filteredMenuItems.find((item) => {
      if (item.key === currentPath) return true;
      return item.children?.some((child) => child.key === currentPath);
    });

    if (menuItem) {
      if (menuItem.children) {
        const childItem = menuItem.children.find(
          (child) => child.key === currentPath
        );
        breadcrumbs.push({ title: menuItem.label });
        if (childItem) breadcrumbs.push({ title: childItem.label });
      } else {
        breadcrumbs.push({ title: menuItem.label });
      }
    }

    return breadcrumbs;
  };

  const renderMenu = () => (
    <Menu
      mode="inline"
      selectedKeys={getSelectedKeys()}
      defaultOpenKeys={getOpenKeys()}
      style={{ borderRight: 0, background: "transparent" }}
      items={filteredMenuItems.map((item) => ({
        key: item.key,
        icon: item.icon,
        label: item.label,
        children: item.children?.map((child) => ({
          key: child.key,
          icon: child.icon,
          label: child.label,
          onClick: () => handleMenuClick(child),
        })),
        onClick:
          item.key && !item.children ? () => handleMenuClick(item) : undefined,
      }))}
    />
  );

  return (
    <Layout className="flex-1 min-h-screen">
      {/* Desktop Sidebar */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="hidden md:block border-r border-sidebar-border bg-sidebar"
        width={256}
        collapsedWidth={64}
      >
        <div className="flex items-center justify- h-16 border-b border-sidebar-border">
          <img
            onClick={() => navigate("/pdv")}
            className={`w-40 cursor-pointer ${isDarkMode ? "invert" : ""}`}
            src="/public/salao-x-not-bg.png"
          />
        </div>
        <div className="py-4">{renderMenu()}</div>
      </Sider>

      {/* Mobile Drawer */}
      <Drawer
        title={
          <img
            className={`w-20 h-20 object-contain  ${
              isDarkMode ? "invert" : ""
            }`}
            src="/public/salao-x-not-bg.png"
          />
        }
        placement="left"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        className="md:hidden"
        width={256}
        styles={{ body: { padding: 0 }, header: { padding: 0 } }}
      >
        <div className="py-4">{renderMenu()}</div>
      </Drawer>

      <Layout>
        {/* Header */}
        <Header className=" bg-header border-b border-sidebar-border px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={
                collapsed ? <PanelRight size={14} /> : <PanelLeft size={14} />
              }
              onClick={() => {
                if (window.innerWidth < 768) {
                  setMobileMenuOpen(true);
                } else {
                  localStorage.setItem("collapsed", JSON.stringify(!collapsed));
                  setCollapsed(!collapsed);
                }
              }}
              className="hover:bg-accent"
            />
            <Breadcrumb items={getBreadcrumb()} />
          </div>
          <div className="flex items-center gap-2">
            <Segmented
              shape="round"
              onChange={onToggleTheme}
              value={isDarkMode ? "dark" : "light"}
              options={[
                { value: "light", icon: <Sun className="mt-1.5" size={14} /> },
                { value: "dark", icon: <Moon className="mt-1.5" size={14} /> },
              ]}
            />

            <Dropdown
              menu={{
                items: [
                  {
                    key: "logout",
                    icon: <LogOut size={14} />,
                    label: "Sair",
                    onClick: logout,
                  },
                ],
              }}
              trigger={["click"]}
            >
              <Button type="text" icon={<User2 size={14} />}>
                {user?.nome}
              </Button>
            </Dropdown>
          </div>
        </Header>

        {/* Content */}
        <Content className="bg-content p-6 overflow-auto">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/pdv" element={<PDV />} />
            <Route path="/vendas" element={<Vendas />} />
            <Route path="/produtos" element={<Produtos />} />
            <Route path="/servicos" element={<Servicos />} />
            <Route path="/estoque" element={<Estoque />} />
            <Route path="/categorias" element={<Categorias />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/funcionarios" element={<Funcionarios />} />
            <Route path="/agendamentos" element={<Agendamentos />} />
            <Route path="/fidelidade" element={<Fidelidade />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
            <Route
              path="/metodos-de-pagamento"
              element={<MetodoDePagamentos />}
            />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
