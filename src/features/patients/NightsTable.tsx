import type { CpapStatEntry } from '@/shared/api/types';
import { formatDate, formatDuration, numOrDash } from '@/shared/lib/format';
import { NIGHT_GOAL_MINUTES } from '@/shared/lib/metrics';
import { Card, CardHeader, Table, Td, Th, Tr } from '@/shared/ui';
import { cn } from '@/shared/lib/cn';

/** Тот же состав колонок и те же единицы уходят в печатный отчёт. */
const COLUMNS = [
	'Дата',
	'Длительность',
	'AHI, событий/час',
	'OAI, событий/час',
	'CAI, событий/час',
	'HI, событий/час',
	'UAI, событий/час',
	'Утечка, л/мин',
	'Давление, мм рт. ст.',
	'Плавный старт, мин',
	'EPR, мм рт. ст.',
];

export function NightsTable({ stats }: { stats: CpapStatEntry[] }) {
	return (
		<Card padding="none" className="flex flex-col gap-4 p-4 sm:p-[22px_24px_12px]">
			<CardHeader
				title="Данные по ночам"
				subtitle="этот же состав колонок уходит в отчёт"
			/>

			<Table className="min-w-[1000px]">
				<thead>
					<tr>
						{COLUMNS.map((column) => (
							<Th key={column} className="whitespace-nowrap">
								{column}
							</Th>
						))}
					</tr>
				</thead>
				<tbody className="tnum">
					{stats.map((entry) => {
						const short = entry.data.duration < NIGHT_GOAL_MINUTES;
						return (
							<Tr key={entry.id}>
								<Td className="font-semibold whitespace-nowrap">{formatDate(entry.date)}</Td>
								<Td className={cn('whitespace-nowrap', short && 'font-semibold text-accent-500')}>
									{formatDuration(entry.data.duration)}
								</Td>
								<Td>{numOrDash(entry.data.ahi, 1)}</Td>
								<Td>{numOrDash(entry.data.oai, 1)}</Td>
								<Td>{numOrDash(entry.data.cai, 1)}</Td>
								<Td>{numOrDash(entry.data.hi, 1)}</Td>
								<Td>{numOrDash(entry.data.uai, 1)}</Td>
								<Td>{numOrDash(entry.data.leak, 1)}</Td>
								<Td>{numOrDash(entry.data.mask_pressure, 1)}</Td>
								<Td>{numOrDash(entry.data.ramp_time, 0)}</Td>
								<Td>{numOrDash(entry.data.epr, 1)}</Td>
							</Tr>
						);
					})}
				</tbody>
			</Table>
		</Card>
	);
}
