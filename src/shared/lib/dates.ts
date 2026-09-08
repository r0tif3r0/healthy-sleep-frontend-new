import type { DateRange } from './metrics';
import { parseDate } from './format';

/**
 * Работа с периодами. Два правила, которые здесь закреплены:
 *
 * 1. Дата для API собирается из локальных частей. `toISOString().split('T')[0]`
 *    восточнее Гринвича отдаёт вчерашний день, и пациент теряет последнюю ночь.
 * 2. Период заканчивается вчера: сервер отклоняет запрос, если начало периода
 *    равно сегодняшней дате, а данные за текущие сутки ещё неполны.
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const startOfDay = (date: Date): Date =>
	new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const addDays = (date: Date, days: number): Date =>
	new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

export function toApiDate(date: Date): string {
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${date.getFullYear()}-${month}-${day}`;
}

export function yesterday(today: Date = new Date()): Date {
	return addDays(startOfDay(today), -1);
}

export type PresetDays = 7 | 30 | 90;

export function presetRange(days: PresetDays, today: Date = new Date()): DateRange {
	const to = yesterday(today);
	return { from: addDays(to, -(days - 1)), to };
}

export function availableDatesSet(available: string[]): Set<string> {
	const set = new Set<string>();
	for (const raw of available) {
		const date = parseDate(raw);
		if (date) set.add(toApiDate(date));
	}
	return set;
}

/** Первое число последнего месяца, за который есть данные, — стартовый месяц календаря. */
export function lastMonthWithData(available: string[]): Date | null {
	let latest: Date | null = null;

	for (const raw of available) {
		const date = parseDate(raw);
		if (!date) continue;
		if (!latest || date.getTime() > latest.getTime()) latest = date;
	}

	return latest ? new Date(latest.getFullYear(), latest.getMonth(), 1) : null;
}

export function isRangeValid(range: DateRange, today: Date = new Date()): boolean {
	const from = startOfDay(range.from).getTime();
	const to = startOfDay(range.to).getTime();
	const limit = startOfDay(today).getTime();

	if (Number.isNaN(from) || Number.isNaN(to)) return false;
	if (from >= limit) return false;
	return to >= from;
}

/**
 * Если пациент загрузил архив с давними данными, период по умолчанию окажется
 * пустым, и экран покажет «данных нет» при полной базе. В этом случае
 * показываем последние дни, за которые данные есть.
 */
export function clampRangeToAvailable(range: DateRange, available: string[]): DateRange {
	if (available.length === 0) return range;

	const dates = available
		.map((raw) => parseDate(raw))
		.filter((date): date is Date => date !== null)
		.sort((a, b) => a.getTime() - b.getTime());

	if (dates.length === 0) return range;

	const first = startOfDay(dates[0]).getTime();
	const last = startOfDay(dates[dates.length - 1]).getTime();
	const from = startOfDay(range.from).getTime();
	const to = startOfDay(range.to).getTime();

	const intersects = last >= from && first <= to;
	if (intersects) return range;

	const lengthDays = Math.round((to - from) / MS_PER_DAY);
	const newTo = startOfDay(dates[dates.length - 1]);
	const candidateFrom = addDays(newTo, -lengthDays);

	return {
		from: candidateFrom.getTime() < first ? startOfDay(dates[0]) : candidateFrom,
		to: newTo,
	};
}
