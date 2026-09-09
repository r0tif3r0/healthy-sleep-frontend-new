import { useCallback, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/shared/lib/cn';
import { CheckCircleIcon, CloseIcon, InfoIcon, WarningIcon } from '@/shared/icons';

import { ToastContext, type ToastApi, type ToastTone } from './toastContext';

interface ToastItem {
	id: number;
	title: string;
	description?: string;
	tone: ToastTone;
}

const TONE_STYLE: Record<ToastTone, { border: string; icon: ReactNode }> = {
	ok: { border: 'border-l-ok', icon: <CheckCircleIcon size={20} className="text-ok" /> },
	bad: { border: 'border-l-bad', icon: <WarningIcon size={20} className="text-bad" /> },
	info: { border: 'border-l-brand-600', icon: <InfoIcon size={20} className="text-brand-600" /> },
};

export function ToastProvider({ children }: { children: ReactNode }) {
	const [items, setItems] = useState<ToastItem[]>([]);
	const nextId = useRef(1);

	const dismiss = useCallback((id: number) => {
		setItems((current) => current.filter((item) => item.id !== id));
	}, []);

	const show = useCallback<ToastApi['show']>(
		({ title, description, tone = 'info' }) => {
			const id = nextId.current++;
			setItems((current) => [...current, { id, title, description, tone }]);
			window.setTimeout(() => dismiss(id), 6000);
		},
		[dismiss],
	);

	const api = useMemo(() => ({ show }), [show]);

	return (
		<ToastContext.Provider value={api}>
			{children}
			{createPortal(
				<div className="pointer-events-none fixed inset-x-4 top-4 z-[60] flex flex-col gap-3 sm:inset-x-auto sm:top-5 sm:right-5 sm:w-[min(380px,calc(100vw-2.5rem))]">
					{items.map((item) => (
						<div
							key={item.id}
							role="status"
							className={cn(
								'pointer-events-auto flex items-start gap-3 rounded-card border border-line border-l-4 bg-surface p-4 shadow-card-lg',
								TONE_STYLE[item.tone].border,
							)}
						>
							<span className="mt-0.5 flex-none">{TONE_STYLE[item.tone].icon}</span>
							<div className="flex min-w-0 flex-col gap-1">
								<p className="text-sm font-semibold text-ink">{item.title}</p>
								{item.description && (
									<p className="text-[13px] leading-snug text-ink-2">{item.description}</p>
								)}
							</div>
							<button
								type="button"
								onClick={() => dismiss(item.id)}
								aria-label="Закрыть уведомление"
								className="-mt-1 -mr-1 ml-auto flex h-7 w-7 flex-none items-center justify-center rounded-lg text-ink-3 hover:bg-surface-2"
							>
								<CloseIcon size={15} />
							</button>
						</div>
					))}
				</div>,
				document.body,
			)}
		</ToastContext.Provider>
	);
}

