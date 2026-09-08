import { forwardRef, useState } from 'react';
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';
import { EyeIcon, EyeOffIcon } from '@/shared/icons';

const base =
	'w-full rounded-control border bg-surface px-4 text-sm text-ink transition-colors ' +
	'placeholder:text-ink-3 disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-ink-3';

const tone = (invalid?: boolean) =>
	invalid
		? 'border-bad focus:border-bad focus:ring-2 focus:ring-bad/20'
		: 'border-line focus:border-brand-600 focus:ring-2 focus:ring-brand-600/15';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
	invalid?: boolean;
	suffix?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
	{ invalid, suffix, className, ...rest },
	ref,
) {
	if (!suffix) {
		return (
			<input
				ref={ref}
				className={cn(base, tone(invalid), 'h-11 outline-none', className)}
				aria-invalid={invalid || undefined}
				{...rest}
			/>
		);
	}

	return (
		<div className="relative">
			<input
				ref={ref}
				className={cn(base, tone(invalid), 'h-11 pr-11 outline-none', className)}
				aria-invalid={invalid || undefined}
				{...rest}
			/>
			<span className="absolute inset-y-0 right-3 flex items-center text-ink-3">{suffix}</span>
		</div>
	);
});

export const PasswordInput = forwardRef<HTMLInputElement, InputProps>(function PasswordInput(
	{ invalid, className, ...rest },
	ref,
) {
	const [visible, setVisible] = useState(false);

	return (
		<div className="relative">
			<input
				ref={ref}
				type={visible ? 'text' : 'password'}
				className={cn(base, tone(invalid), 'h-11 pr-11 outline-none', className)}
				aria-invalid={invalid || undefined}
				{...rest}
			/>
			<button
				type="button"
				onClick={() => setVisible((v) => !v)}
				aria-label={visible ? 'Скрыть пароль' : 'Показать пароль'}
				className="absolute inset-y-0 right-2 flex w-8 items-center justify-center rounded-lg text-ink-3 hover:text-ink-2"
			>
				{visible ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
			</button>
		</div>
	);
});

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
	invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
	{ invalid, className, rows = 4, ...rest },
	ref,
) {
	return (
		<textarea
			ref={ref}
			rows={rows}
			className={cn(base, tone(invalid), 'resize-y py-3 outline-none', className)}
			aria-invalid={invalid || undefined}
			{...rest}
		/>
	);
});

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
	invalid?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
	{ invalid, className, children, ...rest },
	ref,
) {
	return (
		<select
			ref={ref}
			className={cn(base, tone(invalid), 'h-11 cursor-pointer appearance-none pr-10 outline-none', className)}
			style={{
				backgroundImage:
					"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%235B6C88' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m5 9 7 7 7-7'/%3E%3C/svg%3E\")",
				backgroundRepeat: 'no-repeat',
				backgroundPosition: 'right 12px center',
				backgroundSize: '16px',
			}}
			aria-invalid={invalid || undefined}
			{...rest}
		>
			{children}
		</select>
	);
});
