import React, { useState } from "react";
import { Input } from "antd";

interface NameInputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
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

export const NameInput: React.FC<NameInputProps> = ({
  value,
  onChange,
  placeholder = "Digite seu nome",
}) => {
  const [internalValue, setInternalValue] = useState(value || "");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    setInternalValue(rawValue);
    if (onChange) onChange(rawValue);
  };

  const handleBlur = () => {
    const formatted = internalValue
      .split(" ")
      .filter(Boolean)
      .map(formatWord)
      .join(" ");
    setInternalValue(formatted);
    if (onChange) onChange(formatted);
  };

  return (
    <Input
      value={internalValue || value}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
    />
  );
};
