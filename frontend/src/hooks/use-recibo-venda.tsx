// src/hooks/use-recibo-venda.ts
import { ReciboVenda } from "@/components/modais/ReciboVenda";
import { useState, useCallback } from "react";

export const useReciboVenda = (onCloseCallback?: () => void) => {
  const [vendaParaRecibo, setVendaParaRecibo] = useState<Sale.Props | null>(
    null
  );

  const fecharRecibo = useCallback(() => {
    setVendaParaRecibo(null);
    if (onCloseCallback) {
      onCloseCallback();
    }
  }, [onCloseCallback]);

  const abrirRecibo = (dados: Sale.Props) => {
    setVendaParaRecibo(dados);
  };

  const ReciboComponent = () => (
    <ReciboVenda
      open={!!vendaParaRecibo}
      onClose={fecharRecibo}
      venda={vendaParaRecibo}
    />
  );

  return { ReciboComponent, abrirRecibo };
};
