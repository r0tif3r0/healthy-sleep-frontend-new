import { useId, useState } from 'react';
import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

interface TooltipProps {
	label: ReactNode;
	children: ReactNode;
	placement?: 'top' | 'bottom';
	className?: string;
}

/**
 * Подсказка открывается и по наведению, и по фокусу с клавиатуры: пояснение
 * к приверженности лечению должно быть доступно не только мышью.
 */
export function Tooltip({ label, children, placement = 'top', className }: TooltipProps) {
	const [open, setOpen] = useState(false);
	const id = useId();

	return (
		<span
			className={cn('relative inline-flex', className)}
			onMouseEnter={() => setOpen(true)}
			onMouseLeave={() => setOpen(false)}
			onFocus={() => setOpen(true)}
			onBlur={() => setOpen(false)}
		>
			<span aria-describedby={open ? id : undefined} tabIndex={0} className="inline-flex outline-none">
				{children}
			</span>
			{open && (
				<span
					id={id}
					role="tooltip"
					className={cn(
						'absolute left-1/2 z-40 w-[min(16rem,calc(100vw-2.5rem))] -translate-x-1/2 rounded-xl bg-night-900 px-3.5 py-2.5 text-xs leading-relaxed text-white shadow-card-lg',
						placement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2',
					)}
				>
					{label}
				</span>
			)}
		</span>
	);
}
