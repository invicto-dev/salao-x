import React, { useEffect } from "react";
import {
  Save,
  Building,
  Bell,
  Database,
  Loader2,
  Globe,
  Settings2
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  useConfiguracoes,
  useConfiguracoesUpdate,
} from "@/hooks/use-configuracoes";
import { getCurrencyCode } from "@/utils/getCurrencyCode";
import packageJson from "../../package.json";
import PagesLayout from "@/components/layout/PagesLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

const configSchema = z.object({
  nomeEmpresa: z.string().min(1, "Nome é obrigatório"),
  cnpj: z.string().optional(),
  endereco: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  cep: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  site: z.string().optional(),
  intervaloPadrao: z.coerce.number().min(5).max(60),
  antecedenciaMinima: z.coerce.number().min(15).max(1440),
  asaasApiKey: z.string().optional(),
  asaasEnvironment: z.string().default("sandbox"),
  asaasActive: z.boolean().default(false),
  timezone: z.string().default("America/Sao_Paulo"),
  currency: z.string().default("BRL"),
});

const Configuracoes = () => {
  const { data, isLoading } = useConfiguracoes();
  const { mutate: updateConfiguracoes, isPending } = useConfiguracoesUpdate();

  const { data: currencies = [] } = useQuery({
    queryKey: ["get-currencies"],
    queryFn: getCurrencyCode,
  });

  const form = useForm({
    resolver: zodResolver(configSchema),
    defaultValues: {
      nomeEmpresa: "",
      cnpj: "",
      endereco: "",
      bairro: "",
      cidade: "",
      cep: "",
      telefone: "",
      email: "",
      site: "",
      intervaloPadrao: 30,
      antecedenciaMinima: 30,
      asaasApiKey: "",
      asaasEnvironment: "sandbox",
      asaasActive: false,
      timezone: "America/Sao_Paulo",
      currency: "BRL",
    },
  });

  useEffect(() => {
    if (data) {
      form.reset({
        ...data,
        email: data.email || "",
      });
    }
  }, [data, form]);

  const onSave = (values: any) => {
    updateConfiguracoes({
      id: data.id,
      body: values,
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <PagesLayout
      title="Configurações"
      subtitle="Gerencie as configurações do sistema e da sua empresa"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
          <Tabs defaultValue="company" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
              <TabsTrigger value="company" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Empresa
              </TabsTrigger>
              <TabsTrigger value="system" className="flex items-center gap-2">
                <Settings2 className="h-4 w-4" />
                Sistema
              </TabsTrigger>
            </TabsList>

            <TabsContent value="company" className="space-y-6 pt-6">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle>Informações da Empresa</CardTitle>
                  <CardDescription>Estes dados serão utilizados em recibos e comunicações.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="nomeEmpresa"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome da Empresa</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome da empresa" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="cnpj"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CNPJ</FormLabel>
                          <FormControl>
                            <Input placeholder="00.000.000/0000-00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="endereco"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço</FormLabel>
                        <FormControl>
                          <Input placeholder="Rua, número" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="bairro"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bairro</FormLabel>
                          <FormControl>
                            <Input placeholder="Bairro" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="cidade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cidade</FormLabel>
                          <FormControl>
                            <Input placeholder="Cidade" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="cep"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CEP</FormLabel>
                          <FormControl>
                            <Input placeholder="00000-000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="telefone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input placeholder="(11) 3333-4444" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="contato@salaox.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="site"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Site</FormLabel>
                        <FormControl>
                          <Input placeholder="www.salaox.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle>Agendamentos</CardTitle>
                  <CardDescription>Padrões para novos agendamentos.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="intervaloPadrao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Intervalo Padrão (minutos)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormDescription>Tempo entre agendamentos.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="antecedenciaMinima"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Antecedência Mínima (minutos)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormDescription>Tempo mínimo para novos agendamentos.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="system" className="space-y-6 pt-6">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle>Integração Asaas</CardTitle>
                  <CardDescription>Configure o crediário automático para seus clientes.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="asaasApiKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>API Key</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="$aact_..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="asaasEnvironment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ambiente</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="sandbox">Sandbox (Testes)</SelectItem>
                              <SelectItem value="production">Produção</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="asaasActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Ativar Integração</FormLabel>
                          <FormDescription>Habilita o uso do Asaas para pagamentos parcelados.</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle>Localização & Moeda</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="timezone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fuso Horário</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="America/Sao_Paulo">São Paulo (GMT-3)</SelectItem>
                            <SelectItem value="America/Rio_Branco">Rio Branco (GMT-5)</SelectItem>
                            <SelectItem value="America/Manaus">Manaus (GMT-4)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Moeda Principal</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[...currencies, { simbolo: "BRL", nome: "Real Brasileiro" }]
                              .sort((a: any, b: any) => a.nome.localeCompare(b.nome))
                              .map((c: any) => (
                                <SelectItem key={c.simbolo} value={c.simbolo}>
                                  {c.nome} ({c.simbolo})
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-muted/30">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">Versão do Sistema</p>
                      <p className="text-2xl font-bold">{packageJson.version}</p>
                    </div>
                    <Database className="h-8 w-8 text-muted-foreground/30" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end pt-4">
             <Button type="submit" size="lg" disabled={isPending}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Salvar Todas as Configurações
             </Button>
          </div>
        </form>
      </Form>
    </PagesLayout>
  );
};

export default Configuracoes;
