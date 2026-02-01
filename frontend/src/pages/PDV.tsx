import React, { useEffect, useState } from "react";
import {
  Package,
  ShoppingCart,
  Scissors,
  Search,
  Plus,
  Loader2,
  AlertCircle
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { useServices } from "@/hooks/use-services";
import { useSale } from "@/hooks/use-sales";
import { formatCurrency } from "@/utils/formatCurrency";
import { CurrencyInput } from "@/components/inputs/CurrencyInput";
import { useHasOpenCaixa } from "@/hooks/use-caixa";
import BarCodeInput from "@/components/inputs/BarCodeInput";
import { useProducts } from "@/hooks/use-products";
import { CardWithDisabled } from "@/components/cards/cardWithDisabled";
import { useDebounce } from "@/hooks/use-debounce";
import { INITIAL_STATE, PDV_SESSION_KEY } from "@/constants/sales";
import { calPercentual } from "@/utils/cart/calculeIncreaseOrDecrease";
import Cart from "@/components/PDV/cart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

type ItemType = "produto" | "servico";
type ItemProps = any; // Simplify for now

const openValueSchema = z.object({
  preco: z.coerce.number().min(0.01, "O valor deve ser maior que zero"),
});

const PDV = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const pedido = searchParams.get("pedido");
  const { data: sale } = useSale(pedido);

  const [saleSession, setSaleSession] = useState<any>(() => {
    try {
      const savedSession = window.localStorage.getItem(PDV_SESSION_KEY);
      return savedSession ? JSON.parse(savedSession) : INITIAL_STATE(sale);
    } catch (error) {
      console.error("Falha ao carregar sessão do PDV:", error);
      return INITIAL_STATE(sale);
    }
  });

  const { carrinho, acrescimo, desconto } = saleSession;

  const [modalValorAberto, setModalValorAberto] = useState<{
    visible: boolean;
    item: any | null;
    tipo: ItemType | null;
  }>({
    visible: false,
    item: null,
    tipo: null,
  });

  const [busca, setBusca] = useState<string>("");
  const debouncedBusca = useDebounce(busca, 500);

  const { data: produtos = [], isLoading: isLoadingProdutos } = useProducts({
    search: debouncedBusca,
    status: "true",
  });
  const { data: servicos = [], isLoading: isLoadingServicos } = useServices({
    search: debouncedBusca,
    status: "true",
  });
  const { data: hasOpenCaixa, isFetching: isFetchingCaixa } = useHasOpenCaixa();

  const isCaixaFechado = !isFetchingCaixa && !hasOpenCaixa;

  const form = useForm({
    resolver: zodResolver(openValueSchema),
    defaultValues: { preco: 0 },
  });

  const notStockProduct = (id: string) => {
    const cartItem = carrinho?.content.find((c: any) => c.id === id);
    const product = produtos?.find((p: any) => p.id === id);
    return cartItem && product && cartItem.quantidade >= product.estoqueAtual;
  };

  const disabledItem = (item: any) => {
    return (
      (item.contarEstoque && item.estoqueAtual == 0) ||
      (item.contarEstoque && notStockProduct(item.id))
    );
  };

  useEffect(() => {
    if (sale) {
      setSaleSession(INITIAL_STATE(sale));
    }
  }, [sale]);

  useEffect(() => {
    if (!sale) {
      window.localStorage.setItem(PDV_SESSION_KEY, JSON.stringify(saleSession));
    }
  }, [saleSession, sale]);

  const updateSaleSession = (updates: any) => {
    setSaleSession((prev: any) => ({ ...prev, ...updates }));
  };

  const itemExistente = (itemId: string) =>
    carrinho?.content.find((c: any) => c.id === itemId);

  const adicionarAoCarrinho = (item: any, tipo: ItemType) => {
    const itemNoCarrinho = itemExistente(item.id);

    let novoCarrinho;
    if (itemNoCarrinho) {
      novoCarrinho = carrinho.content.map((c: any) =>
        c.id === item.id ? { ...c, quantidade: c.quantidade + 1 } : c
      );
    } else {
      const novoItem: any = {
        id: item.id,
        nome: item.nome,
        tipo,
        preco: item.preco,
        quantidade: 1,
        contarEstoque: item.contarEstoque,
      };
      novoCarrinho = [...carrinho.content, novoItem];
    }
    updateSaleSession({
      carrinho: { mode: carrinho.mode, content: novoCarrinho },
    });
  };

  const handleItemClick = (item: any, tipo: ItemType) => {
    if (item.valorEmAberto && !itemExistente(item.id)) {
      form.reset({ preco: item.preco });
      setModalValorAberto({ visible: true, item, tipo });
    } else {
      adicionarAoCarrinho(item, tipo);
    }
  };

  const handleDefinirValor = (values: { preco: number }) => {
    const { item, tipo } = modalValorAberto;
    if (item && tipo) {
      const itemComNovoPreco = { ...item, preco: values.preco };
      adicionarAoCarrinho(itemComNovoPreco, tipo);
    }
    setModalValorAberto({ visible: false, item: null, tipo: null });
  };

  const calcularSubtotal = () => {
    if (!carrinho?.content?.length) return 0;
    return carrinho.content.reduce(
      (acc: number, item: any) => acc + item.preco * item.quantidade,
      0
    );
  };

  const calcularTotal = () => {
    const subtotal = calcularSubtotal();
    const valorAcrescimo = calPercentual(subtotal, acrescimo);
    const valorDesconto = calPercentual(subtotal, desconto);
    return subtotal + valorAcrescimo - valorDesconto;
  };

  const renderItemsContent = () => (
    <Card className="flex flex-col shadow-sm border-none overflow-hidden h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
           <Package className="h-5 w-5" />
           Produtos e Serviços
        </CardTitle>
        <div className="pt-2">
          <BarCodeInput
            label="produto ou serviço"
            value={busca}
            onChangeValue={setBusca}
            sourceLength={produtos.length + servicos.length}
          />
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0 px-6">
        <ScrollArea className="h-full pr-4 pb-6">
          {!produtos.length && !servicos.length && !isLoadingProdutos && !isLoadingServicos ? (
            <div className="flex flex-col gap-6 justify-center items-center h-64 text-center">
              <div className="bg-muted p-4 rounded-full">
                 <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">Nenhum item encontrado</p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => navigate("/produtos")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Produto
                </Button>
                <Button variant="outline" onClick={() => navigate("/servicos")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Serviço
                </Button>
              </div>
            </div>
          ) : (
            <div className={isCaixaFechado ? "pointer-events-none opacity-50 grayscale" : "space-y-8 py-2"}>
              {produtos.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Produtos</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {produtos.map((produto: any) => (
                      <CardWithDisabled
                        key={produto.id}
                        onClick={() => handleItemClick(produto, "produto")}
                        disabled={disabledItem(produto)}
                        className="p-3 text-left hover:scale-[1.02] transition-transform"
                      >
                        <p className="font-medium text-sm truncate" title={produto.nome}>{produto.nome}</p>
                        <p className="text-primary font-bold">{formatCurrency(produto.preco)}</p>
                        {produto.contarEstoque && (
                          <Badge variant={produto.estoqueAtual > 0 ? "outline" : "destructive"} className="mt-1 text-[10px] h-4">
                            {produto.estoqueAtual > 0 ? `${produto.estoqueAtual} ${produto.unidadeMedida}` : "Sem estoque"}
                          </Badge>
                        )}
                      </CardWithDisabled>
                    ))}
                  </div>
                </div>
              )}

              {servicos.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Serviços</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {servicos.map((servico: any) => (
                      <Card
                        key={servico.id}
                        className="p-3 cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-all hover:scale-[1.02]"
                        onClick={() => handleItemClick(servico, "servico")}
                      >
                        <p className="font-medium text-sm truncate" title={servico.nome}>{servico.nome}</p>
                        <p className="text-primary font-bold">{formatCurrency(servico.preco)}</p>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1">
                          <Scissors className="h-3 w-3" />
                          {servico.duracao}min
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">PDV - Ponto de Venda</h2>
        <p className="text-muted-foreground hidden md:block">Sistema completo para vendas e atendimento</p>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:grid grid-cols-2 gap-6 h-[calc(100vh-200px)] animate-in fade-in duration-500">
        {renderItemsContent()}
        <div className="h-full">
          <Cart
            total={calcularTotal()}
            subtotal={calcularSubtotal()}
            salesSession={saleSession}
            updateSaleSession={updateSaleSession}
          />
        </div>
      </div>

      {/* Mobile/Tablet Layout */}
      <div className="lg:hidden flex-1 overflow-hidden">
        <Tabs defaultValue="items" className="flex flex-col h-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="items" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Itens
            </TabsTrigger>
            <TabsTrigger value="cart" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Carrinho
              {carrinho?.content?.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 min-w-[20px] flex justify-center">
                  {carrinho.content.reduce((acc: number, item: any) => acc + item.quantidade, 0)}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="items" className="flex-1 overflow-hidden mt-0 data-[state=inactive]:hidden">
             {renderItemsContent()}
          </TabsContent>
          <TabsContent value="cart" className="flex-1 overflow-hidden mt-0 data-[state=inactive]:hidden">
            <Cart
              total={calcularTotal()}
              subtotal={calcularSubtotal()}
              salesSession={saleSession}
              updateSaleSession={updateSaleSession}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal Valor Aberto */}
      <Dialog
        open={modalValorAberto.visible}
        onOpenChange={(val) => !val && setModalValorAberto({ visible: false, item: null, tipo: null })}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Definir Valor Aberto</DialogTitle>
          </DialogHeader>

          <Alert className="bg-primary/5 border-primary/20 text-primary">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Item</AlertTitle>
            <AlertDescription>{modalValorAberto.item?.nome}</AlertDescription>
          </Alert>

          <Form {...form}>
            <form id="open-value-form" onSubmit={form.handleSubmit(handleDefinirValor)} className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="preco"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Unitário</FormLabel>
                    <FormControl>
                      <CurrencyInput {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setModalValorAberto({ visible: false, item: null, tipo: null })}>
              Cancelar
            </Button>
            <Button type="submit" form="open-value-form">
              Adicionar ao Carrinho
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PDV;
