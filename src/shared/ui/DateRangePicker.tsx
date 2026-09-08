import { useMemo, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { ru } from 'date-fns/locale';
import 'react-day-picker/style.css';
import type { DateRange } from '@/shared/lib/metrics';
import { availableDatesSet, startOfDay, toApiDate, yesterday } from '@/shared/lib/dates';
import { formatDateRange } from '@/shared/lib/format';
import { InfoIcon } from '@/shared/icons';
import { Button } from './Button';

interface DateRangePickerProps {
	value: DateRange;
	onChange: (range: DateRange) => void;
	availableDates: string[];
	/** Месяц, на котором открывается календарь: последний месяц с данными. */
	defaultMonth?: Date;
}

const classNames = {
	root: 'w-full text-ink',
	months: 'flex',
	month: 'w-full',
	month_caption: 'flex h-8 items-center font-display text-base font-bold capitalize',
	caption_label: 'text-base',
	nav: 'absolute right-0 top-0 flex gap-1.5',
	button_previous:
		'flex h-7 w-7 items-center justify-center rounded-[9px] border border-line text-ink-2 hover:bg-surface-2 disabled:opacity-40',
	button_next:
		'flex h-7 w-7 items-center justify-center rounded-[9px] border border-line text-ink-2 hover:bg-surface-2 disabled:opacity-40',
	month_grid: 'mt-3 w-full border-collapse',
	weekdays: 'text-[11px] font-semibold text-ink-3',
	weekday: 'pb-1 font-semibold',
	day: 'tnum p-0.5 text-center text-[13px]',
	day_button:
		'flex h-8 w-full items-center justify-center rounded-[9px] transition-colors hover:bg-surface-2 disabled:pointer-events-none disabled:text-ink-4',
	today: 'font-bold',
	outside: 'text-ink-4',
	disabled: 'text-ink-4',
	hidden: 'invisible',
};

export function DateRangePicker({ value, onChange, availableDates, defaultMonth }: DateRangePickerProps) {
	const [draft, setDraft] = useState<{ from?: Date; to?: Date }>({ from: value.from, to: value.to });

	const dataDays = useMemo(() => {
		const set = availableDatesSet(availableDates);
		return [...set].map((iso) => {
			const [y, m, d] = iso.split('-').map(Number);
			return new Date(y, m - 1, d);
		});
	}, [availableDates]);

	const limit = yesterday();
	const ready = Boolean(draft.from && draft.to);

	return (
		<div className="flex flex-col gap-4">
			<div className="relative">
				<DayPicker
					mode="range"
					locale={ru}
					selected={draft as DateRange}
					onSelect={(range) => setDraft(range ?? {})}
					defaultMonth={defaultMonth ?? value.to}
					disabled={{ after: limit }}
					modifiers={{ hasData: dataDays }}
					modifiersClassNames={{
						hasData: 'font-semibold text-ink',
						selected: 'bg-brand-600 text-white hover:bg-brand-600',
						range_start: 'bg-night-900 text-white hover:bg-night-900',
						range_end: 'bg-night-900 text-white hover:bg-night-900',
						range_middle: 'bg-brand-050 text-ink hover:bg-brand-050',
					}}
					classNames={classNames}
				/>
			</div>

			{defaultMonth && (
				<p className="flex items-start gap-2 rounded-control bg-brand-050 px-3 py-2.5 text-[11.5px] leading-snug text-ink-2">
					<InfoIcon size={15} className="mt-px flex-none text-brand-600" />
					Открыт последний месяц, за который есть данные
				</p>
			)}

			<div className="h-px bg-line-soft" />

			<div className="flex items-center justify-between gap-3">
				<span className="tnum text-[13px] font-semibold">
					{draft.from && draft.to ? formatDateRange(draft.from, draft.to) : 'Выберите период'}
				</span>
				<Button
					size="sm"
					variant="primary"
					disabled={!ready}
					onClick={() => {
						if (draft.from && draft.to) {
							onChange({ from: startOfDay(draft.from), to: startOfDay(draft.to) });
						}
					}}
				>
					Применить
				</Button>
			</div>

			{draft.from && toApiDate(draft.from) === toApiDate(startOfDay(new Date())) && (
				<p className="text-[11.5px] text-accent-700">
					Сегодняшний день недоступен как начало периода: данные за текущие сутки ещё неполны.
				</p>
			)}
		</div>
	);
}
