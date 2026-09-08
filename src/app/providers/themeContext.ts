import { createContext } from 'react';

export type Theme = 'light' | 'dark';

export interface ThemeApi {
	theme: Theme;
	setTheme: (theme: Theme) => void;
	toggle: () => void;
}

export const ThemeContext = createContext<ThemeApi | null>(null);
