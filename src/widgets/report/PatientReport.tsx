import type { CpapStatEntry, PatientStatistic } from '@/shared/api/types';
import {
	NO_DATA,
	UNITS,
	ageFrom,
	formatAge,
	formatDate,
	formatDateLong,
	formatDateRange,
	formatDuration,
	formatNumber,
	numOrDash,
	formatPercent,
	formatPressure,
	formatRamp,
	fullName,
} from '@/shared/lib/format';
import {
	NIGHT_GOAL_MINUTES,
	adherence,
	averageIndex,
	averageLeak,
	averagePressure,
	averageUsageMinutes,
	daysInRange,
	deviceSettings,
	goodNights,
	type DateRange,
} from '@/shared/lib/metrics';

interface PatientReportProps {
	profile: PatientStatistic;
	stats: CpapStatEntry[];
	range: DateRange;
}

/**
 * Печатная форма отчёта.
 *
 * Собирается из данных, а не снимком экрана: все ночи попадают в документ,
 * текст остаётся текстом, а разбиение на страницы делает печатный движок
 * браузера — заголовок таблицы повторяется на каждом листе. Результат не
 * зависит от ширины окна врача.
 */
export function PatientReport({ profile, stats, range }: PatientReportProps) {
	const settings = deviceSettings(stats);
	const percent = adherence(stats, range);
	const age = ageFrom(profile.date_birth);

	const summary = [
		['Период', formatDateRange(range.from, range.to)],
		['Дней в периоде', String(daysInRange(range))],
		['Ночей с данными', String(stats.length)],
		['Ночей дольше 4 часов', String(goodNights(stats))],
		['Приверженность лечению', formatPercent(percent)],
		['Средняя длительность за ночь', formatDuration(averageUsageMinutes(stats))],
		['Индекс AHI, средний', `${formatNumber(averageIndex(stats, 'ahi'), 1)} ${UNITS.index}`],
		['Индекс OAI, средний', `${formatNumber(averageIndex(stats, 'oai'), 1)} ${UNITS.index}`],
		['Индекс CAI, средний', `${formatNumber(averageIndex(stats, 'cai'), 1)} ${UNITS.index}`],
		['Индекс HI, средний', `${formatNumber(averageIndex(stats, 'hi'), 1)} ${UNITS.index}`],
		['Утечки, средние', `${formatNumber(averageLeak(stats), 1)} ${UNITS.leak}`],
		['Давление на маске, среднее', formatPressure(averagePressure(stats))],
	];

	const device = [
		['Минимальное давление', formatPressure(settings.minPressure)],
		['Максимальное давление', formatPressure(settings.maxPressure)],
		[
			'Плавный старт (Ramp)',
			settings.rampMin === null
				? NO_DATA
				: settings.rampMin === settings.rampMax
					? formatRamp(settings.rampMin)
					: `${formatNumber(settings.rampMin, 0)} — ${formatRamp(settings.rampMax)}`,
		],
		['EPR, облегчение выдоха', formatPressure(settings.epr)],
	];

	return (
		<div id="report-root" className="report">
			<header className="report__head">
				<div>
					<h1>Отчёт по СИПАП-терапии</h1>
					<p className="report__sub">
						{fullName(profile)}
						{age !== null && ` · ${formatAge(age)}`}
						{profile.date_birth && ` · ${formatDate(profile.date_birth)}`}
					</p>
				</div>
				<div className="report__meta">
					<span>{formatDateRange(range.from, range.to)}</span>
					<span>сформирован {formatDateLong(new Date().toISOString())}</span>
				</div>
			</header>

			<section className="report__grid">
				<div>
					<span className="report__label">Прибор</span>
					<span>{profile.device?.full_name ?? NO_DATA}</span>
				</div>
				<div>
					<span className="report__label">Электронная почта</span>
					<span>{profile.email || NO_DATA}</span>
				</div>
				<div>
					<span className="report__label">Телефон</span>
					<span>{profile.phone_number || NO_DATA}</span>
				</div>
				<div>
					<span className="report__label">Лечащий врач</span>
					<span>{profile.doctor ? fullName(profile.doctor) : NO_DATA}</span>
				</div>
			</section>

			{profile.additional && (
				<section className="report__note">
					<span className="report__label">Дополнительно</span>
					<p>{profile.additional}</p>
				</section>
			)}

			<h2>Показатели за период</h2>
			<table className="report__pairs">
				<tbody>
					{summary.map(([label, value]) => (
						<tr key={label}>
							<td>{label}</td>
							<td className="report__value">{value}</td>
						</tr>
					))}
				</tbody>
			</table>

			<h2>Настройки прибора</h2>
			<p className="report__hint">Последние настройки, считанные с карты памяти за выбранный период.</p>
			<table className="report__pairs">
				<tbody>
					{device.map(([label, value]) => (
						<tr key={label}>
							<td>{label}</td>
							<td className="report__value">{value}</td>
						</tr>
					))}
				</tbody>
			</table>

			<h2>Данные по ночам</h2>
			<table className="report__nights">
				<thead>
					<tr>
						<th>Дата</th>
						<th>Длительность</th>
						<th>AHI, событий/час</th>
						<th>OAI, событий/час</th>
						<th>CAI, событий/час</th>
						<th>HI, событий/час</th>
						<th>UAI, событий/час</th>
						<th>Утечка, л/мин</th>
						<th>Давление, мм рт. ст.</th>
						<th>Плавный старт, мин</th>
						<th>EPR, мм рт. ст.</th>
					</tr>
				</thead>
				<tbody>
					{stats.map((entry) => (
						<tr key={entry.id}>
							<td>{formatDate(entry.date)}</td>
							<td className={entry.data.duration < NIGHT_GOAL_MINUTES ? 'report__below' : undefined}>
								{formatDuration(entry.data.duration)}
							</td>
							<td>{numOrDash(entry.data.ahi, 1)}</td>
							<td>{numOrDash(entry.data.oai, 1)}</td>
							<td>{numOrDash(entry.data.cai, 1)}</td>
							<td>{numOrDash(entry.data.hi, 1)}</td>
							<td>{numOrDash(entry.data.uai, 1)}</td>
							<td>{numOrDash(entry.data.leak, 1)}</td>
							<td>{numOrDash(entry.data.mask_pressure, 1)}</td>
							<td>{numOrDash(entry.data.ramp_time, 0)}</td>
							<td>{numOrDash(entry.data.epr, 1)}</td>
						</tr>
					))}
				</tbody>
			</table>

			<footer className="report__foot">
				Приверженность лечению — доля ночей периода, в которые прибор проработал не меньше четырёх часов.
				Ночи короче четырёх часов выделены в колонке длительности.
			</footer>
		</div>
	);
}
