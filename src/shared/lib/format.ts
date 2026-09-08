/**
 * Единственное место, где показателю назначается единица измерения.
 *
 * Из-за того что в прежнем фронтенде единицы писались прямо в разметке,
 * индексы дыхательных событий выводились со знаком процента, а плавный старт —
 * в секундах вместо минут. Здесь это задано один раз.
 */

export const NO_DATA = 'Нет данных';

export const UNITS = {
	/** Решение заказчика: в заключениях центра давление приводится в мм рт. ст. */
	pressure: 'мм рт. ст.',
	index: 'событий/час',
	ramp: 'мин',
	leak: 'л/мин',
} as const;

const MONTHS_GENITIVE = [
	'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
	'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
];

const MONTHS_SHORT = [
	'янв', 'фев', 'мар', 'апр', 'мая', 'июн',
	'июл', 'авг', 'сен', 'окт', 'ноя', 'дек',
];

type Numeric = number | null | undefined;
type NameParts = {
	last_name?: string | null;
	first_name?: string | null;
	patronymic?: string | null;
};

const isNumber = (v: Numeric): v is number => typeof v === 'number' && Number.isFinite(v);

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Разбирает дату из API. Строку вида «2026-09-06» собирает как локальную дату,
 * а не как полночь UTC: иначе восточнее Гринвича день уезжает назад
 * и пациент теряет последнюю ночь.
 */
export function parseDate(value: string | null | undefined): Date | null {
	if (!value) return null;

	const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
	if (dateOnly) {
		const [, y, m, d] = dateOnly;
		return new Date(Number(y), Number(m) - 1, Number(d));
	}

	const parsed = new Date(value);
	return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatNumber(value: Numeric, digits = 1): string {
	if (!isNumber(value)) return NO_DATA;
	return value.toFixed(digits).replace('.', ',');
}

export function formatPressure(value: Numeric): string {
	if (!isNumber(value)) return NO_DATA;
	return `${formatNumber(value, 1)} ${UNITS.pressure}`;
}

export function formatIndex(value: Numeric): string {
	if (!isNumber(value)) return NO_DATA;
	return `${formatNumber(value, 1)} ${UNITS.index}`;
}

export function formatRamp(value: Numeric): string {
	if (!isNumber(value)) return NO_DATA;
	return `${formatNumber(value, 0)} ${UNITS.ramp}`;
}

export function formatLeak(value: Numeric): string {
	if (!isNumber(value)) return NO_DATA;
	// Один знак после запятой: у ResMed утечки бывают меньше единицы,
	// и округление до целого превращает 0,7 в «0» — читается как «утечек нет».
	return `${formatNumber(value, 1)} ${UNITS.leak}`;
}

export function formatPercent(value: Numeric): string {
	if (!isNumber(value)) return NO_DATA;
	return `${formatNumber(value, 0)}%`;
}

/** Длительность терапии за ночь. Ноль минут — это значение, а не пропуск. */
export function formatDuration(minutes: Numeric): string {
	if (!isNumber(minutes)) return NO_DATA;

	const total = Math.round(minutes);
	const hours = Math.floor(total / 60);
	const rest = total % 60;

	if (hours === 0) return `${rest} мин`;
	if (rest === 0) return `${hours} ч`;
	return `${hours} ч ${rest} мин`;
}

export function formatDate(value: string | null | undefined): string {
	const date = parseDate(value);
	if (!date) return NO_DATA;
	return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
}

export function formatDateLong(value: string | null | undefined): string {
	const date = parseDate(value);
	if (!date) return NO_DATA;
	return `${date.getDate()} ${MONTHS_GENITIVE[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatDateShort(value: string | null | undefined): string {
	const date = parseDate(value);
	if (!date) return NO_DATA;
	return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]} ${date.getFullYear()}`;
}

/** «8 авг — 6 сен 2026». Год пишется один раз, если он общий. */
export function formatDateRange(from: Date, to: Date): string {
	const sameYear = from.getFullYear() === to.getFullYear();
	const left = sameYear
		? `${from.getDate()} ${MONTHS_SHORT[from.getMonth()]}`
		: `${from.getDate()} ${MONTHS_SHORT[from.getMonth()]} ${from.getFullYear()}`;
	const right = `${to.getDate()} ${MONTHS_SHORT[to.getMonth()]} ${to.getFullYear()}`;
	return `${left} — ${right}`;
}

export function ageFrom(birth: string | null | undefined, at: Date = new Date()): number | null {
	const date = parseDate(birth);
	if (!date) return null;

	let age = at.getFullYear() - date.getFullYear();
	const monthDiff = at.getMonth() - date.getMonth();
	if (monthDiff < 0 || (monthDiff === 0 && at.getDate() < date.getDate())) {
		age -= 1;
	}
	return age;
}

/** Пациент без отчества не должен получать лишний пробел в конце имени. */
export function fullName(user: NameParts | null | undefined): string {
	if (!user) return NO_DATA;

	const parts = [user.last_name, user.first_name, user.patronymic]
		.map((part) => part?.trim())
		.filter((part): part is string => Boolean(part));

	return parts.length > 0 ? parts.join(' ') : NO_DATA;
}

export function initials(user: NameParts | null | undefined): string {
	const last = user?.last_name?.trim()?.[0] ?? '';
	const first = user?.first_name?.trim()?.[0] ?? '';
	const value = `${last}${first}`.toUpperCase();
	return value || '—';
}

/** «55 лет», «61 год», «43 года» — для подписи под именем пациента. */
export function formatAge(years: number | null): string {
	if (years === null) return '';

	const mod10 = years % 10;
	const mod100 = years % 100;

	if (mod10 === 1 && mod100 !== 11) return `${years} год`;
	if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${years} года`;
	return `${years} лет`;
}

/** «1 ночь», «4 ночи», «22 ночи», «11 ночей». */
export function pluralNights(count: number): string {
	const mod10 = count % 10;
	const mod100 = count % 100;
	if (mod10 === 1 && mod100 !== 11) return `${count} ночь`;
	if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${count} ночи`;
	return `${count} ночей`;
}

/**
 * Значение для ячейки плотной таблицы: пропуск — коротким прочерком.
 * «Нет данных» в каждой второй ячейке мешает врачу просматривать тридцать строк.
 */
export function numOrDash(value: Numeric, digits = 1): string {
	const formatted = formatNumber(value, digits);
	return formatted === NO_DATA ? '—' : formatted;
}
