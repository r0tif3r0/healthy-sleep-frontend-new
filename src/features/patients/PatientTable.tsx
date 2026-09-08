import { useNavigate } from 'react-router-dom';
import type { Patient } from '@/shared/api/types';
import { ChevronRightIcon } from '@/shared/icons';
import { NO_DATA, ageFrom, formatAge, formatDate, formatDateShort, fullName } from '@/shared/lib/format';
import { Avatar, Button, SortableTh, Table, Td, Th, Tr, type SortDirection } from '@/shared/ui';
import { FRESHNESS_DOT, FRESHNESS_LABEL, freshnessOf } from './uploadFreshness';

export type SortField = 'last_name' | 'date_joined' | 'device__title';

interface PatientTableProps {
	patients: Patient[];
	sort: { field: SortField; direction: SortDirection };
	onSort: (field: SortField) => void;
	onUnlink: (patient: Patient) => void;
}

export function PatientTable({ patients, sort, onSort, onUnlink }: PatientTableProps) {
	const navigate = useNavigate();

	return (
		<Table>
			<thead>
				<tr>
					<SortableTh
						active={sort.field === 'last_name'}
						direction={sort.direction}
						onSort={() => onSort('last_name')}
						className="w-[28%]"
					>
						Пациент
					</SortableTh>
					<SortableTh
						active={sort.field === 'device__title'}
						direction={sort.direction}
						onSort={() => onSort('device__title')}
						className="w-[20%]"
					>
						Прибор
					</SortableTh>
					<Th className="w-[18%]">Контакты</Th>
					<SortableTh
						active={sort.field === 'date_joined'}
						direction={sort.direction}
						onSort={() => onSort('date_joined')}
						className="w-[13%]"
					>
						Регистрация
					</SortableTh>
					<Th className="w-[16%]">Последняя выгрузка</Th>
					<Th className="w-[5%]" />
				</tr>
			</thead>

			<tbody>
				{patients.map((patient) => {
					const freshness = freshnessOf(patient.data_updated_at);
					const age = ageFrom(patient.date_birth);

					return (
						<Tr key={patient.id} onClick={() => navigate(`/app/patients/${patient.private_id}`)}>
							<Td>
								<div className="flex items-center gap-3">
									<Avatar person={patient} size={36} />
									<div className="flex flex-col gap-0.5">
										<span className="font-semibold">{fullName(patient)}</span>
										{/* Пустую дату рождения не показываем: «Нет данных» под каждым именем — шум. */}
										{patient.date_birth && (
											<span className="tnum text-xs text-ink-3">
												{formatDate(patient.date_birth)}
												{age !== null && ` · ${formatAge(age)}`}
											</span>
										)}
									</div>
								</div>
							</Td>

							<Td className="text-ink-2">{patient.device?.full_name ?? NO_DATA}</Td>

							<Td>
								<div className="flex flex-col gap-0.5 text-[13px]">
									<span className="text-ink-2">{patient.email}</span>
									<span className="tnum text-xs text-ink-3">{patient.phone_number || '—'}</span>
								</div>
							</Td>

							<Td className="tnum text-ink-2">{formatDateShort(patient.date_joined)}</Td>

							<Td>
								<span className="inline-flex items-center gap-2" title={FRESHNESS_LABEL[freshness]}>
									<span className={`h-[7px] w-[7px] flex-none rounded-full ${FRESHNESS_DOT[freshness]}`} />
									<span className={freshness === 'never' ? 'text-ink-3' : 'tnum'}>
										{patient.data_updated_at ? formatDateShort(patient.data_updated_at) : 'нет данных'}
									</span>
								</span>
							</Td>

							<Td className="text-right">
								<div className="flex items-center justify-end gap-1">
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
									<ChevronRightIcon size={18} className="text-ink-4" />
								</div>
							</Td>
						</Tr>
					);
				})}
			</tbody>
		</Table>
	);
}
