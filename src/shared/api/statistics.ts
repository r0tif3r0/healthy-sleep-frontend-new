import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { DateRange } from '@/shared/lib/metrics';
import { toApiDate } from '@/shared/lib/dates';
import { apiClient } from './client';
import { queryKeys } from './queryKeys';
import type { CpapStatEntry } from './types';

export const useAvailableDates = (privateId: string) =>
	useQuery({
		queryKey: queryKeys.availableDates(privateId),
		queryFn: async (): Promise<string[]> => {
			const { data } = await apiClient.get<{ available_dates: string[] }>(
				`/statistics/get_dates/${privateId}/`,
			);
			return data.available_dates ?? [];
		},
		enabled: Boolean(privateId),
		staleTime: 60_000,
	});

/**
 * Запрос включается, только когда известен приватный идентификатор и есть хотя бы
 * одна дата с данными: иначе сервер получает бессмысленный запрос на каждом рендере.
 */
export const useCpapStats = (privateId: string, range: DateRange, hasData: boolean) => {
	const from = toApiDate(range.from);
	const to = toApiDate(range.to);

	return useQuery({
		queryKey: queryKeys.cpapStats(privateId, from, to),
		queryFn: async (): Promise<CpapStatEntry[]> => {
			const { data } = await apiClient.get<CpapStatEntry[]>(
				`/statistics/cpap_stats/${privateId}/`,
				{ params: { from, to } },
			);
			return data;
		},
		enabled: Boolean(privateId) && hasData,
		/*
		 * Смена периода меняет ключ запроса. Без этого экран на время загрузки
		 * оставался без данных и подменялся скелетоном: страница схлопывалась
		 * и дёргалась. Держим прошлый период на экране, пока едет новый, —
		 * графики тогда переходят анимацией, а не пересобираются с нуля.
		 */
		placeholderData: keepPreviousData,
	});
};
