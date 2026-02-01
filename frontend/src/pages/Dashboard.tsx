import React, { useState } from "react";
import { TrendingUp, TrendingDown, DollarSign, Users, Package, Calendar, Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/formatCurrency";
import { useDashboard } from "@/hooks/use-dashboard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { subDays, startOfMonth, format } from "date-fns";

const Dashboard = () => {
  const [period, setPeriod] = useState("30");

  const getDateRange = (period: string) => {
    const end = new Date();
    let start = new Date();

    if (period === "0") { // Hoje
      start.setHours(0, 0, 0, 0);
    } else if (period === "7") {
      start = subDays(end, 7);
    } else if (period === "30") {
      start = subDays(end, 30);
    } else if (period === "month") {
      start = startOfMonth(end);
    }

    return {
      start: format(start, "yyyy-MM-dd"),
      end: format(end, "yyyy-MM-dd"),
    };
  };

  const { start, end } = getDateRange(period);
  const { data, isLoading, error } = useDashboard(start, end);

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center gap-2">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="text-muted-foreground">Erro ao carregar dados do dashboard.</p>
      </div>
    );
  }

  const kpis = [
    {
      title: 'Faturamento',
      value: data?.faturamentoTotal ?? 0,
      isCurrency: true,
      icon: <DollarSign className="text-emerald-500" size={24} />
    },
    {
      title: 'Total de Vendas',
      value: data?.totalVendas ?? 0,
      suffix: 'pedidos',
      icon: <Users className="text-primary" size={24} />
    },
    {
      title: 'Estoque Crítico',
      value: data?.estoqueCritico ?? 0,
      suffix: 'produtos',
      icon: <Package className="text-pink-500" size={24} />,
      isAlert: (data?.estoqueCritico ?? 0) > 0
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Visão geral do seu salão de beleza</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Período:</span>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Hoje</SelectItem>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="month">Este Mês</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi, index) => (
          <Card key={index} className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.title}</CardTitle>
              {kpi.icon}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${kpi.isAlert ? 'text-destructive' : ''}`}>
                {kpi.isCurrency ? formatCurrency(kpi.value) : kpi.value}
                {kpi.suffix && <span className="ml-1 text-xs font-normal text-muted-foreground">{kpi.suffix}</span>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Serviços */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">🏆 Top Serviços</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Serviço</TableHead>
                  <TableHead className="text-center">Vendas</TableHead>
                  <TableHead className="text-right">Receita</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.topServicos?.map((item: any) => (
                  <TableRow key={item.nome}>
                    <TableCell className="font-medium">{item.nome}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">{item.vendas}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(item.receita)}</TableCell>
                  </TableRow>
                ))}
                {(!data?.topServicos || data.topServicos.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-4">Nenhum serviço vendido no período.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Top Produtos */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">📦 Top Produtos Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead className="text-center">Vendas</TableHead>
                  <TableHead className="text-right">Receita</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.topProdutos?.map((item: any) => (
                  <TableRow key={item.nome}>
                    <TableCell className="font-medium">{item.nome}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200">{item.vendas}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(item.receita)}</TableCell>
                  </TableRow>
                ))}
                {(!data?.topProdutos || data.topProdutos.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-4">Nenhum produto vendido no período.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Metas Mensais (Mantendo as metas como mock por enquanto conforme não foi solicitado backend para elas, mas integrando com o faturamento real) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">📊 Meta de Faturamento Mensal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 py-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Progresso Atual</span>
                <span className="text-xs text-muted-foreground">
                  {formatCurrency(data?.faturamentoTotal ?? 0)} / {formatCurrency(60000)}
                </span>
              </div>
              <Progress value={((data?.faturamentoTotal ?? 0) / 60000) * 100} className="h-2" />
            </div>
            <p className="text-sm text-muted-foreground">Meta baseada no período selecionado comparado a meta fixa de R$ 60.000,00.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
