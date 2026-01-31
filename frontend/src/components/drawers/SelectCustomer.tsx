import React, { useState } from "react";
import { Search, User, X } from "lucide-react";
import { useCustomers } from "@/hooks/use-customer";
import { useDebounce } from "@/hooks/use-debounce";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (customer: any) => void;
}

export default function SelectCustomerDrawer({
  open,
  onClose,
  onSelect,
}: Props) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const { data: customers = [], isLoading } = useCustomers({
    search: debouncedSearch,
  });

  const handleSelect = (customer: any) => {
    onSelect(customer);
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={(val) => !val && onClose()}>
      <SheetContent className="w-full sm:max-w-md p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="p-6 pb-2">
            <SheetTitle className="text-xl">Vincular Cliente</SheetTitle>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, telefone ou CPF..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
            </div>
          </SheetHeader>

          <ScrollArea className="flex-1 px-6">
            <div className="py-4 space-y-2">
              {isLoading ? (
                <p className="text-center py-10 text-sm text-muted-foreground">Carregando clientes...</p>
              ) : customers.length === 0 ? (
                <p className="text-center py-10 text-sm text-muted-foreground">Nenhum cliente encontrado.</p>
              ) : (
                customers.map((customer: any) => (
                  <div
                    key={customer.id}
                    onClick={() => handleSelect(customer)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors border border-transparent hover:border-border"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{customer.nome.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{customer.nome}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {customer.telefone || customer.cpfCnpj || "Sem documento/contato"}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
