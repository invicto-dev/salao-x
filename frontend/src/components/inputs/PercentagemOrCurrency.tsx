import React from "react";
import { CurrencyInput } from "./CurrencyInput";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  maxCurrency?: number;
  type: "PORCENTAGEM" | "VALOR";
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  onChangeAddon: (value: "PORCENTAGEM" | "VALOR") => void;
}

export default function PercentageOrCurrencyInput({
  maxCurrency,
  type,
  value,
  onChange,
  disabled,
  onChangeAddon,
}: Props) {
  return (
    <div className="flex w-full">
      <Select value={type} onValueChange={(val: any) => onChangeAddon(val)} disabled={disabled}>
        <SelectTrigger className="w-[70px] rounded-r-none border-r-0 focus:ring-0">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="PORCENTAGEM">%</SelectItem>
          <SelectItem value="VALOR">R$</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex-1">
        {type === "PORCENTAGEM" ? (
          <Input
            type="number"
            min={0}
            max={100}
            disabled={disabled}
            value={value || ""}
            onChange={(e) => onChange(Number(e.target.value))}
            className="rounded-l-none"
            placeholder="0.0"
          />
        ) : (
          <CurrencyInput
            disabled={disabled}
            value={value || 0}
            onChange={(e) => onChange(Number(e.target.value))}
            className="rounded-l-none"
            placeholder="0,00"
          />
        )}
      </div>
    </div>
  );
}
