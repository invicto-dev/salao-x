import { Layout, Menu, Button, Breadcrumb, Switch, Typography, Drawer } from 'antd';
import { useState } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Package,
  Users,
  UserCheck,
  Calendar,
  BarChart3,
  Gift,
  Settings,
  Moon,
  Sun,
  Menu as MenuIcon,
  Store,
  Scissors,
  PlusCircle
} from 'lucide-react';

// Pages
import Dashboard from '../../pages/Dashboard';
import PDV from '../../pages/PDV';
import Estoque from '../../pages/Estoque';
import Produtos from '../../pages/Produtos';
import Servicos from '../../pages/Servicos';
import Clientes from '../../pages/Clientes';
import Funcionarios from '../../pages/Funcionarios';
import Agendamentos from '../../pages/Agendamentos';
import Fidelidade from '../../pages/Fidelidade';
import Configuracoes from '../../pages/Configuracoes';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

interface AppLayoutProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

const AppLayout = ({ isDarkMode, onToggleTheme }: AppLayoutProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    {
      key: '/',
      icon: <BarChart3 size={16} />,
      label: 'Dashboard',
      path: '/'
    },
    {
      key: '/pdv',
      icon: <ShoppingCart size={16} />,
      label: 'PDV',
      path: '/pdv'
    },
    {
      key: 'produtos-servicos',
      label: 'Produtos & Serviços',
      icon: <Package size={16} />,
      children: [
        {
          key: '/produtos',
          icon: <Package size={14} />,
          label: 'Produtos',
          path: '/produtos'
        },
        {
          key: '/servicos',
          icon: <Scissors size={14} />,
          label: 'Serviços',
          path: '/servicos'
        },
        {
          key: '/estoque',
          icon: <Store size={14} />,
          label: 'Estoque',
          path: '/estoque'
        }
      ]
    },
    {
      key: 'gestao',
      label: 'Gestão',
      icon: <Users size={16} />,
      children: [
        {
          key: '/clientes',
          icon: <Users size={14} />,
          label: 'Clientes',
          path: '/clientes'
        },
        {
          key: '/funcionarios',
          icon: <UserCheck size={14} />,
          label: 'Funcionários',
          path: '/funcionarios'
        },
        {
          key: '/agendamentos',
          icon: <Calendar size={14} />,
          label: 'Agendamentos',
          path: '/agendamentos'
        }
      ]
    },
    {
      key: '/fidelidade',
      icon: <Gift size={16} />,
      label: 'Fidelidade',
      path: '/fidelidade'
    },
    {
      key: '/configuracoes',
      icon: <Settings size={16} />,
      label: 'Configurações',
      path: '/configuracoes'
    }
  ];

  const handleMenuClick = (item: any) => {
    if (item.path) {
      navigate(item.path);
      setMobileMenuOpen(false);
    }
  };

  const getSelectedKeys = () => {
    const currentPath = location.pathname;
    return [currentPath];
  };

  const getOpenKeys = () => {
    const currentPath = location.pathname;
    if (currentPath.includes('/produtos') || currentPath.includes('/servicos') || currentPath.includes('/estoque')) {
      return ['produtos-servicos'];
    }
    if (currentPath.includes('/clientes') || currentPath.includes('/funcionarios') || currentPath.includes('/agendamentos')) {
      return ['gestao'];
    }
    return [];
  };

  const getBreadcrumb = () => {
    const currentPath = location.pathname;
    const breadcrumbs = [{ title: 'Salão X' }];
    
    const menuItem = menuItems.find(item => {
      if (item.path === currentPath) return true;
      return item.children?.some(child => child.path === currentPath);
    });

    if (menuItem) {
      if (menuItem.children) {
        const childItem = menuItem.children.find(child => child.path === currentPath);
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
      style={{ borderRight: 0, background: 'transparent' }}
      items={menuItems.map(item => ({
        key: item.key,
        icon: item.icon,
        label: item.label,
        children: item.children?.map(child => ({
          key: child.key,
          icon: child.icon,
          label: child.label,
          onClick: () => handleMenuClick(child)
        })),
        onClick: item.path ? () => handleMenuClick(item) : undefined
      }))}
    />
  );

  return (
    <Layout className="min-h-screen">
      {/* Desktop Sidebar */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="hidden md:block border-r border-sidebar-border bg-sidebar"
        width={256}
        collapsedWidth={64}
      >
        <div className="flex items-center justify-center h-16 border-b border-sidebar-border">
          <Title level={collapsed ? 5 : 4} className="!mb-0 !text-salao-primary">
            {collapsed ? 'SX' : 'Salão X'}
          </Title>
        </div>
        <div className="py-4">
          {renderMenu()}
        </div>
      </Sider>

      {/* Mobile Drawer */}
      <Drawer
        title="Salão X"
        placement="left"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        className="md:hidden"
        width={256}
        bodyStyle={{ padding: 0 }}
      >
        <div className="py-4">
          {renderMenu()}
        </div>
      </Drawer>

      <Layout>
        {/* Header */}
        <Header className="bg-header border-b border-sidebar-border px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={<MenuIcon size={16} />}
              onClick={() => {
                if (window.innerWidth < 768) {
                  setMobileMenuOpen(true);
                } else {
                  setCollapsed(!collapsed);
                }
              }}
              className="hover:bg-accent"
            />
            <Breadcrumb items={getBreadcrumb()} />
          </div>
          
          <div className="flex items-center gap-2">
            <Switch
              checked={isDarkMode}
              onChange={onToggleTheme}
              checkedChildren={<Moon size={12} />}
              unCheckedChildren={<Sun size={12} />}
            />
          </div>
        </Header>

        {/* Content */}
        <Content className="bg-content p-6 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pdv" element={<PDV />} />
            <Route path="/produtos" element={<Produtos />} />
            <Route path="/servicos" element={<Servicos />} />
            <Route path="/estoque" element={<Estoque />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/funcionarios" element={<Funcionarios />} />
            <Route path="/agendamentos" element={<Agendamentos />} />
            <Route path="/fidelidade" element={<Fidelidade />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;