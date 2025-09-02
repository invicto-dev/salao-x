import React from "react";
import { Input } from "antd";

interface PhoneInputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

const formatPhone = (value: string): string => {
  const digits = value.replace(/\D/g, "");

  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
};

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  placeholder = "(11) 99999-9999",
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formatted = formatPhone(rawValue);
    if (onChange) onChange(formatted);
  };

  return (
    <Input
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      maxLength={15}
    />
  );
};
