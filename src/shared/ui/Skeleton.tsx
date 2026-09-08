import { cn } from '@/shared/lib/cn';

/** Скелетон, а не спиннер посреди пустоты: экран не «прыгает» после загрузки. */
export function Skeleton({ className }: { className?: string }) {
	return <div className={cn('animate-pulse rounded-lg bg-surface-2', className)} />;
}

export function SkeletonCard({ lines = 3, className }: { lines?: number; className?: string }) {
	return (
		<div className={cn('rounded-card border border-line bg-surface p-5', className)}>
			<Skeleton className="h-4 w-2/5" />
			<div className="mt-4 flex flex-col gap-2.5">
				{Array.from({ length: lines }, (_, i) => (
					<Skeleton key={i} className={cn('h-3', i === lines - 1 ? 'w-3/5' : 'w-full')} />
				))}
			</div>
		</div>
	);
}
