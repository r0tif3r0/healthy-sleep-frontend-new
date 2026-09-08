import { createContext } from 'react';

export type ToastTone = 'ok' | 'bad' | 'info';

export interface ToastApi {
	show: (toast: { title: string; description?: string; tone?: ToastTone }) => void;
}

export const ToastContext = createContext<ToastApi | null>(null);
