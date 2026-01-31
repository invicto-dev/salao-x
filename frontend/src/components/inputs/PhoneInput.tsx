import React from "react";
import { Input } from "@/components/ui/input";

interface PhoneInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const formatPhone = (value: string): string => {
  const digits = value.replace(/\D/g, "");

  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
};

export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value, onChange, placeholder = "(11) 99999-9999", ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatPhone(e.target.value);

      if (onChange) {
        const newEvent = {
          ...e,
          target: {
            ...e.target,
            value: formatted,
          },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(newEvent);
      }
    };

    return (
      <Input
        ref={ref}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        maxLength={15}
        {...props}
      />
    );
  }
);

PhoneInput.displayName = "PhoneInput";
