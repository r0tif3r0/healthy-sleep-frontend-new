import type { ReactNode } from 'react';
import { RefreshIcon, WarningIcon } from '@/shared/icons';
import { cn } from '@/shared/lib/cn';
import { Button } from './Button';
import { SkeletonCard } from './Skeleton';

interface QueryLike<T> {
	isPending: boolean;
	isError: boolean;
	data: T | undefined;
	refetch: () => void;
	/** true, пока на экране данные прошлого запроса, а новый ещё едет. */
	isPlaceholderData?: boolean;
}

interface QueryBoundaryProps<T> {
	query: QueryLike<T>;
	children: (data: T) => ReactNode;
	/** Своё пустое состояние показывается только вместе с isEmpty. */
	empty?: ReactNode;
	isEmpty?: (data: T) => boolean;
	skeleton?: ReactNode;
	errorText?: string;
}

/**
 * Пять состояний экрана в одном месте: загрузка, ошибка, пусто, данные и
 * данные прошлого запроса, пока едет новый. Без этого про пустое состояние
 * и про ошибку забывают, и пользователь видит белый экран, не понимая,
 * сломался сервис или данных просто нет.
 */
export function QueryBoundary<T>({
	query,
	children,
	empty,
	isEmpty,
	skeleton,
	errorText = 'Не удалось загрузить данные',
}: QueryBoundaryProps<T>) {
	if (query.isPending) {
		return <>{skeleton ?? <SkeletonCard lines={4} />}</>;
	}

	if (query.isError) {
		return (
			<div className="flex flex-col items-center gap-4 rounded-card border border-line bg-surface px-6 py-10 text-center">
				<WarningIcon size={28} className="text-accent-500" />
				<p className="text-sm text-ink-2">{errorText}</p>
				<Button size="sm" variant="secondary" icon={<RefreshIcon size={15} />} onClick={() => query.refetch()}>
					Повторить
				</Button>
			</div>
		);
	}

	if (query.data === undefined) {
		return <>{skeleton ?? <SkeletonCard lines={4} />}</>;
	}

	if (empty && isEmpty?.(query.data)) {
		return <>{empty}</>;
	}

	/*
	 * Обёртка постоянная, а не только на время ожидания: если бы она появлялась
	 * и исчезала, React пересоздавал бы поддерево и графики каждый раз рисовались
	 * бы заново — ровно то дёрганье, от которого мы уходим.
	 */
	return (
		<div
			aria-busy={query.isPlaceholderData || undefined}
			className={cn('transition-opacity duration-200', query.isPlaceholderData && 'opacity-60')}
		>
			{children(query.data)}
		</div>
	);
}
