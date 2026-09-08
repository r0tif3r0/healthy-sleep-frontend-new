import { useNavigate } from 'react-router-dom';
import type { Patient } from '@/shared/api/types';
import { ChevronRightIcon } from '@/shared/icons';
import { NO_DATA, ageFrom, formatAge, formatDateShort, fullName } from '@/shared/lib/format';
import { Avatar, Button, Card } from '@/shared/ui';
import { FRESHNESS_DOT, FRESHNESS_LABEL, freshnessOf } from './uploadFreshness';

/**
 * Список для узкого экрана. Прежняя таблица на ноутбуке просто уезжала за край,
 * и часть колонок была недоступна.
 */
export function PatientCards({
	patients,
	onUnlink,
}: {
	patients: Patient[];
	onUnlink: (patient: Patient) => void;
}) {
	const navigate = useNavigate();

	return (
		<div className="flex flex-col gap-3">
			{patients.map((patient) => {
				const freshness = freshnessOf(patient.data_updated_at);
				const age = ageFrom(patient.date_birth);

				return (
					<Card
						key={patient.id}
						className="flex cursor-pointer flex-col gap-3 transition-colors hover:border-ink-4"
						onClick={() => navigate(`/app/patients/${patient.private_id}`)}
					>
						<div className="flex items-center gap-3">
							<Avatar person={patient} size={40} />
							<div className="flex min-w-0 flex-col gap-0.5">
								<span className="truncate font-semibold">{fullName(patient)}</span>
								<span className="tnum text-xs text-ink-3">
									{age !== null ? formatAge(age) : NO_DATA} · {patient.device?.full_name ?? 'прибор не указан'}
								</span>
							</div>
							<ChevronRightIcon size={18} className="ml-auto flex-none text-ink-4" />
						</div>

						<div className="flex flex-wrap items-center justify-between gap-3 border-t border-line-soft pt-3">
							<span className="inline-flex items-center gap-2 text-[13px]" title={FRESHNESS_LABEL[freshness]}>
								<span className={`h-[7px] w-[7px] flex-none rounded-full ${FRESHNESS_DOT[freshness]}`} />
								{patient.data_updated_at ? (
									<span className="tnum">выгрузка {formatDateShort(patient.data_updated_at)}</span>
								) : (
									<span className="text-ink-3">данных ещё нет</span>
								)}
							</span>

							<Button
								size="sm"
								variant="ghost"
								onClick={(event) => {
									event.stopPropagation();
									onUnlink(patient);
								}}
							>
								Отвязать
							</Button>
						</div>
					</Card>
				);
			})}
		</div>
	);
}
