import { InputNumber, Select } from "antd";
import { CurrencyInput } from "./CurrencyInput";

interface Props {
  maxCurrency?: number;
  type: Sale.increaseOrDecrease["type"];
  value: Sale.increaseOrDecrease["value"];
  onChange: (value: number | string) => void;
  disabled?: boolean;
  onChangeAddon: (value: Props["type"]) => void;
}

export default function PercentageOrCurrencyInput({
  maxCurrency,
  type,
  value,
  onChange,
  disabled,
  onChangeAddon,
}: Props) {
  const commumProps = {
    value: value,
    onChange: onChange,
    disabled: disabled,
    addonBefore: (
      <Select
        value={type}
        onChange={onChangeAddon}
        options={[
          {
            label: "%",
            value: "PORCENTAGEM",
          },
          {
            label: "R$",
            value: "VALOR",
          },
        ]}
      />
    ),
  };

  if (type === "PORCENTAGEM") {
    return (
      <InputNumber
        controls={false}
        className="w-full"
        min={0}
        max={100}
        placeholder="0.0"
        {...commumProps}
      />
    );
  }

  return (
    <CurrencyInput
      max={maxCurrency}
      controls={false}
      prefix={null}
      min={0}
      placeholder="0,00"
      {...commumProps}
    />
  );
}
