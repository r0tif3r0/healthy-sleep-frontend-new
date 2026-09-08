import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
	/** Тёмная карточка для пояснений и акцентных врезок внутри светлой области. */
	tone?: 'surface' | 'night';
	padding?: 'none' | 'sm' | 'md';
}

export function Card({ tone = 'surface', padding = 'md', className, children, ...rest }: CardProps) {
	return (
		<div
			className={cn(
				'rounded-card',
				tone === 'surface' ? 'border border-line bg-surface shadow-card' : 'bg-night-900 text-white',
				padding === 'md' && 'p-5',
				padding === 'sm' && 'p-4',
				className,
			)}
			{...rest}
		>
			{children}
		</div>
	);
}

interface CardHeaderProps {
	title: ReactNode;
	subtitle?: ReactNode;
	action?: ReactNode;
	className?: string;
}

export function CardHeader({ title, subtitle, action, className }: CardHeaderProps) {
	return (
		<div className={cn('flex items-start justify-between gap-4', className)}>
			<div className="flex flex-col gap-1">
				<h2 className="font-display text-base font-bold text-ink">{title}</h2>
				{subtitle && <p className="text-[11.5px] text-ink-3">{subtitle}</p>}
			</div>
			{action}
		</div>
	);
}
