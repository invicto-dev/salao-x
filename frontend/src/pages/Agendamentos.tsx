import React from "react";
import { Calendar, Hammer } from "lucide-react";
import PagesLayout from "@/components/layout/PagesLayout";
import { Card, CardContent } from "@/components/ui/card";

const Agendamentos = () => {
  return (
    <PagesLayout
      title="Agendamentos"
      subtitle="Gerencie os horários e serviços agendados"
    >
      <Card className="border-none shadow-sm bg-muted/30">
        <CardContent className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="bg-primary/10 p-6 rounded-full">
            <Hammer className="h-12 w-12 text-primary animate-bounce" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold">Página em Desenvolvimento</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Estamos trabalhando em um novo sistema de agendamentos mais moderno e integrado.
              Em breve você poderá gerenciar sua agenda aqui!
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-primary font-medium bg-primary/5 px-4 py-2 rounded-full border border-primary/10">
             <Calendar className="h-4 w-4" />
             Previsão: Próxima atualização
          </div>
        </CardContent>
      </Card>
    </PagesLayout>
  );
};

export default Agendamentos;
