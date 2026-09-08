import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { isFutureRangeError, toMessage } from '@/shared/api/errors';
import { usePatientStatistic, useUnlinkPatient } from '@/shared/api/patients';
import { useAvailableDates, useCpapStats } from '@/shared/api/statistics';
import { StatsView } from '@/features/statistics/StatsView';
import { useStatsPeriod } from '@/features/statistics/useStatsPeriod';
import { NightsTable } from '@/features/patients/NightsTable';
import { ChevronLeftIcon, DownloadIcon } from '@/shared/icons';
import { NO_DATA, ageFrom, formatAge, formatDate, formatDateLong, fullName } from '@/shared/lib/format';
import {
	Avatar,
	Button,
	Card,
	ConfirmModal,
	QueryBoundary,
	SkeletonCard,
	useToast,
} from '@/shared/ui';
import { PeriodPicker } from '@/widgets/stats/PeriodPicker';
import { PatientReport } from '@/widgets/report/PatientReport';
import { ReportPortal } from '@/widgets/report/ReportPortal';

export default function PatientDetailPage() {
	const { privateId = '' } = useParams();
	const navigate = useNavigate();
	const toast = useToast();

	const profileQuery = usePatientStatistic(privateId);
	const datesQuery = useAvailableDates(privateId);
	const availableDates = datesQuery.data;
	const hasData = Boolean(availableDates && availableDates.length > 0);

	const { range, setRange, defaultMonth, ready } = useStatsPeriod(availableDates);
	const statsQuery = useCpapStats(privateId, range, hasData && ready);
	const unlink = useUnlinkPatient();

	const [unlinkOpen, setUnlinkOpen] = useState(false);

	const profile = profileQuery.data;
	const stats = statsQuery.data ?? [];
	const canExport = stats.length > 0;

	return (
		<div className="flex flex-col gap-[18px]">
			<Link
				to="/app/patients"
				className="inline-flex w-fit items-center gap-2 text-[13.5px] font-medium text-brand-600 hover:underline"
			>
				<ChevronLeftIcon size={16} />
				Все пациенты
			</Link>

			<QueryBoundary
				query={profileQuery}
				errorText="Не удалось загрузить карточку пациента"
				skeleton={<SkeletonCard lines={4} />}
			>
				{(patient) => (
					<Card className="flex flex-col gap-5 p-6">
						<div className="flex flex-wrap items-start gap-4">
							<Avatar person={patient} size={56} className="rounded-[18px]" />
							<div className="flex min-w-0 flex-col gap-1">
								<h1 className="font-display text-[23px] font-bold">{fullName(patient)}</h1>
								{/* Собираем подпись из того, что есть: пустые части не превращаются в «Нет данных». */}
								<span className="tnum text-[13px] text-ink-2">
									{[
										patient.date_birth && formatDate(patient.date_birth),
										ageFrom(patient.date_birth) !== null && formatAge(ageFrom(patient.date_birth)),
										patient.date_joined && `под наблюдением с ${formatDateLong(patient.date_joined)}`,
									]
										.filter(Boolean)
										.join(' · ')}
								</span>
							</div>

							<div className="ml-auto flex flex-none items-center gap-2.5">
								<Button variant="secondary" onClick={() => setUnlinkOpen(true)}>
									Отвязать
								</Button>
								<Button
									variant="primary"
									icon={<DownloadIcon size={17} />}
									disabled={!canExport}
									title={canExport ? undefined : 'За выбранный период нет данных — выгружать нечего'}
									onClick={() => window.print()}
								>
									Выгрузить отчёт
								</Button>
							</div>
						</div>

						{!canExport && (
							<p className="text-[12.5px] text-ink-3">
								Кнопка выгрузки включится, когда в выбранном периоде появятся ночи с данными.
							</p>
						)}

						<div className="h-px bg-line-soft" />

						<div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
							<Meta label="Прибор" value={patient.device?.full_name ?? NO_DATA} />
							<Meta label="Электронная почта" value={patient.email || NO_DATA} />
							<Meta label="Телефон" value={patient.phone_number || NO_DATA} />
							<Meta
								label="Последняя выгрузка"
								value={patient.data_updated_at ? formatDateLong(patient.data_updated_at) : NO_DATA}
							/>
						</div>

						{patient.additional && <Meta label="Дополнительно" value={patient.additional} multiline />}
					</Card>
				)}
			</QueryBoundary>

			<div className="flex flex-wrap items-center justify-between gap-4">
				<PeriodPicker
					value={range}
					onChange={setRange}
					availableDates={availableDates ?? []}
					defaultMonth={defaultMonth}
				/>
			</div>

			{hasData ? (
				<QueryBoundary
					query={statsQuery}
					errorText={
						isFutureRangeError(statsQuery.error)
							? 'Сервер не отдаёт статистику, если период начинается сегодня. Выберите период, заканчивающийся вчера.'
							: 'Не удалось загрузить статистику'
					}
					skeleton={<SkeletonCard lines={6} />}
				>
					{(data) => (
						<div className="flex flex-col gap-[18px]">
							<StatsView
								stats={data}
								range={range}
								lastUpload={profile?.data_updated_at ? formatDateLong(profile.data_updated_at) : undefined}
							/>
							<NightsTable stats={data} />
						</div>
					)}
				</QueryBoundary>
			) : (
				<Card className="text-center text-sm text-ink-2">
					Пациент ещё не загружал данные с карты памяти прибора.
				</Card>
			)}

			{profile && canExport && (
				<ReportPortal>
					<PatientReport profile={profile} stats={stats} range={range} />
				</ReportPortal>
			)}

			<ConfirmModal
				open={unlinkOpen}
				onClose={() => setUnlinkOpen(false)}
				title="Отвязать пациента?"
				description={
					profile
						? `${fullName(profile)} пропадёт из вашего списка, и его статистика перестанет быть вам доступна.`
						: undefined
				}
				confirmLabel="Отвязать"
				danger
				loading={unlink.isPending}
				onConfirm={async () => {
					if (!profile) return;
					try {
						await unlink.mutateAsync(profile.id);
						toast.show({ title: 'Пациент отвязан', tone: 'ok' });
						navigate('/app/patients', { replace: true });
					} catch (error) {
						toast.show({
							title: 'Не удалось отвязать пациента',
							description: toMessage(error, 'Попробуйте позже.'),
							tone: 'bad',
						});
					} finally {
						setUnlinkOpen(false);
					}
				}}
			/>
		</div>
	);
}

function Meta({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
	return (
		<div className="flex flex-col gap-1">
			<span className="text-[11.5px] font-semibold tracking-[0.04em] text-ink-3 uppercase">{label}</span>
			<span className={multiline ? 'text-[13.5px] leading-relaxed text-ink-2' : 'text-[13.5px] font-medium'}>
				{value}
			</span>
		</div>
	);
}
