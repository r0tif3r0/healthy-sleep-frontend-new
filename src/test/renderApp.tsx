import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter, Routes } from 'react-router-dom';
import { AuthProvider } from '@/app/providers/AuthProvider';
import { ThemeProvider } from '@/app/providers/ThemeProvider';
import { ToastProvider } from '@/shared/ui';

/** Полное окружение экрана: тема, уведомления, запросы, авторизация, роутер. */
export function renderRoute(path: string, routes: ReactNode) {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false, gcTime: 0 } },
	});

	return render(
		<QueryClientProvider client={queryClient}>
			<ThemeProvider>
				<ToastProvider>
					<MemoryRouter initialEntries={[path]}>
						<AuthProvider>
							<Routes>{routes}</Routes>
						</AuthProvider>
					</MemoryRouter>
				</ToastProvider>
			</ThemeProvider>
		</QueryClientProvider>,
	);
}

