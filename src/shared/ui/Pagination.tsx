import { ChevronLeftIcon, ChevronRightIcon } from '@/shared/icons';
import { Button } from './Button';

interface PaginationProps {
	page: number;
	pageSize: number;
	total: number;
	onChange: (page: number) => void;
}

export function Pagination({ page, pageSize, total, onChange }: PaginationProps) {
	const pages = Math.max(1, Math.ceil(total / pageSize));
	if (pages <= 1) return null;

	const first = (page - 1) * pageSize + 1;
	const last = Math.min(page * pageSize, total);

	return (
		<div className="flex items-center justify-between gap-4 pt-4">
			<p className="tnum text-[13px] text-ink-3">
				{first}—{last} из {total}
			</p>
			<div className="flex items-center gap-2">
				<Button
					size="sm"
					variant="secondary"
					disabled={page <= 1}
					onClick={() => onChange(page - 1)}
					icon={<ChevronLeftIcon size={15} />}
					aria-label="Предыдущая страница"
				/>
				<span className="tnum px-1 text-[13px] font-semibold text-ink">
					{page} / {pages}
				</span>
				<Button
					size="sm"
					variant="secondary"
					disabled={page >= pages}
					onClick={() => onChange(page + 1)}
					icon={<ChevronRightIcon size={15} />}
					aria-label="Следующая страница"
				/>
			</div>
		</div>
	);
}
