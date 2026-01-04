import { Input, InputProps, message } from "antd";
import { ScanBarcode, Search } from "lucide-react";
import { useEffect, useRef } from "react";

interface Props extends InputProps {
  label?: string;
  sourceLength?: number;
  onChangeValue?: (value: string) => void;
  value?: string;
}

export default function BarCodeInput({
  label,
  sourceLength,
  onChangeValue,
  value,
  ...props
}: Props) {
  const inputRef = useRef<any>(null);

  const handleScan = async () => {
    if (!value || (value as string).trim() === "") return;

    if (sourceLength === 0) {
      message.error(`Nenhum ${label} encontrado com o código informado.`);
      return;
    }

    onChangeValue(value);
  };

  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus?.();
    }, 100);
  }, []);

  return (
    <Input
      ref={inputRef}
      placeholder="Leia o código de barras ou busque pelo nome..."
      prefix={<Search size={14} />}
      suffix={<ScanBarcode size={14} />}
      value={value}
      onChange={(e) => onChangeValue(e.target.value)}
      onPressEnter={handleScan}
      allowClear
      {...props}
    />
  );
}
