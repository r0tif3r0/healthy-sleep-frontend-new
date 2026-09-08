import type { ReactNode } from 'react';
import type { CpapStatEntry } from '@/shared/api/types';
import { InfoIcon } from '@/shared/icons';
import { formatDuration, formatNumber, formatPercent, pluralNights, UNITS } from '@/shared/lib/format';
import {
	adherence,
	adherenceStatus,
	ahiStatus,
	averageIndex,
	averageLeak,
	averageUsageMinutes,
	daysInRange,
	goodNights,
	leakStatus,
	usageStatus,
	STATUS_LABEL,
	type DateRange,
	type Status,
} from '@/shared/lib/metrics';
import { Badge, Card, Tooltip } from '@/shared/ui';

interface KpiCardProps {
	label: ReactNode;
	value: ReactNode;
	unit?: string;
	status?: Status;
	hint?: string;
	children?: ReactNode;
}

function KpiCard({ label, value, unit, status, hint, children }: KpiCardProps) {
	return (
		<Card className="flex flex-col gap-3.5">
			<span className="flex items-center gap-1.5 text-[12.5px] font-semibold text-ink-2">{label}</span>

			<div className="flex flex-wrap items-baseline gap-2">
				<span className="tnum font-display text-[40px] leading-none font-bold text-ink">{value}</span>
				{unit && <span className="font-display text-[15px] font-semibold text-ink-3">{unit}</span>}
				{status && status !== 'none' && (
					<Badge tone={status} className="ml-auto">
						{STATUS_LABEL[status]}
					</Badge>
				)}
			</div>

			{children}
			{hint && <p className="text-[11.5px] text-ink-3">{hint}</p>}
		</Card>
	);
}

export function KpiRow({ stats, range }: { stats: CpapStatEntry[]; range: DateRange }) {
	const percent = adherence(stats, range);
	const good = goodNights(stats);
	const days = daysInRange(range);
	const usage = averageUsageMinutes(stats);
	const ahi = averageIndex(stats, 'ahi');
	const leak = averageLeak(stats);
	const leaky = stats.filter((entry) => (entry.data.leak ?? 0) > 24).length;

	return (
		<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
			<KpiCard
				label={
					<>
						Приверженность лечению
						<Tooltip label="Доля ночей выбранного периода, в которые прибор проработал не меньше четырёх часов. Число зависит от длины периода — сравнивайте только одинаковые по длине периоды.">
							<InfoIcon size={14} className="text-ink-3" />
						</Tooltip>
					</>
				}
				value={formatPercent(percent)}
				status={adherenceStatus(percent)}
				hint={`${pluralNights(good)} из ${days} дольше 4 часов`}
			>
				<div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
					<div
						className="h-full rounded-full bg-ok"
						style={{ width: `${Math.min(100, Math.round(percent))}%` }}
					/>
				</div>
			</KpiCard>

			<KpiCard
				label="Средняя длительность"
				value={formatDuration(usage)}
				status={usageStatus(usage)}
				hint="за ночь с данными · цель 4 ч"
			/>

			<KpiCard
				label="Индекс AHI, средний"
				value={formatNumber(ahi, 1)}
				unit={UNITS.index}
				status={ahiStatus(ahi)}
				hint="норма — меньше 5 событий в час"
			/>

			<KpiCard
				label="Утечки воздуха, средние"
				value={formatNumber(leak, 1)}
				unit={UNITS.leak}
				status={leakStatus(leak)}
				hint={leaky > 0 ? `${pluralNights(leaky)} выше порога — проверьте маску` : 'все ночи в пределах нормы'}
			/>
		</div>
	);
}
