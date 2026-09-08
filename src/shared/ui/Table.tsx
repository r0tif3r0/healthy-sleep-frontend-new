import type { ReactNode, ThHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';
import { ChevronDownIcon } from '@/shared/icons';

export function Table({ children, className }: { children: ReactNode; className?: string }) {
	return (
		<div className="scroll-slim overflow-x-auto">
			<table className={cn('w-full border-collapse', className)}>{children}</table>
		</div>
	);
}

export function Th({ children, className, ...rest }: ThHTMLAttributes<HTMLTableCellElement>) {
	return (
		<th
			className={cn(
				'pb-3 pr-3 text-left text-[11.5px] font-semibold tracking-[0.05em] text-ink-3 uppercase',
				className,
			)}
			{...rest}
		>
			{children}
		</th>
	);
}

export type SortDirection = 'asc' | 'desc';

interface SortableThProps {
	children: ReactNode;
	active: boolean;
	direction: SortDirection;
	onSort: () => void;
	className?: string;
}

/** Сортировка отправляется на сервер, а не переставляет уже загруженную страницу. */
export function SortableTh({ children, active, direction, onSort, className }: SortableThProps) {
	return (
		<Th className={className} aria-sort={active ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'}>
			<button
				type="button"
				onClick={onSort}
				className="inline-flex items-center gap-1.5 uppercase transition-colors hover:text-ink-2"
			>
				{children}
				<ChevronDownIcon
					size={14}
					className={cn(
						'transition-transform',
						active ? 'text-brand-600' : 'text-ink-4',
						active && direction === 'asc' && 'rotate-180',
					)}
				/>
			</button>
		</Th>
	);
}

export function Td({ children, className }: { children: ReactNode; className?: string }) {
	return <td className={cn('border-t border-line-soft py-4 pr-3 text-[13.5px] align-middle', className)}>{children}</td>;
}

export function Tr({
	children,
	onClick,
	className,
}: {
	children: ReactNode;
	onClick?: () => void;
	className?: string;
}) {
	return (
		<tr
			onClick={onClick}
			className={cn(onClick && 'cursor-pointer transition-colors hover:bg-canvas', className)}
		>
			{children}
		</tr>
	);
}
