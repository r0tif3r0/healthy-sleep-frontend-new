import { useId } from 'react';
import type { ReactElement, ReactNode } from 'react';
import { cloneElement, isValidElement } from 'react';
import { cn } from '@/shared/lib/cn';

interface FieldProps {
	label?: ReactNode;
	error?: string;
	hint?: ReactNode;
	required?: boolean;
	className?: string;
	children: ReactNode;
}

/**
 * Обёртка поля: метка, подсказка и ошибка. Ошибка показывается у поля,
 * а не общим уведомлением — иначе непонятно, что именно исправлять.
 */
export function Field({ label, error, hint, required, className, children }: FieldProps) {
	const id = useId();
	const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

	const control =
		isValidElement(children) && typeof children.type !== 'string'
			? children
			: isValidElement(children)
				? cloneElement(children as ReactElement<Record<string, unknown>>, {
						id,
						'aria-describedby': describedBy,
					})
				: children;

	return (
		<div className={cn('flex flex-col gap-[7px]', className)}>
			{label && (
				<label htmlFor={id} className="text-[12.5px] font-semibold text-ink-2">
					{label}
					{required && <span className="text-accent-500"> *</span>}
				</label>
			)}
			{control}
			{error ? (
				<p id={`${id}-error`} className="text-xs text-bad">
					{error}
				</p>
			) : (
				hint && (
					<p id={`${id}-hint`} className="text-xs text-ink-3">
						{hint}
					</p>
				)
			)}
		</div>
	);
}
