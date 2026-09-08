import type { PatientsParams } from './types';

/** Ключи запросов собираются только здесь — иначе инвалидация промахивается. */
export const queryKeys = {
	profile: () => ['profile'] as const,
	devices: () => ['devices'] as const,
	patients: (params: PatientsParams) => ['patients', params] as const,
	patient: (privateId: string) => ['patient', privateId] as const,
	availableDates: (privateId: string) => ['availableDates', privateId] as const,
	cpapStats: (privateId: string, from: string, to: string) =>
		['cpapStats', privateId, from, to] as const,
};
