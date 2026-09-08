import { useEffect, useMemo, useState } from 'react';
import { clampRangeToAvailable, lastMonthWithData, presetRange } from '@/shared/lib/dates';
import type { DateRange } from '@/shared/lib/metrics';

/**
 * Период по умолчанию — последние 30 дней, заканчивающиеся вчера.
 *
 * Если пациент загрузил архив с давними данными, такой период окажется пустым,
 * и экран показал бы «данных нет» при полной базе. Поэтому период один раз
 * подтягивается к последним данным.
 *
 * `ready` нужен, чтобы запрос статистики ушёл уже с подтянутым периодом:
 * иначе на каждой загрузке экрана уходит лишний запрос за пустой период.
 */
export function useStatsPeriod(availableDates: string[] | undefined) {
	const [range, setRange] = useState<DateRange>(() => presetRange(30));
	const [ready, setReady] = useState(false);

	useEffect(() => {
		if (ready || !availableDates) return;

		if (availableDates.length > 0) {
			setRange((current) => clampRangeToAvailable(current, availableDates));
		}
		setReady(true);
	}, [availableDates, ready]);

	const defaultMonth = useMemo(
		() => lastMonthWithData(availableDates ?? []) ?? undefined,
		[availableDates],
	);

	return { range, setRange, defaultMonth, ready };
}
