import { useEffect, useState } from 'react';

/** Поиск уходит на сервер не на каждую букву. */
export function useDebounced<T>(value: T, delayMs = 300): T {
	const [debounced, setDebounced] = useState(value);

	useEffect(() => {
		const timer = window.setTimeout(() => setDebounced(value), delayMs);
		return () => window.clearTimeout(timer);
	}, [value, delayMs]);

	return debounced;
}
