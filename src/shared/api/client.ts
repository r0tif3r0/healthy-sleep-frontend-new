import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { env } from '@/shared/config/env';
import { isTokenInvalid } from './errors';
import { tokens } from './tokens';
import type { RefreshResponse } from './types';

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

export const apiClient = axios.create({ baseURL: env.apiBaseUrl });

let refreshing: Promise<string> | null = null;
let unauthorizedHandler: (() => void) | null = null;

/** Слой авторизации подписывается сюда, чтобы узнать, что сессия кончилась. */
export function onUnauthorized(handler: (() => void) | null): void {
	unauthorizedHandler = handler;
}

async function requestNewAccess(): Promise<string> {
	const refresh = tokens.getRefresh();
	if (!refresh) throw new AxiosError('Нет токена обновления');

	const { data } = await axios.post<RefreshResponse>(`${env.apiBaseUrl}/auth/refresh/`, { refresh });
	tokens.setAccess(data.access);
	return data.access;
}

apiClient.interceptors.request.use((config) => {
	const access = tokens.getAccess();
	if (access) config.headers.Authorization = `Bearer ${access}`;
	return config;
});

apiClient.interceptors.response.use(
	(response) => response,
	async (error: AxiosError) => {
		const config = error.config as RetriableConfig | undefined;

		if (!config || config._retry || !isTokenInvalid(error)) {
			return Promise.reject(error);
		}

		config._retry = true;

		try {
			// Одно обновление на всю пачку одновременно упавших запросов:
			// после входа на экран статистики их сразу пять.
			if (!refreshing) {
				refreshing = requestNewAccess().finally(() => {
					refreshing = null;
				});
			}

			const access = await refreshing;
			config.headers.Authorization = `Bearer ${access}`;
			return await apiClient(config);
		} catch (refreshError) {
			tokens.clear();
			unauthorizedHandler?.();
			return Promise.reject(refreshError);
		}
	},
);
