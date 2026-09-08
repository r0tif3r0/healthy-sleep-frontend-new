import { cn } from '@/shared/lib/cn';

interface SegmentedControlProps<T extends string | number> {
	value: T;
	options: Array<{ value: T; label: string }>;
	onChange: (value: T) => void;
	className?: string;
	'aria-label'?: string;
}

export function SegmentedControl<T extends string | number>({
	value,
	options,
	onChange,
	className,
	'aria-label': ariaLabel,
}: SegmentedControlProps<T>) {
	return (
		<div
			role="radiogroup"
			aria-label={ariaLabel}
			className={cn('inline-flex gap-0.5 rounded-control border border-line bg-surface p-[3px]', className)}
		>
			{options.map((option) => {
				const active = option.value === value;
				return (
					<button
						key={String(option.value)}
						type="button"
						role="radio"
						aria-checked={active}
						onClick={() => onChange(option.value)}
						className={cn(
							'rounded-[9px] px-4 py-[7px] text-[13px] transition-colors',
							active ? 'bg-night-900 font-semibold text-white' : 'font-medium text-ink-2 hover:text-ink',
						)}
					>
						{option.label}
					</button>
				);
			})}
		</div>
	);
}
