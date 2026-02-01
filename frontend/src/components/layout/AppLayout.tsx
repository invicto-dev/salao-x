import React, { useState, useMemo } from "react";
import {
  Routes,
  Route,
  useLocation,
  useNavigate,
  Link,
  Navigate,
} from "react-router-dom";
import {
  ShoppingCart,
  Package,
  Users,
  UserCheck,
  Settings,
  Moon,
  Sun,
  List as ListIcon,
  Scissors,
  WalletCards,
  DollarSign,
  LogOut,
  User2,
  Banknote,
  Clipboard,
  ChevronDown,
  Store,
  ChartNoAxesCombined,
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { hasPermission } from "@/utils/permissions";
import { useTheme } from "@/components/theme-provider";

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
import Caixa from "@/pages/Caixa";
import Comandas from "@/pages/Comandas";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";

const AppLayoutContent = () => {
  const { logout, user } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const { state } = useSidebar();

  const menuItems = [
    {
      key: "/dashboard",
      icon: <ChartNoAxesCombined className="size-4" />,
      label: "Dashboard",
      permission: "FUNCIONARIO",
    },
    {
      key: "/pdv",
      icon: <ShoppingCart className="size-4" />,
      label: "PDV",
      permission: "FUNCIONARIO",
    },
    {
      key: "/comandas",
      icon: <Clipboard className="size-4" />,
      label: "Comandas",
      permission: "FUNCIONARIO",
    },
    {
      key: "/vendas",
      icon: <DollarSign className="size-4" />,
      label: "Vendas",
      permission: "FUNCIONARIO",
    },
    {
      key: "produtos-servicos",
      label: "Produtos & Serviços",
      icon: <Package className="size-4" />,
      permission: "FUNCIONARIO",
      children: [
        {
          key: "/produtos",
          icon: <Package className="size-4" />,
          label: "Produtos",
        },
        {
          key: "/servicos",
          icon: <Scissors className="size-4" />,
          label: "Serviços",
        },
        {
          key: "/estoque",
          icon: <Store className="size-4" />,
          label: "Estoque",
        },
      ],
    },
    {
      key: "gestao",
      label: "Gestão",
      icon: <Users className="size-4" />,
      permission: "SECRETARIO",
      children: [
        {
          key: "/categorias",
          icon: <ListIcon className="size-4" />,
          label: "Categorias",
        },
        {
          key: "/clientes",
          icon: <Users className="size-4" />,
          label: "Clientes",
        },
        {
          key: "/funcionarios",
          icon: <UserCheck className="size-4" />,
          label: "Funcionários",
        },
        {
          key: "/metodos-de-pagamento",
          icon: <WalletCards className="size-4" />,
          label: "Métodos de Pagamento",
        },
        {
          key: "/caixa",
          icon: <Banknote className="size-4" />,
          label: "Caixa",
        },
      ],
    },
    {
      key: "/configuracoes",
      icon: <Settings className="size-4" />,
      label: "Configurações",
      permission: "ADMIN",
    },
  ];

  const filteredMenuItems = useMemo(() => {
    if (!user?.role) return [];

    const filter = (items: any[]) => {
      return items.reduce((acc: any[], item) => {
        if (hasPermission(user.role, item.permission)) {
          if (item.children) {
            const filteredChildren = filter(item.children);
            if (filteredChildren.length > 0) {
              acc.push({ ...item, children: filteredChildren });
            }
          } else {
            acc.push(item);
          }
        }
        return acc;
      }, []);
    };

    return filter(menuItems);
  }, [user]);

  const getBreadcrumbs = () => {
    const currentPath = location.pathname;
    const items = [{ label: "Salão X", href: "/dashboard" }];

    for (const item of filteredMenuItems) {
      if (item.key === currentPath) {
        items.push({ label: item.label, href: item.key });
        break;
      }
      if (item.children) {
        const child = item.children.find((c: any) => c.key === currentPath);
        if (child) {
          items.push({ label: item.label, href: "#" });
          items.push({ label: child.label, href: child.key });
          break;
        }
      }
    }
    return items;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="flex min-h-screen w-full bg-content">
      <Sidebar collapsible="icon">
        <SidebarHeader className="h-16 border-b flex justify-center items-center">
          <Link
            to="/dashboard"
            className="flex gap-2 hover:opacity-80 justify-center items-center transition-opacity"
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Scissors className="size-4" />
            </div>
            <span className="font-semibold text-lg group-data-[collapsible=icon]:hidden">
              Salão X
            </span>
          </Link>
        </SidebarHeader>
        <SidebarContent className="p-6 group-data-[collapsible=icon]:p-2">
          <SidebarMenu>
            {filteredMenuItems.map((item) => {
              const isParentActive = item.children?.some((child: any) =>
                location.pathname.startsWith(child.key),
              );
              const isItemActive =
                location.pathname === item.key || isParentActive;

              if (item.children) {
                if (state === "collapsed") {
                  return (
                    <SidebarMenuItem key={item.key}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <SidebarMenuButton
                            tooltip={item.label}
                            isActive={isItemActive}
                          >
                            {item.icon}
                            <span>{item.label}</span>
                            <ChevronDown className="ml-auto size-4" />
                          </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="right" align="start">
                          {item.children.map((child: any) => (
                            <DropdownMenuItem key={child.key} asChild>
                              <Link
                                to={child.key}
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                {child.icon}
                                <span>{child.label}</span>
                              </Link>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </SidebarMenuItem>
                  );
                }

                return (
                  <Collapsible
                    key={item.key}
                    asChild
                    defaultOpen={
                      location.pathname.includes(item.key) || isParentActive
                    }
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          tooltip={item.label}
                          isActive={isItemActive}
                        >
                          {item.icon}
                          <span>{item.label}</span>
                          <ChevronDown className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.children.map((child: any) => (
                            <SidebarMenuSubItem key={child.key}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={location.pathname === child.key}
                              >
                                <Link
                                  to={child.key}
                                  className="flex items-center gap-2"
                                >
                                  {child.icon}
                                  <span>{child.label}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                );
              }
              return (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.key}
                    tooltip={item.label}
                  >
                    <Link to={item.key}>
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="border-t p-4">
          <div className="flex items-center gap-4 group-data-[collapsible=icon]:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="hover:opacity-70 transition-opacity"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <Sun className="size-4" />
              ) : (
                <Moon className="size-4" />
              )}
            </Button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.nome}</p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.role}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="hover:opacity-70 transition-opacity"
            >
              <LogOut className="size-4" />
            </Button>
          </div>
          <div className="hidden group-data-[collapsible=icon]:flex items-center justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User2 className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  {theme === "dark" ? "Light Mode" : "Dark Mode"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>Sair</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b flex items-center px-4 gap-4 sticky top-0 bg-background z-10">
          <SidebarTrigger />
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((bc, index) => (
                <React.Fragment key={`${bc.label}-${index}`}>
                  <BreadcrumbItem>
                    {index === breadcrumbs.length - 1 ? (
                      <BreadcrumbPage>{bc.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link to={bc.href}>{bc.label}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="p-6 flex-1 overflow-auto bg-content/50">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/pdv" element={<PDV />} />
            <Route path="/comandas" element={<Comandas />} />
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
            <Route path="/caixa" element={<Caixa />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

const AppLayout = () => {
  return (
    <SidebarProvider>
      <AppLayoutContent />
    </SidebarProvider>
  );
};

export default AppLayout;
