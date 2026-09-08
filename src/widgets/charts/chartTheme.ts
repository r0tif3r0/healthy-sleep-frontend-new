import {
	BarElement,
	CategoryScale,
	Chart as ChartJS,
	Filler,
	Legend,
	LineElement,
	LinearScale,
	PointElement,
	Tooltip,
	type ChartOptions,
	type TooltipItem,
} from 'chart.js';
import { formatDate } from '@/shared/lib/format';

ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	PointElement,
	LineElement,
	Filler,
	Tooltip,
	Legend,
);

ChartJS.defaults.font.family = "'Golos Text', 'Segoe UI', system-ui, sans-serif";
ChartJS.defaults.font.size = 11;

/** Цвета рядов данных совпадают с листом дизайн-системы и не зависят от темы. */
export const SERIES = {
	norm: '#2563C4',
	belowNorm: '#F5921E',
	oai: '#2563C4',
	cai: '#38BDF8',
	hi: '#7DD3FC',
	uai: '#C7E9FB',
	goal: '#0FA97A',
	grid: '#EEF2F8',
	axis: '#DCE4EF',
	tick: '#98A4B8',
} as const;

const tooltip = (formatValue: (item: TooltipItem<'bar' | 'line'>) => string) => ({
	displayColors: false,
	padding: 10,
	backgroundColor: '#FFFFFF',
	titleColor: '#0B1B3A',
	bodyColor: '#0B1B3A',
	borderColor: '#E1E8F2',
	borderWidth: 1,
	caretSize: 6,
	titleFont: { weight: 600 as const },
	callbacks: {
		title: (items: TooltipItem<'bar' | 'line'>[]) => formatDate(items[0]?.label),
		label: formatValue,
	},
});

/**
 * Подписи по оси X — только первая и последняя дата периода: тридцать дат
 * подряд нечитаемы, а границы периода нужны всегда.
 */
const edgeTicks = {
	autoSkip: false,
	maxRotation: 0,
	minRotation: 0,
	color: SERIES.tick,
	callback(this: { chart: ChartJS }, _value: unknown, index: number, ticks: unknown[]) {
		if (index !== 0 && index !== ticks.length - 1) return null;
		const labels = this.chart.data.labels as string[] | undefined;
		return formatDate(labels?.[index]);
	},
};

interface BaseOptions {
	yTick?: (value: number) => string;
	/** Накопление имеет смысл только у столбцов респираторных событий. */
	stacked?: boolean;
	beginAtZero?: boolean;
}

export function baseOptions(
	formatValue: (item: TooltipItem<'bar' | 'line'>) => string,
	{ yTick, stacked = true, beginAtZero = true }: BaseOptions = {},
): ChartOptions<'bar' | 'line'> {
	return {
		responsive: true,
		maintainAspectRatio: false,
		interaction: { mode: 'index', intersect: false },
		plugins: {
			legend: { display: false },
			tooltip: tooltip(formatValue),
		},
		scales: {
			x: {
				stacked,
				grid: { display: false },
				border: { color: SERIES.axis },
				ticks: edgeTicks,
			},
			y: {
				stacked,
				beginAtZero,
				border: { display: false },
				grid: { color: SERIES.grid },
				ticks: {
					color: SERIES.tick,
					callback: (value) => (yTick ? yTick(Number(value)) : String(value)),
				},
			},
		},
	} as ChartOptions<'bar' | 'line'>;
}
