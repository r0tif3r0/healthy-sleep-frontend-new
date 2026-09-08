import { describe, expect, it } from 'vitest';
import type { CpapStatData, CpapStatEntry } from '@/shared/api/types';
import {
	NIGHT_GOAL_MINUTES,
	adherence,
	adherenceStatus,
	ahiStatus,
	averageIndex,
	averageLeak,
	averagePressure,
	averageUsageMinutes,
	daysInRange,
	deviceSettings,
	goodNights,
	leakStatus,
	nightsWithData,
	usageStatus,
} from './metrics';

const night = (date: string, over: Partial<CpapStatData> = {}): CpapStatEntry => ({
	id: Number(date.replaceAll('-', '')),
	date,
	user: 1,
	data: {
		ai: 0.5,
		hi: 0.9,
		ahi: 1.8,
		cai: 0.3,
		epr: 2,
		oai: 0.6,
		uai: 0,
		leak: 20,
		duration: 400,
		ramp_time: 15,
		temperature: 27,
		max_pressure: 13,
		min_pressure: 4,
		mask_pressure: 10,
		...over,
	},
});

const range = (from: string, to: string) => ({ from: new Date(from), to: new Date(to) });

describe('длина периода', () => {
	it('считает оба конца включительно', () => {
		expect(daysInRange(range('2026-09-01', '2026-09-30'))).toBe(30);
		expect(daysInRange(range('2026-09-06', '2026-09-06'))).toBe(1);
	});

	it('переход через месяц', () => {
		expect(daysInRange(range('2026-08-08', '2026-09-06'))).toBe(30);
	});
});

describe('приверженность', () => {
	it('доля ночей длиннее четырёх часов от длины периода', () => {
		const stats = [
			...Array.from({ length: 22 }, (_, i) =>
				night(`2026-08-${String(i + 8).padStart(2, '0')}`, { duration: 400 }),
			),
			...Array.from({ length: 8 }, (_, i) =>
				night(`2026-09-${String(i + 1).padStart(2, '0')}`, { duration: 120 }),
			),
		];
		expect(Math.round(adherence(stats, range('2026-08-08', '2026-09-06')))).toBe(73);
	});

	it('ночь ровно четыре часа считается хорошей', () => {
		expect(goodNights([night('2026-09-01', { duration: NIGHT_GOAL_MINUTES })])).toBe(1);
		expect(goodNights([night('2026-09-01', { duration: NIGHT_GOAL_MINUTES - 1 })])).toBe(0);
	});

	it('пустой период даёт ноль, а не деление на ноль', () => {
		const value = adherence([], range('2026-09-01', '2026-09-30'));
		expect(value).toBe(0);
		expect(Number.isFinite(value)).toBe(true);
	});

	it('никогда не превышает ста процентов', () => {
		const stats = Array.from({ length: 5 }, (_, i) => night(`2026-09-0${i + 1}`));
		expect(adherence(stats, range('2026-09-01', '2026-09-03'))).toBeLessThanOrEqual(100);
	});

	it('считает ночи с данными отдельно от длины периода', () => {
		const stats = [night('2026-09-01'), night('2026-09-02', { duration: 60 })];
		expect(nightsWithData(stats)).toBe(2);
		expect(goodNights(stats)).toBe(1);
	});
});

describe('средние', () => {
	it('длительность считается по ночам с данными, а не по длине периода', () => {
		const stats = [night('2026-09-01', { duration: 300 }), night('2026-09-02', { duration: 500 })];
		expect(averageUsageMinutes(stats)).toBe(400);
	});

	it('пустой список даёт null, а не NaN', () => {
		expect(averageUsageMinutes([])).toBeNull();
		expect(averageIndex([], 'ahi')).toBeNull();
		expect(averageLeak([])).toBeNull();
		expect(averagePressure([])).toBeNull();
	});

	it('null в поле не участвует в среднем', () => {
		const stats = [night('2026-09-01', { leak: 20 }), night('2026-09-02', { leak: null })];
		expect(averageLeak(stats)).toBe(20);
	});

	it('средний индекс по выбранному ключу', () => {
		const stats = [night('2026-09-01', { ahi: 1 }), night('2026-09-02', { ahi: 3 })];
		expect(averageIndex(stats, 'ahi')).toBe(2);
	});
});

describe('настройки прибора', () => {
	it('берёт минимум и максимум по периоду', () => {
		const settings = deviceSettings([
			night('2026-09-01', { min_pressure: 4, max_pressure: 13, ramp_time: 15, epr: 2 }),
			night('2026-09-02', { min_pressure: 5, max_pressure: 12, ramp_time: 20, epr: 2 }),
		]);
		expect(settings.minPressure).toBe(4);
		expect(settings.maxPressure).toBe(13);
		expect(settings.rampMin).toBe(15);
		expect(settings.rampMax).toBe(20);
		expect(settings.epr).toBe(2);
	});

	it('приборы, пишущие null вместо значения, не обнуляют настройки', () => {
		const settings = deviceSettings([
			night('2026-09-01', { ramp_time: null, temperature: null }),
			night('2026-09-02', { ramp_time: 15 }),
		]);
		expect(settings.rampMin).toBe(15);
		expect(settings.rampMax).toBe(15);
	});

	it('пустой список даёт все null', () => {
		expect(deviceSettings([])).toEqual({
			minPressure: null,
			maxPressure: null,
			rampMin: null,
			rampMax: null,
			epr: null,
		});
	});
});

describe('статусы', () => {
	it('приверженность: 70 и выше — норма, ниже 50 — плохо', () => {
		expect(adherenceStatus(73)).toBe('ok');
		expect(adherenceStatus(60)).toBe('warn');
		expect(adherenceStatus(38)).toBe('bad');
	});

	it('AHI: ниже 5 — норма', () => {
		expect(ahiStatus(1.8)).toBe('ok');
		expect(ahiStatus(6.4)).toBe('warn');
		expect(ahiStatus(16)).toBe('bad');
		expect(ahiStatus(null)).toBe('none');
	});

	it('утечки: выше 24 л/мин — внимание', () => {
		expect(leakStatus(18)).toBe('ok');
		expect(leakStatus(27)).toBe('warn');
		expect(leakStatus(null)).toBe('none');
	});

	it('длительность: от четырёх часов — норма', () => {
		expect(usageStatus(402)).toBe('ok');
		expect(usageStatus(180)).toBe('warn');
		expect(usageStatus(null)).toBe('none');
	});
});
