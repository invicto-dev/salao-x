import { useEffect, useState } from "react";

/**
 * Hook de debounce que retorna o valor apenas após o atraso definido.
 *
 * @param value - O valor que será "debounced"
 * @param delay - Tempo de espera em ms antes de atualizar (padrão: 500ms)
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
