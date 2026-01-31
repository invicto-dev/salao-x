import React, { useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { ScanBarcode, Search } from "lucide-react";
import { toast } from "sonner";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  sourceLength?: number;
  onChangeValue?: (value: string) => void;
  value?: string;
}

export default function BarCodeInput({
  label = "item",
  sourceLength,
  onChangeValue,
  value,
  ...props
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (!value || value.trim() === "") return;

      if (sourceLength === 0) {
        toast.error(`Nenhum ${label} encontrado com o código informado.`);
        return;
      }

      if (onChangeValue) onChangeValue(value);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        ref={inputRef}
        placeholder={`Buscar ${label}...`}
        className="pl-9 pr-9"
        value={value}
        onChange={(e) => onChangeValue?.(e.target.value)}
        onKeyDown={handleKeyDown}
        {...props}
      />
      <ScanBarcode className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
    </div>
  );
}
