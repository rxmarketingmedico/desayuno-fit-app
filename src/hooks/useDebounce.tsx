import { useEffect, useState } from "react";

/**
 * Retorna um valor "atrasado" — só atualiza após `delay` ms sem mudanças.
 * Útil para inputs de busca, evitando rerender/filtragem em cada tecla.
 */
export function useDebounce<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}
