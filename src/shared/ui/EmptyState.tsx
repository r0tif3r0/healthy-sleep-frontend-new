import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

interface EmptyStateProps {
	title: string;
	description?: ReactNode;
	illustration?: ReactNode;
	action?: ReactNode;
	className?: string;
}

/**
 * Пустое состояние вместо модального окна поверх пустого экрана: пациент должен
 * видеть, что делать дальше, а не закрывать окно и оставаться ни с чем.
 */
export function EmptyState({
	title,
	description,
	illustration,
	action,
	className,
}: EmptyStateProps) {
	return (
		<div
			className={cn(
				'flex flex-col items-center gap-5 rounded-card border border-line bg-surface px-6 py-12 text-center',
				className,
			)}
		>
			{illustration}
			<div className="flex max-w-md flex-col gap-2">
				<h3 className="font-display text-lg font-bold text-ink">{title}</h3>
				{description && <p className="text-sm leading-relaxed text-ink-2">{description}</p>}
			</div>
			{action}
		</div>
	);
}
