import { describe, expect, it } from 'vitest';
import {
	NO_DATA,
	ageFrom,
	formatDate,
	formatDateLong,
	formatDateShort,
	formatDuration,
	formatIndex,
	formatLeak,
	formatNumber,
	formatPercent,
	formatPressure,
	formatRamp,
	fullName,
	initials,
} from './format';

describe('числа', () => {
	it('десятичный разделитель — запятая', () => {
		expect(formatNumber(1.84, 1)).toBe('1,8');
		expect(formatNumber(10, 1)).toBe('10,0');
	});

	it('пусто и ноль различаются', () => {
		expect(formatNumber(null)).toBe(NO_DATA);
		expect(formatNumber(undefined)).toBe(NO_DATA);
		expect(formatNumber(0, 1)).toBe('0,0');
	});

	it('NaN считается отсутствием данных', () => {
		expect(formatNumber(Number.NaN)).toBe(NO_DATA);
	});
});

describe('единицы измерения', () => {
	it('давление в мм рт. ст.', () => {
		expect(formatPressure(10.42)).toBe('10,4 мм рт. ст.');
	});

	it('индексы в событиях в час, а не в процентах', () => {
		expect(formatIndex(1.84)).toBe('1,8 событий/час');
		expect(formatIndex(1.84)).not.toContain('%');
	});

	it('плавный старт в минутах', () => {
		expect(formatRamp(15)).toBe('15 мин');
	});

	it('утечки в литрах в минуту', () => {
		expect(formatLeak(26.7)).toBe('26,7 л/мин');
		expect(formatLeak(0.7)).toBe('0,7 л/мин');
	});

	it('приверженность в процентах, без дробной части', () => {
		expect(formatPercent(73.33)).toBe('73%');
	});

	it('отсутствующее значение не получает единицу измерения', () => {
		expect(formatPressure(null)).toBe(NO_DATA);
		expect(formatIndex(null)).toBe(NO_DATA);
		expect(formatRamp(null)).toBe(NO_DATA);
		expect(formatLeak(null)).toBe(NO_DATA);
	});
});

describe('длительность', () => {
	it('часы и минуты', () => {
		expect(formatDuration(402)).toBe('6 ч 42 мин');
	});

	it('меньше часа — только минуты', () => {
		expect(formatDuration(47)).toBe('47 мин');
	});

	it('ровно часы — без минут', () => {
		expect(formatDuration(240)).toBe('4 ч');
	});

	it('ноль — это ноль, а не отсутствие данных', () => {
		expect(formatDuration(0)).toBe('0 мин');
		expect(formatDuration(null)).toBe(NO_DATA);
	});
});

describe('ФИО', () => {
	it('без отчества не оставляет лишний пробел', () => {
		expect(fullName({ last_name: 'Иванов', first_name: 'Иван', patronymic: '' })).toBe('Иванов Иван');
		expect(fullName({ last_name: 'Иванов', first_name: 'Иван', patronymic: null })).toBe('Иванов Иван');
	});

	it('обрезает пробелы внутри частей', () => {
		expect(fullName({ last_name: ' Иванов ', first_name: 'Иван', patronymic: '  ' })).toBe('Иванов Иван');
	});

	it('с отчеством склеивает все три части', () => {
		expect(fullName({ last_name: 'Смирнова', first_name: 'Анна', patronymic: 'Петровна' })).toBe(
			'Смирнова Анна Петровна',
		);
	});

	it('инициалы — из фамилии и имени', () => {
		expect(initials({ last_name: 'Смирнова', first_name: 'Анна' })).toBe('СА');
		expect(initials({ last_name: '', first_name: '' })).toBe('—');
	});
});

describe('даты', () => {
	it('короткий формат', () => {
		expect(formatDate('2026-09-06')).toBe('06.09.2026');
	});

	it('длинный формат', () => {
		expect(formatDateLong('2026-09-06')).toBe('6 сентября 2026');
	});

	it('сокращённый формат', () => {
		expect(formatDateShort('2026-09-06')).toBe('6 сен 2026');
	});

	it('принимает дату со временем', () => {
		expect(formatDate('2026-09-06T09:14:00Z')).toBe('06.09.2026');
	});

	it('возраст на заданную дату', () => {
		expect(ageFrom('1971-03-14', new Date('2026-09-06'))).toBe(55);
		expect(ageFrom('1971-12-14', new Date('2026-09-06'))).toBe(54);
	});

	it('пустая дата не ломает форматирование', () => {
		expect(formatDate(null)).toBe(NO_DATA);
		expect(formatDateLong(undefined)).toBe(NO_DATA);
		expect(ageFrom(null)).toBeNull();
	});

	it('нечитаемая дата не выбрасывает исключение', () => {
		expect(formatDate('не дата')).toBe(NO_DATA);
	});
});
