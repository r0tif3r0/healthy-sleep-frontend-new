import { describe, expect, it } from 'vitest';
import {
	availableDatesSet,
	clampRangeToAvailable,
	isRangeValid,
	lastMonthWithData,
	presetRange,
	toApiDate,
	yesterday,
} from './dates';

const today = new Date('2026-09-07T10:00:00');

describe('дата для API', () => {
	it('собирается из локальных частей, а не через toISOString', () => {
		// Полночь по местному времени восточнее Гринвича в UTC — это ещё вчера.
		expect(toApiDate(new Date(2026, 8, 6, 0, 30))).toBe('2026-09-06');
		expect(toApiDate(new Date(2026, 0, 1))).toBe('2026-01-01');
	});
});

describe('пресеты периода', () => {
	it('30 дней заканчиваются вчера, потому что сегодня сервер не принимает', () => {
		const r = presetRange(30, today);
		expect(toApiDate(r.to)).toBe('2026-09-06');
		expect(toApiDate(r.from)).toBe('2026-08-08');
	});

	it('7 дней', () => {
		const r = presetRange(7, today);
		expect(toApiDate(r.from)).toBe('2026-08-31');
		expect(toApiDate(r.to)).toBe('2026-09-06');
	});

	it('90 дней', () => {
		const r = presetRange(90, today);
		expect(toApiDate(r.to)).toBe('2026-09-06');
		expect(toApiDate(r.from)).toBe('2026-06-09');
	});

	it('вчерашний день', () => {
		expect(toApiDate(yesterday(today))).toBe('2026-09-06');
	});
});

describe('стартовый месяц календаря', () => {
	it('последний месяц, за который есть данные', () => {
		const month = lastMonthWithData(['2026-03-01', '2026-06-14', '2026-05-02']);
		expect(month && toApiDate(month)).toBe('2026-06-01');
	});

	it('данных нет — null', () => {
		expect(lastMonthWithData([])).toBeNull();
	});
});

describe('валидность периода', () => {
	it('начало не может быть сегодня или позже', () => {
		expect(isRangeValid({ from: new Date(2026, 8, 7), to: new Date(2026, 8, 7) }, today)).toBe(false);
		expect(isRangeValid({ from: new Date(2026, 8, 6), to: new Date(2026, 8, 6) }, today)).toBe(true);
	});

	it('конец не может быть раньше начала', () => {
		expect(isRangeValid({ from: new Date(2026, 8, 6), to: new Date(2026, 8, 1) }, today)).toBe(false);
	});
});

describe('множество доступных дат', () => {
	it('ключи в формате API', () => {
		expect(availableDatesSet(['2026-09-06']).has('2026-09-06')).toBe(true);
		expect(availableDatesSet(['2026-09-06T00:00:00Z']).has('2026-09-06')).toBe(true);
	});
});

describe('подгонка периода под доступные данные', () => {
	it('если период целиком мимо данных, показываем последние 30 дней с данными', () => {
		const available = ['2024-10-01', '2024-10-15', '2024-10-30'];
		const range = clampRangeToAvailable(presetRange(30, today), available);
		expect(toApiDate(range.to)).toBe('2024-10-30');
		expect(toApiDate(range.from)).toBe('2024-10-01');
	});

	it('если данные попадают в период, период не трогаем', () => {
		const available = ['2026-09-05', '2026-09-06'];
		const preset = presetRange(30, today);
		const range = clampRangeToAvailable(preset, available);
		expect(toApiDate(range.from)).toBe(toApiDate(preset.from));
		expect(toApiDate(range.to)).toBe(toApiDate(preset.to));
	});

	it('без данных возвращает исходный период', () => {
		const preset = presetRange(30, today);
		expect(clampRangeToAvailable(preset, [])).toEqual(preset);
	});
});
