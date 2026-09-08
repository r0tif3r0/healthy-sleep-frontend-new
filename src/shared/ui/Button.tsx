import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { Spinner } from './Spinner';

export type ButtonVariant = 'primary' | 'dark' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant;
	size?: ButtonSize;
	loading?: boolean;
	icon?: ReactNode;
	block?: boolean;
}

const VARIANTS: Record<ButtonVariant, string> = {
	// Оранжевый — основное действие. На графиках тот же цвет значит «ниже нормы»,
	// поэтому декоративно он больше нигде не используется.
	primary: 'bg-accent-500 text-white shadow-action hover:bg-accent-400 active:bg-accent-500',
	dark: 'bg-night-900 text-white hover:bg-night-800',
	secondary: 'border border-line bg-surface text-ink-2 hover:border-ink-4 hover:text-ink',
	ghost: 'text-ink-2 hover:bg-surface-2 hover:text-ink',
	danger: 'border border-bad/40 bg-surface text-bad hover:bg-bad-050',
};

const SIZES: Record<ButtonSize, string> = {
	sm: 'h-9 gap-2 px-3.5 text-[13px]',
	md: 'h-11 gap-2.5 px-5 text-sm',
	lg: 'h-[52px] gap-2.5 px-7 text-[15px]',
};

export function Button({
	variant = 'secondary',
	size = 'md',
	loading = false,
	icon,
	block = false,
	className,
	disabled,
	children,
	type = 'button',
	...rest
}: ButtonProps) {
	return (
		<button
			type={type}
			disabled={disabled || loading}
			className={cn(
				'inline-flex items-center justify-center rounded-control font-display font-semibold whitespace-nowrap',
				'transition-colors disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none',
				VARIANTS[variant],
				SIZES[size],
				block && 'w-full',
				className,
			)}
			{...rest}
		>
			{loading ? <Spinner size={16} /> : icon}
			{children}
		</button>
	);
}
