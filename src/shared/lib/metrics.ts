import type { CpapStatEntry } from '@/shared/api/types';

/**
 * Расчёты показателей терапии. Все функции чистые: одни и те же ночи дают
 * одно и то же число на экране пациента, в карточке врача и в PDF-отчёте.
 */

/** Общепринятый порог: ночь считается результативной от четырёх часов терапии. */
export const NIGHT_GOAL_MINUTES = 240;

export type DateRange = { from: Date; to: Date };

export type IndexKey = 'ahi' | 'ai' | 'oai' | 'cai' | 'hi' | 'uai';

export type Status = 'ok' | 'warn' | 'bad' | 'none';

export interface DeviceSettings {
	minPressure: number | null;
	maxPressure: number | null;
	rampMin: number | null;
	rampMax: number | null;
	epr: number | null;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const numbers = (values: Array<number | null | undefined>): number[] =>
	values.filter((v): v is number => typeof v === 'number' && Number.isFinite(v));

const mean = (values: number[]): number | null =>
	values.length === 0 ? null : values.reduce((sum, v) => sum + v, 0) / values.length;

/** Длина периода в днях, оба конца включительно. */
export function daysInRange(range: DateRange): number {
	const from = startOfDay(range.from).getTime();
	const to = startOfDay(range.to).getTime();
	return Math.round((to - from) / MS_PER_DAY) + 1;
}

export function nightsWithData(stats: CpapStatEntry[]): number {
	return stats.length;
}

export function goodNights(stats: CpapStatEntry[]): number {
	return stats.filter((entry) => entry.data.duration >= NIGHT_GOAL_MINUTES).length;
}

/**
 * Доля ночей длиннее четырёх часов от всей длины периода — стандартная методика.
 * Число сильно зависит от выбранного периода, поэтому рядом с ним в интерфейсе
 * всегда стоит пояснение.
 */
export function adherence(stats: CpapStatEntry[], range: DateRange): number {
	const days = daysInRange(range);
	if (days <= 0) return 0;
	return Math.min(100, (goodNights(stats) / days) * 100);
}

/** Среднее по ночам с данными, а не по длине периода. */
export function averageUsageMinutes(stats: CpapStatEntry[]): number | null {
	return mean(numbers(stats.map((entry) => entry.data.duration)));
}

export function averageIndex(stats: CpapStatEntry[], key: IndexKey): number | null {
	return mean(numbers(stats.map((entry) => entry.data[key])));
}

export function averageLeak(stats: CpapStatEntry[]): number | null {
	return mean(numbers(stats.map((entry) => entry.data.leak)));
}

export function averagePressure(stats: CpapStatEntry[]): number | null {
	return mean(numbers(stats.map((entry) => entry.data.mask_pressure)));
}

/**
 * Последние настройки прибора за период. Приборы Prisma и ResVent часть полей
 * не заполняют — такие значения в расчёт не берутся, иначе диапазон схлопывается.
 */
export function deviceSettings(stats: CpapStatEntry[]): DeviceSettings {
	const minPressures = numbers(stats.map((entry) => entry.data.min_pressure));
	const maxPressures = numbers(stats.map((entry) => entry.data.max_pressure));
	const ramps = numbers(stats.map((entry) => entry.data.ramp_time));
	const eprs = numbers(stats.map((entry) => entry.data.epr));

	return {
		minPressure: minPressures.length ? Math.min(...minPressures) : null,
		maxPressure: maxPressures.length ? Math.max(...maxPressures) : null,
		rampMin: ramps.length ? Math.min(...ramps) : null,
		rampMax: ramps.length ? Math.max(...ramps) : null,
		epr: mean(eprs),
	};
}

export function adherenceStatus(percent: number | null): Status {
	if (percent === null || !Number.isFinite(percent)) return 'none';
	if (percent >= 70) return 'ok';
	if (percent >= 50) return 'warn';
	return 'bad';
}

/** Норма по AHI — меньше пяти событий в час, тяжёлое апноэ — от пятнадцати. */
export function ahiStatus(value: number | null): Status {
	if (value === null || !Number.isFinite(value)) return 'none';
	if (value < 5) return 'ok';
	if (value < 15) return 'warn';
	return 'bad';
}

export function leakStatus(value: number | null): Status {
	if (value === null || !Number.isFinite(value)) return 'none';
	return value <= 24 ? 'ok' : 'warn';
}

export function usageStatus(minutes: number | null): Status {
	if (minutes === null || !Number.isFinite(minutes)) return 'none';
	return minutes >= NIGHT_GOAL_MINUTES ? 'ok' : 'warn';
}

export const STATUS_LABEL: Record<Status, string> = {
	ok: 'Норма',
	warn: 'Внимание',
	bad: 'Критично',
	none: 'Нет данных',
};
