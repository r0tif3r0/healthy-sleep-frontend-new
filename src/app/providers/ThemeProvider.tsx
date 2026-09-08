import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { ThemeContext, type Theme } from './themeContext';

const STORAGE_KEY = 'hs.theme';

const readStored = (): Theme => {
	try {
		const stored = window.localStorage.getItem(STORAGE_KEY);
		return stored === 'dark' || stored === 'light' ? stored : 'light';
	} catch {
		return 'light';
	}
};

/**
 * Рабочая область по умолчанию светлая: врач читает таблицы и графики днём.
 * Ночная тема — выбор пользователя, а не режим по умолчанию.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
	const [theme, setTheme] = useState<Theme>(readStored);

	useEffect(() => {
		document.documentElement.dataset.theme = theme;
		try {
			window.localStorage.setItem(STORAGE_KEY, theme);
		} catch {
			// Запрет на хранилище не должен ломать переключение темы в текущей вкладке.
		}
	}, [theme]);

	const toggle = useCallback(() => setTheme((current) => (current === 'dark' ? 'light' : 'dark')), []);
	const value = useMemo(() => ({ theme, setTheme, toggle }), [theme, toggle]);

	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
