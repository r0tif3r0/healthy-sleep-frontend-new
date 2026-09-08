import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import type { ChartOptions } from 'chart.js';
import type { CpapStatEntry } from '@/shared/api/types';
import { formatNumber } from '@/shared/lib/format';
import { UNITS } from '@/shared/lib/format';
import { SERIES, baseOptions } from './chartTheme';
import { ChartCard } from './ChartCard';

const SERIES_DEFS = [
	{ key: 'oai', label: 'OAI', color: SERIES.oai },
	{ key: 'cai', label: 'CAI', color: SERIES.cai },
	{ key: 'hi', label: 'HI', color: SERIES.hi },
	{ key: 'uai', label: 'UAI', color: SERIES.uai },
] as const;

/** Столбцы с накоплением: сумма рядов и есть AHI за ночь. */
export function RespiratoryChart({ stats }: { stats: CpapStatEntry[] }) {
	const data = useMemo(
		() => ({
			labels: stats.map((entry) => entry.date),
			datasets: SERIES_DEFS.map((series, index) => ({
				label: series.label,
				data: stats.map((entry) => entry.data[series.key] ?? 0),
				backgroundColor: series.color,
				maxBarThickness: 18,
				borderRadius:
					index === SERIES_DEFS.length - 1
						? { topLeft: 4, topRight: 4, bottomLeft: 0, bottomRight: 0 }
						: 0,
			})),
		}),
		[stats],
	);

	const options = useMemo(
		() =>
			baseOptions((item) => `${item.dataset.label}: ${formatNumber(Number(item.raw), 1)} ${UNITS.index}`) as ChartOptions<'bar'>,
		[],
	);

	return (
		<ChartCard
			title="Индексы респираторных событий"
			height={170}
			legend={SERIES_DEFS.map((series) => ({ color: series.color, label: series.label }))}
		>
			<Bar data={data} options={options} />
		</ChartCard>
	);
}
