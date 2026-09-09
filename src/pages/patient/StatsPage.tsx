import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/shared/api/profile';
import { useAvailableDates, useCpapStats } from '@/shared/api/statistics';
import { isFutureRangeError } from '@/shared/api/errors';
import { illustrations } from '@/assets/illustrations';
import { useStatsPeriod } from '@/features/statistics/useStatsPeriod';
import { StatsView } from '@/features/statistics/StatsView';
import { DeviceIcon, UploadIcon } from '@/shared/icons';
import { formatDateLong, pluralNights } from '@/shared/lib/format';
import { Button, EmptyState, Illustration, QueryBoundary, SkeletonCard } from '@/shared/ui';
import { PeriodPicker } from '@/widgets/stats/PeriodPicker';

export default function StatsPage() {
	const navigate = useNavigate();
	const profileQuery = useProfile();
	const privateId = profileQuery.data?.private_id ?? '';

	const datesQuery = useAvailableDates(privateId);
	const availableDates = datesQuery.data;
	const hasData = Boolean(availableDates && availableDates.length > 0);

	const { range, setRange, defaultMonth, ready } = useStatsPeriod(availableDates);
	const statsQuery = useCpapStats(privateId, range, hasData && ready);

	const device = profileQuery.data?.device;
	const lastUpload = profileQuery.data?.data_updated_at;

	if (profileQuery.isPending || datesQuery.isPending) {
		return (
			<div className="flex flex-col gap-5">
				<SkeletonCard lines={2} />
				<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
					{Array.from({ length: 4 }, (_, index) => (
						<SkeletonCard key={index} lines={2} />
					))}
				</div>
			</div>
		);
	}

	// Данных нет вовсе — показываем, что делать дальше, а не модальное окно поверх пустоты.
	if (!hasData) {
		return (
			<div className="flex flex-col gap-6">
				<Header device={device?.full_name} lastUpload={lastUpload} nights={0} />
				<EmptyState
					title="Статистики пока нет"
					description="Загрузите данные с карты памяти прибора — показатели появятся сразу после разбора архива."
					illustration={
						<Illustration
							source={illustrations.emptySleep}
							alt=""
							className="h-40 w-auto max-w-full rounded-card object-cover"
						/>
					}
					action={
						<Button
							variant="primary"
							size="lg"
							icon={<UploadIcon size={18} />}
							onClick={() => navigate('/app/upload')}
						>
							Загрузить данные
						</Button>
					}
				/>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-wrap items-end justify-between gap-5">
				<Header
					device={device?.full_name}
					lastUpload={lastUpload}
					nights={statsQuery.data?.length ?? 0}
				/>
				<PeriodPicker
					value={range}
					onChange={setRange}
					availableDates={availableDates ?? []}
					defaultMonth={defaultMonth}
				/>
			</div>

			<QueryBoundary
				query={statsQuery}
				errorText={
					isFutureRangeError(statsQuery.error)
						? 'Сервер не отдаёт статистику, если период начинается сегодня: данные за текущие сутки ещё неполны. Выберите период, заканчивающийся вчера.'
						: 'Не удалось загрузить статистику'
				}
				skeleton={<SkeletonCard lines={6} />}
			>
				{(stats) => (
					<StatsView stats={stats} range={range} lastUpload={lastUpload ? formatDateLong(lastUpload) : undefined} />
				)}
			</QueryBoundary>
		</div>
	);
}

function Header({
	device,
	lastUpload,
	nights,
}: {
	device?: string;
	lastUpload?: string | null;
	nights: number;
}) {
	return (
		<div className="flex flex-col gap-2">
			<h1 className="font-display text-[22px] font-bold sm:text-[27px]">Статистика терапии</h1>
			<p className="flex flex-wrap items-center gap-2.5 text-[13px] text-ink-2">
				<DeviceIcon size={15} className="text-ink-3" />
				{device ?? 'Прибор не указан'}
				{nights > 0 && (
					<>
						<span className="text-ink-4">·</span>
						{pluralNights(nights)} с данными за период
					</>
				)}
				{lastUpload && (
					<>
						<span className="text-ink-4">·</span>
						последняя выгрузка {formatDateLong(lastUpload)}
					</>
				)}
			</p>
		</div>
	);
}
