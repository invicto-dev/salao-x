import React, { useState } from "react";
import {
  Gift,
  Plus,
  Search,
  Edit,
  User,
  Award,
  TrendingUp,
  Star,
  Settings,
  ArrowUpRight,
  ArrowDownLeft,
  Loader2
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import PagesLayout from "@/components/layout/PagesLayout";
import { DataTable } from "@/components/tables/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { formatCurrency } from "@/utils/formatCurrency";
import { ScrollArea } from "@/components/ui/scroll-area";

const Fidelidade = () => {
  const [busca, setBusca] = useState("");
  const [modalMoveOpen, setModalMoveOpen] = useState(false);
  const [modalConfigOpen, setModalConfigOpen] = useState(false);
  const [modalResgateOpen, setModalResgateOpen] = useState(false);

  // Mock data
  const configuracao = {
    pontosParaReal: 10,
    realParaPonto: 1,
    descontoMaximo: 50,
    ativo: true,
  };

  const clientesComPontos = [
    { id: "1", nome: "Ana Silva", telefone: "(11) 99999-9999", pontos: 250, totalGasto: 2500.0, ultimaCompra: "2024-01-20" },
    { id: "2", nome: "Maria Santos", telefone: "(11) 88888-8888", pontos: 180, totalGasto: 1800.0, ultimaCompra: "2024-01-18" },
    { id: "3", nome: "Carla Oliveira", telefone: "(11) 77777-7777", pontos: 95, totalGasto: 950.0, ultimaCompra: "2024-01-15" },
    { id: "4", nome: "Julia Costa", telefone: "(11) 66666-6666", pontos: 45, totalGasto: 450.0, ultimaCompra: "2024-01-10" },
  ];

  const historicoPontos = [
    { id: "1", clienteNome: "Ana Silva", tipo: "acumulo", pontos: 15, valor: 150.0, data: "2024-01-20", descricao: "Compra - Corte + Escova" },
    { id: "2", clienteNome: "Maria Santos", tipo: "resgate", pontos: -20, valor: 20.0, data: "2024-01-18", descricao: "Desconto aplicado em compra" },
    { id: "3", clienteNome: "Ana Silva", tipo: "acumulo", pontos: 8, valor: 80.0, data: "2024-01-15", descricao: "Compra - Coloração" },
  ];

  const getNivel = (pontos: number) => {
    if (pontos >= 200) return { nome: "VIP", className: "bg-purple-500 hover:bg-purple-600" };
    if (pontos >= 150) return { nome: "Gold", className: "bg-amber-500 hover:bg-amber-600" };
    if (pontos >= 100) return { nome: "Silver", className: "bg-slate-400 hover:bg-slate-500" };
    return { nome: "Bronze", className: "bg-orange-600 hover:bg-orange-700" };
  };

  const calcularDesconto = (pontos: number) => (pontos / configuracao.pontosParaReal);

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "nome",
      header: "Cliente",
      cell: ({ row }) => {
        const record = row.original;
        const nivel = getNivel(record.pontos);
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback>{record.nome.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-sm">{record.nome}</div>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge className={`text-[10px] h-4 py-0 px-1.5 ${nivel.className}`}>{nivel.nome}</Badge>
                <span className="text-[10px] text-muted-foreground">{record.telefone}</span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "pontos",
      header: "Pontos",
      cell: ({ row }) => (
        <div className="text-center">
          <div className="font-bold text-lg text-primary">{row.original.pontos}</div>
          <div className="text-[10px] text-muted-foreground">≈ {formatCurrency(calcularDesconto(row.original.pontos))}</div>
        </div>
      ),
    },
    {
      accessorKey: "totalGasto",
      header: "Total Gasto",
      cell: ({ row }) => <span className="font-medium">{formatCurrency(row.original.totalGasto)}</span>,
    },
    {
      accessorKey: "ultimaCompra",
      header: "Última Compra",
      cell: ({ row }) => <span className="text-sm">{new Date(row.original.ultimaCompra).toLocaleDateString("pt-BR")}</span>,
    },
    {
      id: "acoes",
      header: "Ações",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => setModalResgateOpen(true)}>
            <Gift className="mr-2 h-4 w-4" />
            Resgatar
          </Button>
        </div>
      ),
    },
  ];

  const totalPontosAtivos = clientesComPontos.reduce((acc, c) => acc + c.pontos, 0);

  return (
    <PagesLayout
      title="Programa de Fidelidade"
      subtitle="Gerencie pontos e recompensas dos seus clientes"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border-none shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
             <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase">Clientes Ativos</p>
                <p className="text-2xl font-bold">{clientesComPontos.length}</p>
             </div>
             <Award className="h-8 w-8 text-primary/40" />
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
             <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase">Total de Pontos</p>
                <p className="text-2xl font-bold text-pink-500">{totalPontosAtivos}</p>
             </div>
             <Star className="h-8 w-8 text-pink-500/40" />
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
             <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase">Valor em Pontos</p>
                <p className="text-2xl font-bold text-emerald-600">{formatCurrency(calcularDesconto(totalPontosAtivos))}</p>
             </div>
             <TrendingUp className="h-8 w-8 text-emerald-600/40" />
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
             <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase">Conversão</p>
                <p className="text-lg font-bold">R$ 1 = {configuracao.realParaPonto} pt</p>
             </div>
             <Settings className="h-8 w-8 text-muted-foreground/30" />
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6 bg-card p-4 rounded-lg border-none shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar cliente..."
            className="pl-9"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={() => setModalConfigOpen(true)}>
             <Settings className="mr-2 h-4 w-4" />
             Configurar
          </Button>
          <Button onClick={() => setModalMoveOpen(true)} className="flex-1 sm:flex-none">
             <Plus className="mr-2 h-4 w-4" />
             Movimentar Pontos
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">🏆 Ranking de Fidelidade</CardTitle>
          </CardHeader>
          <CardContent>
             <DataTable columns={columns} data={clientesComPontos} />
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">📋 Histórico de Pontos</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
                {historicoPontos.map((h: any) => (
                  <div key={h.id} className="flex justify-between items-center p-3 rounded-lg border bg-muted/10 text-sm">
                     <div className="space-y-1">
                        <div className="flex items-center gap-2">
                           <span className="font-bold">{h.clienteNome}</span>
                           <Badge variant="outline" className="text-[10px] h-4 py-0 uppercase">
                              {h.tipo === "acumulo" ? "Acúmulo" : "Resgate"}
                           </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{h.descricao} • {new Date(h.data).toLocaleDateString("pt-BR")}</p>
                     </div>
                     <div className="text-right">
                        <p className={`font-bold ${h.pontos > 0 ? "text-emerald-600" : "text-destructive"}`}>
                           {h.pontos > 0 ? "+" : ""}{h.pontos} pts
                        </p>
                        <p className="text-[10px] text-muted-foreground">{formatCurrency(h.valor)}</p>
                     </div>
                  </div>
                ))}
             </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={modalMoveOpen} onOpenChange={setModalMoveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Movimentar Pontos</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center text-muted-foreground italic">
             Funcionalidade em migração...
          </div>
          <DialogFooter>
            <Button onClick={() => setModalMoveOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={modalConfigOpen} onOpenChange={setModalConfigOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurações do Programa</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center text-muted-foreground italic">
             Configurações de fidelidade em migração...
          </div>
          <DialogFooter>
            <Button onClick={() => setModalConfigOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={modalResgateOpen} onOpenChange={setModalResgateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resgatar Pontos</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center text-muted-foreground italic">
             Módulo de resgate em migração...
          </div>
          <DialogFooter>
            <Button onClick={() => setModalResgateOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PagesLayout>
  );
};

export default Fidelidade;
