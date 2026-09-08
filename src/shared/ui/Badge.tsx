import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import type { Status } from '@/shared/lib/metrics';

export type BadgeTone = Status | 'neutral';

const TONES: Record<BadgeTone, string> = {
	ok: 'bg-ok-050 text-ok-700',
	warn: 'bg-accent-050 text-accent-700',
	bad: 'bg-bad-050 text-bad-700',
	none: 'bg-surface-2 text-ink-2',
	neutral: 'bg-surface-2 text-ink-2',
};

export function Badge({
	tone = 'neutral',
	children,
	className,
}: {
	tone?: BadgeTone;
	children: ReactNode;
	className?: string;
}) {
	return (
		<span
			className={cn(
				'inline-flex items-center rounded-full px-2.5 py-1 text-[11.5px] font-semibold whitespace-nowrap',
				TONES[tone],
				className,
			)}
		>
			{children}
		</span>
	);
}
