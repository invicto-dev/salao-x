import React from "react";
import { TrendingUp, TrendingDown, DollarSign, Users, Package, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/formatCurrency";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Dashboard = () => {
  const kpis = [
    {
      title: 'Faturamento Hoje',
      value: 2850.50,
      isCurrency: true,
      change: 12.5,
      icon: <DollarSign className="text-emerald-500" size={24} />
    },
    {
      title: 'Clientes Atendidos',
      value: 24,
      suffix: 'hoje',
      change: 8.3,
      icon: <Users className="text-primary" size={24} />
    },
    {
      title: 'Produtos Vendidos',
      value: 45,
      suffix: 'unidades',
      change: -3.2,
      icon: <Package className="text-pink-500" size={24} />
    },
    {
      title: 'Agendamentos',
      value: 18,
      suffix: 'hoje',
      change: 15.7,
      icon: <Calendar className="text-amber-500" size={24} />
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

  const totalComissoes = comissoesAPagar.reduce((acc, item) => acc + item.valor, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Visão geral do seu salão de beleza</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => (
          <Card key={index} className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.title}</CardTitle>
              {kpi.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {kpi.isCurrency ? formatCurrency(kpi.value) : kpi.value}
                {kpi.suffix && <span className="ml-1 text-xs font-normal text-muted-foreground">{kpi.suffix}</span>}
              </div>
              <div className="flex items-center mt-1 text-xs">
                {kpi.change > 0 ? (
                  <TrendingUp size={12} className="text-emerald-500 mr-1" />
                ) : (
                  <TrendingDown size={12} className="text-destructive mr-1" />
                )}
                <span className={kpi.change > 0 ? 'text-emerald-600 font-medium' : 'text-destructive font-medium'}>
                  {Math.abs(kpi.change)}%
                </span>
                <span className="text-muted-foreground ml-1">vs ontem</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Serviços */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">🏆 Top Serviços do Dia</CardTitle>
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
                {topServicos.map((item) => (
                  <TableRow key={item.nome}>
                    <TableCell className="font-medium">{item.nome}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">{item.vendas}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(item.receita)}</TableCell>
                  </TableRow>
                ))}
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
                {topProdutos.map((item) => (
                  <TableRow key={item.nome}>
                    <TableCell className="font-medium">{item.nome}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200">{item.vendas}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(item.receita)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Comissões */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">💰 Comissões a Pagar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Funcionário</TableHead>
                  <TableHead className="text-center">Serviços</TableHead>
                  <TableHead className="text-right">Comissão</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comissoesAPagar.map((item) => (
                  <TableRow key={item.funcionario}>
                    <TableCell className="font-medium">{item.funcionario}</TableCell>
                    <TableCell className="text-center">{item.servicos}</TableCell>
                    <TableCell className="text-right font-semibold text-emerald-600">{formatCurrency(item.valor)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4 p-4 rounded-lg bg-primary/5 flex justify-between items-center border border-primary/10">
              <span className="text-sm font-medium text-muted-foreground">Total de comissões</span>
              <span className="text-xl font-bold text-primary">{formatCurrency(totalComissoes)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Metas */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">📊 Meta Mensal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 py-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Faturamento</span>
                <span className="text-xs text-muted-foreground">
                  {formatCurrency(45650)} / {formatCurrency(60000)}
                </span>
              </div>
              <Progress value={76} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Clientes Atendidos</span>
                <span className="text-xs text-muted-foreground">
                  387 / 500
                </span>
              </div>
              <Progress value={77} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Produtos Vendidos</span>
                <span className="text-xs text-muted-foreground">
                  645 / 800
                </span>
              </div>
              <Progress value={81} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
