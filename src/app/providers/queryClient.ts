import { QueryClient } from '@tanstack/react-query';

/**
 * Клиент создаётся один раз на модуль. В прежнем фронтенде он пересоздавался
 * на каждый рендер App, и кэш жил до первого изменения состояния.
 */
export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: 1,
			refetchOnWindowFocus: false,
			staleTime: 30_000,
		},
	},
});
