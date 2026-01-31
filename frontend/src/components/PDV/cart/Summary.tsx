import React from "react";
import { calPercentual } from "@/utils/cart/calculeIncreaseOrDecrease";
import { formatCurrency } from "@/utils/formatCurrency";
import { Separator } from "@/components/ui/separator";

interface Props {
  subtotal: number;
  total: number;
  increase: any;
  decrease: any;
}

export default function CartSummary({
  subtotal,
  total,
  increase,
  decrease,
}: Props) {
  const increaseValue =
    increase?.value > 0 ? calPercentual(subtotal, increase) : 0;
  const decreaseValue =
    decrease?.value > 0 ? calPercentual(subtotal, decrease) : 0;

  return (
    <div className="bg-muted/10 rounded-lg p-4 border space-y-3">
      <div className="flex justify-between items-center text-sm">
        <span className="text-muted-foreground">Subtotal</span>
        <span className="font-medium">{formatCurrency(subtotal)}</span>
      </div>

      {increase?.value > 0 && (
        <div className="flex justify-between items-center text-sm text-emerald-600">
          <span>
            Acréscimo
            {increase?.type === "PORCENTAGEM" && ` (${increase.value}%)`}
          </span>
          <span className="font-medium">+ {formatCurrency(increaseValue)}</span>
        </div>
      )}

      {decrease?.value > 0 && (
        <div className="flex justify-between items-center text-sm text-destructive">
          <span>
            Desconto
            {decrease?.type === "PORCENTAGEM" && ` (${decrease?.value}%)`}
          </span>
          <span className="font-medium">- {formatCurrency(decreaseValue)}</span>
        </div>
      )}

      <Separator />

      <div className="flex justify-between items-center">
        <span className="font-bold text-lg">Total</span>
        <span className="font-bold text-xl text-primary">{formatCurrency(total)}</span>
      </div>
    </div>
  );
}
