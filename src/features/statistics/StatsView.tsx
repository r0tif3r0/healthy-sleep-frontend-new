import type { CpapStatEntry } from '@/shared/api/types';
import type { DateRange } from '@/shared/lib/metrics';
import { PressureChart } from '@/widgets/charts/PressureChart';
import { RespiratoryChart } from '@/widgets/charts/RespiratoryChart';
import { UsageChart } from '@/widgets/charts/UsageChart';
import { AdherenceNote } from '@/widgets/stats/AdherenceNote';
import { DeviceSettingsCard } from '@/widgets/stats/DeviceSettingsCard';
import { KpiRow } from '@/widgets/stats/KpiRow';
import { EmptyState, Illustration } from '@/shared/ui';
import { illustrations } from '@/assets/illustrations';

interface StatsViewProps {
	stats: CpapStatEntry[];
	range: DateRange;
	lastUpload?: string;
	/** Правая колонка отличается у пациента и врача: календарь только у пациента. */
	aside?: React.ReactNode;
}

/** Общее тело статистики: используется и в кабинете пациента, и в карточке у врача. */
export function StatsView({ stats, range, lastUpload, aside }: StatsViewProps) {
	if (stats.length === 0) {
		return (
			<EmptyState
				title="За выбранный период данных нет"
				description="Выберите другой период или загрузите свежий архив с карты памяти прибора."
				illustration={
					<Illustration
						source={illustrations.emptySleep}
						alt=""
						className="h-40 w-auto max-w-full rounded-card object-cover"
					/>
				}
			/>
		);
	}

	return (
		<div className="flex flex-col gap-5">
			<KpiRow stats={stats} range={range} />

			<div className="grid gap-[18px] xl:grid-cols-[minmax(0,2.1fr)_minmax(0,1fr)] xl:items-start">
				<div className="flex min-w-0 flex-col gap-[18px]">
					<UsageChart stats={stats} />
					<RespiratoryChart stats={stats} />
					<PressureChart stats={stats} />
				</div>

				<div className="flex min-w-0 flex-col gap-[18px]">
					{aside}
					<DeviceSettingsCard stats={stats} lastUpload={lastUpload} />
					<AdherenceNote />
				</div>
			</div>
		</div>
	);
}
