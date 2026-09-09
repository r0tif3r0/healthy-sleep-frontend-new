export interface IndicatorGroup {
	title: string;
	items: string[];
}

export const INDICATOR_GROUPS: IndicatorGroup[] = [
	{
		title: 'Использование и приверженность',
		items: [
			'Даты использования',
			'Количество выбранных дней',
			'Количество дней использования',
			'Длительность использования',
			'Средняя длительность использования',
			'Приверженность лечению',
		],
	},
	{
		title: 'Дыхательные события',
		items: [
			'Индекс респираторных событий (AHI)',
			'Индекс обструктивных апноэ (OAI)',
			'Индекс центральных апноэ (CAI)',
			'Индекс неклассифицированных апноэ (UAI)',
			'Индекс гипопноэ (HI)',
		],
	},
	{
		title: 'Давление, утечки и настройки',
		items: [
			'Давление',
			'Утечки воздуха',
			'Минимальное давление',
			'Максимальное давление',
			'Длительность плавного старта (Ramp)',
			'Облегчение выдоха (EPR)',
		],
	},
];

export interface DeviceGroup {
	manufacturer: string;
	models: string[];
}

export const DEVICE_GROUPS: DeviceGroup[] = [
	{
		manufacturer: 'ResMed',
		models: ['AirSense 11 AutoSet', 'AirSense S10', 'S9 AutoSet', 'AirCurve 10'],
	},
	{ manufacturer: 'ResVent', models: ['iBreeze 20A Pro'] },
	{ manufacturer: 'Weinmann', models: ['Prisma 20A'] },
];

export const INDICATOR_COUNT = INDICATOR_GROUPS.reduce((total, group) => total + group.items.length, 0);

export const DEVICE_COUNT = DEVICE_GROUPS.reduce((total, group) => total + group.models.length, 0);
