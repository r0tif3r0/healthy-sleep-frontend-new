import { useState } from 'react';
import { CalendarIcon } from '@/shared/icons';
import { formatDateRange } from '@/shared/lib/format';
import { presetRange, type PresetDays } from '@/shared/lib/dates';
import type { DateRange } from '@/shared/lib/metrics';
import { Button, Modal, DateRangePicker, SegmentedControl } from '@/shared/ui';

interface PeriodPickerProps {
	value: DateRange;
	onChange: (range: DateRange) => void;
	availableDates: string[];
	defaultMonth?: Date;
}

const PRESETS: Array<{ value: PresetDays; label: string }> = [
	{ value: 7, label: '7 дней' },
	{ value: 30, label: '30 дней' },
	{ value: 90, label: '90 дней' },
];

export function PeriodPicker({ value, onChange, availableDates, defaultMonth }: PeriodPickerProps) {
	const [open, setOpen] = useState(false);
	const [preset, setPreset] = useState<PresetDays | null>(30);

	return (
		<div className="flex flex-wrap items-center gap-2.5">
			<SegmentedControl
				aria-label="Период"
				value={preset ?? 0}
				options={PRESETS}
				onChange={(days) => {
					setPreset(days as PresetDays);
					onChange(presetRange(days as PresetDays));
				}}
			/>

			<Button
				variant="secondary"
				icon={<CalendarIcon size={16} className="text-brand-600" />}
				onClick={() => setOpen(true)}
			>
				<span className="tnum">{formatDateRange(value.from, value.to)}</span>
			</Button>

			<Modal open={open} onClose={() => setOpen(false)} title="Выберите период" size="sm">
				<DateRangePicker
					value={value}
					availableDates={availableDates}
					defaultMonth={defaultMonth}
					onChange={(range) => {
						setPreset(null);
						onChange(range);
						setOpen(false);
					}}
				/>
			</Modal>
		</div>
	);
}
