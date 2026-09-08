import type { CpapStatEntry } from '@/shared/api/types';
import { NO_DATA, formatNumber, formatPressure, formatRamp } from '@/shared/lib/format';
import { deviceSettings } from '@/shared/lib/metrics';
import { Card, CardHeader } from '@/shared/ui';

function Row({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex items-baseline justify-between gap-3 border-b border-line-soft py-2.5 last:border-b-0">
			<span className="text-[13px] text-ink-2">{label}</span>
			<span className="tnum text-[13.5px] font-semibold whitespace-nowrap">{value}</span>
		</div>
	);
}

/**
 * Единицы берутся из общего модуля форматирования: давление и EPR — в мм рт. ст.,
 * плавный старт — в минутах, сокращение пишется EPR.
 */
export function DeviceSettingsCard({ stats, lastUpload }: { stats: CpapStatEntry[]; lastUpload?: string }) {
	const settings = deviceSettings(stats);

	const ramp =
		settings.rampMin === null
			? NO_DATA
			: settings.rampMin === settings.rampMax
				? formatRamp(settings.rampMin)
				: `${formatNumber(settings.rampMin, 0)} — ${formatRamp(settings.rampMax)}`;

	return (
		<Card className="flex flex-col gap-3.5">
			<CardHeader
				title="Настройки прибора"
				subtitle={lastUpload ? `последние настройки, считанные с карты ${lastUpload}` : 'последние настройки с карты'}
			/>
			<div className="flex flex-col">
				<Row label="Минимальное давление" value={formatPressure(settings.minPressure)} />
				<Row label="Максимальное давление" value={formatPressure(settings.maxPressure)} />
				<Row label="Плавный старт (Ramp)" value={ramp} />
				<Row label="EPR, облегчение выдоха" value={formatPressure(settings.epr)} />
			</div>
		</Card>
	);
}
