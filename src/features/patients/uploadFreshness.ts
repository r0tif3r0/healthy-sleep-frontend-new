import { parseDate } from '@/shared/lib/format';
import { startOfDay } from '@/shared/lib/dates';

export type Freshness = 'fresh' | 'stale' | 'old' | 'never';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Давность последней выгрузки: по ней врач видит, кого пора дёрнуть. */
export function daysSinceUpload(value: string | null | undefined, now: Date = new Date()): number | null {
	const date = parseDate(value);
	if (!date) return null;
	return Math.round((startOfDay(now).getTime() - startOfDay(date).getTime()) / MS_PER_DAY);
}

export function freshnessOf(value: string | null | undefined, now: Date = new Date()): Freshness {
	const days = daysSinceUpload(value, now);
	if (days === null) return 'never';
	if (days <= 14) return 'fresh';
	if (days <= 30) return 'stale';
	return 'old';
}

export const FRESHNESS_DOT: Record<Freshness, string> = {
	fresh: 'bg-ok',
	stale: 'bg-accent-500',
	old: 'bg-bad',
	never: 'bg-ink-4',
};

export const FRESHNESS_LABEL: Record<Freshness, string> = {
	fresh: 'данные свежие',
	stale: 'больше двух недель без выгрузки',
	old: 'больше месяца без выгрузки',
	never: 'данных ещё не было',
};
