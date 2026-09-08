import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/shared/lib/cn';
import { CloseIcon } from '@/shared/icons';
import { Button } from './Button';

interface ModalProps {
	open: boolean;
	onClose: () => void;
	title: ReactNode;
	description?: ReactNode;
	footer?: ReactNode;
	size?: 'sm' | 'md' | 'lg';
	children?: ReactNode;
}

const SIZES = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-5xl' } as const;

export function Modal({ open, onClose, title, description, footer, size = 'sm', children }: ModalProps) {
	const dialogRef = useRef<HTMLDivElement>(null);
	const returnFocusTo = useRef<HTMLElement | null>(null);

	useEffect(() => {
		if (!open) return;

		returnFocusTo.current = document.activeElement as HTMLElement | null;
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') onClose();
		};

		document.addEventListener('keydown', onKeyDown);
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		dialogRef.current?.focus();

		return () => {
			document.removeEventListener('keydown', onKeyDown);
			document.body.style.overflow = previousOverflow;
			returnFocusTo.current?.focus?.();
		};
	}, [open, onClose]);

	if (!open) return null;

	return createPortal(
		<div
			className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-night-950/55 p-4 backdrop-blur-[2px]"
			onMouseDown={(event) => {
				if (event.target === event.currentTarget) onClose();
			}}
		>
			<div
				ref={dialogRef}
				role="dialog"
				aria-modal="true"
				tabIndex={-1}
				className={cn(
					'w-full rounded-card-lg border border-line bg-surface p-6 shadow-card-lg outline-none',
					SIZES[size],
				)}
			>
				<div className="flex items-start justify-between gap-4">
					<div className="flex flex-col gap-2">
						<h2 className="font-display text-lg font-bold text-ink">{title}</h2>
						{description && <p className="text-sm leading-relaxed text-ink-2">{description}</p>}
					</div>
					<button
						type="button"
						onClick={onClose}
						aria-label="Закрыть"
						className="-mt-1 -mr-1 flex h-9 w-9 flex-none items-center justify-center rounded-lg text-ink-3 hover:bg-surface-2 hover:text-ink"
					>
						<CloseIcon size={18} />
					</button>
				</div>

				{children && <div className="mt-5">{children}</div>}
				{footer && <div className="mt-6 flex justify-end gap-3">{footer}</div>}
			</div>
		</div>,
		document.body,
	);
}

interface ConfirmModalProps {
	open: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title: string;
	description?: ReactNode;
	confirmLabel: string;
	loading?: boolean;
	danger?: boolean;
	children?: ReactNode;
}

/** Подтверждение необратимого действия: выход, отвязка, перевыпуск ссылки. */
export function ConfirmModal({
	open,
	onClose,
	onConfirm,
	title,
	description,
	confirmLabel,
	loading,
	danger,
	children,
}: ConfirmModalProps) {
	return (
		<Modal
			open={open}
			onClose={onClose}
			title={title}
			description={description}
			footer={
				<>
					<Button variant="secondary" onClick={onClose}>
						Отмена
					</Button>
					<Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>
						{confirmLabel}
					</Button>
				</>
			}
		>
			{children}
		</Modal>
	);
}
