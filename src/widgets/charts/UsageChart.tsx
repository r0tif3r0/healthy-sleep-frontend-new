import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import type { ChartOptions, Plugin } from 'chart.js';
import type { CpapStatEntry } from '@/shared/api/types';
import { NIGHT_GOAL_MINUTES } from '@/shared/lib/metrics';
import { formatDuration } from '@/shared/lib/format';
import { SERIES, baseOptions } from './chartTheme';
import { ChartCard } from './ChartCard';

/** Пунктирная цель в четыре часа — тот же порог, по которому считается приверженность. */
const goalLine: Plugin<'bar'> = {
	id: 'goalLine',
	afterDatasetsDraw(chart) {
		const y = chart.scales.y;
		if (!y) return;

		const value = y.getPixelForValue(NIGHT_GOAL_MINUTES / 60);
		const { left, right } = chart.chartArea;
		const ctx = chart.ctx;

		ctx.save();
		ctx.strokeStyle = SERIES.goal;
		ctx.lineWidth = 1.5;
		ctx.setLineDash([5, 4]);
		ctx.beginPath();
		ctx.moveTo(left, value);
		ctx.lineTo(right, value);
		ctx.stroke();

		ctx.setLineDash([]);
		ctx.fillStyle = '#FFFFFF';
		ctx.fillRect(right - 52, value - 15, 52, 13);
		ctx.fillStyle = '#0A7A57';
		ctx.font = '600 10.5px "Golos Text", system-ui, sans-serif';
		ctx.textAlign = 'right';
		ctx.fillText('цель 4 ч', right - 2, value - 5);
		ctx.restore();
	},
};

export function UsageChart({ stats }: { stats: CpapStatEntry[] }) {
	const data = useMemo(
		() => ({
			labels: stats.map((entry) => entry.date),
			datasets: [
				{
					label: 'Длительность',
					data: stats.map((entry) => entry.data.duration / 60),
					backgroundColor: stats.map((entry) =>
						entry.data.duration >= NIGHT_GOAL_MINUTES ? SERIES.norm : SERIES.belowNorm,
					),
					borderRadius: { topLeft: 4, topRight: 4, bottomLeft: 2, bottomRight: 2 },
					maxBarThickness: 18,
				},
			],
		}),
		[stats],
	);

	const options = useMemo(
		() =>
			baseOptions((item) => formatDuration(Math.round(Number(item.raw) * 60)), {
				yTick: (value) => `${value} ч`,
			}) as ChartOptions<'bar'>,
		[],
	);

	return (
		<ChartCard
			title="Длительность использования по ночам"
			height={190}
			legend={[
				{ color: SERIES.norm, label: '4 часа и больше' },
				{ color: SERIES.belowNorm, label: 'меньше 4 часов' },
			]}
		>
			<Bar data={data} options={options} plugins={[goalLine]} />
		</ChartCard>
	);
}
