import { InputNumber, InputNumberProps } from "antd";

interface Props extends InputNumberProps {}

export const CurrencyInput = ({ ...props }: Props) => {
  return (
    <InputNumber
      autoFocus
      stringMode
      prefix="R$ "
      decimalSeparator=","
      precision={2}
      parser={(value) =>
        value!.replace(/\s?R\$\s?|(\.*)/g, "").replace(",", ".")
      }
      style={{ width: "100%" }}
      {...props}
    />
  );
};
