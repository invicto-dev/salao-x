import React, { useState } from "react";
import { Input } from "@/components/ui/input";

interface NameInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const formatWord = (word: string): string => {
  const lowerCaseWords = ["de", "da", "do", "das", "dos", "e", "em"];

  if (lowerCaseWords.includes(word.toLowerCase())) {
    return word.toLowerCase();
  }

  if (word.includes("Mc") && word.length > 2) {
    return "Mc" + word.charAt(2).toUpperCase() + word.slice(3).toLowerCase();
  }
  if (word.includes("D’") && word.length > 2) {
    return "D’" + word.charAt(2).toUpperCase() + word.slice(3).toLowerCase();
  }

  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
};

export const NameInput = React.forwardRef<HTMLInputElement, NameInputProps>(
  ({ value, onChange, placeholder = "Digite o nome", onBlur, ...props }, ref) => {
    const [internalValue, setInternalValue] = useState(value || "");

    React.useEffect(() => {
      if (value !== undefined) setInternalValue(value);
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInternalValue(e.target.value);
      if (onChange) onChange(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      const formatted = internalValue
        .split(" ")
        .filter(Boolean)
        .map(formatWord)
        .join(" ");

      setInternalValue(formatted);

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

      if (onBlur) onBlur(e);
    };

    return (
      <Input
        {...props}
        ref={ref}
        value={internalValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
      />
    );
  }
);

NameInput.displayName = "NameInput";
