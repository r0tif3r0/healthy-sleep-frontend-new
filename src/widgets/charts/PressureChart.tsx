import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import type { ChartOptions } from 'chart.js';
import type { CpapStatEntry } from '@/shared/api/types';
import { formatNumber, UNITS } from '@/shared/lib/format';
import { averagePressure } from '@/shared/lib/metrics';
import { SERIES, baseOptions } from './chartTheme';
import { ChartCard } from './ChartCard';

/**
 * Подпись «95-й перцентиль» верна для приборов ResMed; у остальных
 * производителей это давление на маске за ночь. Заголовок сформулирован так,
 * чтобы не врать ни про один прибор.
 */
export function PressureChart({ stats }: { stats: CpapStatEntry[] }) {
	const average = averagePressure(stats);

	const data = useMemo(
		() => ({
			labels: stats.map((entry) => entry.date),
			datasets: [
				{
					label: 'Давление',
					data: stats.map((entry) => entry.data.mask_pressure),
					borderColor: SERIES.norm,
					borderWidth: 2.2,
					pointRadius: 0,
					pointHoverRadius: 4,
					pointHoverBackgroundColor: SERIES.norm,
					tension: 0.25,
					fill: true,
					backgroundColor: (context: { chart: { ctx: CanvasRenderingContext2D; chartArea?: { top: number; bottom: number } } }) => {
						const { ctx, chartArea } = context.chart;
						if (!chartArea) return 'transparent';
						const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
						gradient.addColorStop(0, 'rgba(56,189,248,0.26)');
						gradient.addColorStop(1, 'rgba(56,189,248,0)');
						return gradient;
					},
				},
			],
		}),
		[stats],
	);

	const options = useMemo(
		() =>
			baseOptions((item) => `${formatNumber(Number(item.raw), 1)} ${UNITS.pressure}`, {
				stacked: false,
				beginAtZero: false,
			}) as ChartOptions<'line'>,
		[],
	);

	return (
		<ChartCard
			title="Давление на маске"
			height={150}
			aside={
				<span className="tnum text-[13px] text-ink-2">
					среднее за период{' '}
					<span className="font-semibold text-ink">
						{formatNumber(average, 1)} {UNITS.pressure}
					</span>
				</span>
			}
		>
			<Line data={data} options={options} />
		</ChartCard>
	);
}
