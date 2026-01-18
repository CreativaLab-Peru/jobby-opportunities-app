import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Definimos el temporizador
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpieza: si el valor cambia antes de que termine el delay,
    // cancelamos el anterior y empezamos uno nuevo.
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
