import { useMemo, useState } from 'react';
import { toMessage } from '@/shared/api/errors';
import { usePatients, useUnlinkPatient } from '@/shared/api/patients';
import type { Patient } from '@/shared/api/types';
import { useDebounced } from '@/shared/hooks/useDebounced';
import { ClockIcon, PlusIcon, SearchIcon, UsersIcon } from '@/shared/icons';
import { fullName } from '@/shared/lib/format';
import {
	Button,
	Card,
	ConfirmModal,
	EmptyState,
	Input,
	Pagination,
	QueryBoundary,
	SkeletonCard,
	useToast,
	type SortDirection,
} from '@/shared/ui';
import { LinkPatientModal } from '@/features/patients/LinkPatientModal';
import { PatientCards } from '@/features/patients/PatientCards';
import { PatientTable, type SortField } from '@/features/patients/PatientTable';
import { freshnessOf } from '@/features/patients/uploadFreshness';

const PAGE_SIZE = 10;

export default function PatientListPage() {
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState('');
	const [sort, setSort] = useState<{ field: SortField; direction: SortDirection }>({
		field: 'last_name',
		direction: 'asc',
	});
	const [linkOpen, setLinkOpen] = useState(false);
	const [toUnlink, setToUnlink] = useState<Patient | null>(null);

	const debouncedSearch = useDebounced(search);
	const unlink = useUnlinkPatient();
	const toast = useToast();

	// Поиск, сортировка и страницы — на сервере: сортировать уже загруженную
	// страницу значит врать про порядок на всех остальных.
	const patientsQuery = usePatients({
		page,
		page_size: PAGE_SIZE,
		search: debouncedSearch || undefined,
		ordering: sort.direction === 'asc' ? sort.field : `-${sort.field}`,
	});

	const total = patientsQuery.data?.count ?? 0;

	// Сводка считается по загруженной странице: список отдаёт только даты выгрузок,
	// а приверженность и AHI пришлось бы тянуть отдельным запросом на каждого пациента.
	const summary = useMemo(() => {
		const results = patientsQuery.data?.results ?? [];
		return {
			never: results.filter((patient) => freshnessOf(patient.data_updated_at) === 'never').length,
			old: results.filter((patient) => freshnessOf(patient.data_updated_at) === 'old').length,
		};
	}, [patientsQuery.data]);

	const toggleSort = (field: SortField) => {
		setPage(1);
		setSort((current) =>
			current.field === field
				? { field, direction: current.direction === 'asc' ? 'desc' : 'asc' }
				: { field, direction: 'asc' },
		);
	};

	return (
		<div className="flex flex-col gap-[22px]">
			<div className="flex flex-wrap items-end justify-between gap-5">
				<div className="flex flex-col gap-1.5">
					<h1 className="font-display text-[27px] font-bold">Мои пациенты</h1>
					<p className="tnum text-[13px] text-ink-2">под наблюдением — {total}</p>
				</div>

				<Button variant="primary" icon={<PlusIcon size={17} />} onClick={() => setLinkOpen(true)}>
					Прикрепить пациента
				</Button>
			</div>

			<div className="grid gap-4 sm:grid-cols-3">
				<SummaryCard icon={<UsersIcon size={21} />} tone="brand" value={total} label="пациентов под наблюдением" />
				<SummaryCard
					icon={<ClockIcon size={21} />}
					tone="accent"
					value={summary.old}
					label="без выгрузки дольше 30 дней"
					note="на этой странице"
				/>
				<SummaryCard
					icon={<ClockIcon size={21} />}
					tone="muted"
					value={summary.never}
					label="ещё не загружали данные"
					note="на этой странице"
				/>
			</div>

			<div className="flex flex-wrap items-center gap-3">
				<Input
					className="max-w-md"
					placeholder="Поиск по фамилии, имени, почте или телефону"
					value={search}
					onChange={(event) => {
						setSearch(event.target.value);
						setPage(1);
					}}
					suffix={<SearchIcon size={18} />}
				/>
			</div>

			<QueryBoundary
				query={patientsQuery}
				errorText="Не удалось загрузить список пациентов"
				skeleton={<SkeletonCard lines={8} />}
				isEmpty={(data) => data.results.length === 0}
				empty={
					<EmptyState
						title={debouncedSearch ? 'Никого не нашли' : 'Пациентов пока нет'}
						description={
							debouncedSearch
								? 'Проверьте написание или очистите поиск.'
								: 'Прикрепите первого пациента по адресу его электронной почты.'
						}
						action={
							!debouncedSearch && (
								<Button variant="primary" icon={<PlusIcon size={17} />} onClick={() => setLinkOpen(true)}>
									Прикрепить пациента
								</Button>
							)
						}
					/>
				}
			>
				{(data) => (
					<Card className="p-[20px_24px_8px]">
						<div className="hidden lg:block">
							<PatientTable
								patients={data.results}
								sort={sort}
								onSort={toggleSort}
								onUnlink={setToUnlink}
							/>
						</div>
						<div className="lg:hidden">
							<PatientCards patients={data.results} onUnlink={setToUnlink} />
						</div>

						<Pagination page={page} pageSize={PAGE_SIZE} total={data.count} onChange={setPage} />
					</Card>
				)}
			</QueryBoundary>

			<LinkPatientModal open={linkOpen} onClose={() => setLinkOpen(false)} />

			<ConfirmModal
				open={toUnlink !== null}
				onClose={() => setToUnlink(null)}
				title="Отвязать пациента?"
				description={
					toUnlink
						? `${fullName(toUnlink)} пропадёт из вашего списка, и его статистика перестанет быть вам доступна.`
						: undefined
				}
				confirmLabel="Отвязать"
				danger
				loading={unlink.isPending}
				onConfirm={async () => {
					if (!toUnlink) return;
					try {
						await unlink.mutateAsync(toUnlink.id);
						toast.show({ title: 'Пациент отвязан', tone: 'ok' });
					} catch (error) {
						toast.show({
							title: 'Не удалось отвязать пациента',
							description: toMessage(error, 'Попробуйте позже.'),
							tone: 'bad',
						});
					} finally {
						setToUnlink(null);
					}
				}}
			/>
		</div>
	);
}

function SummaryCard({
	icon,
	tone,
	value,
	label,
	note,
}: {
	icon: React.ReactNode;
	tone: 'brand' | 'accent' | 'muted';
	value: number;
	label: string;
	note?: string;
}) {
	const tones = {
		brand: 'bg-brand-050 text-brand-600',
		accent: 'bg-accent-050 text-accent-700',
		muted: 'bg-surface-2 text-ink-2',
	};

	return (
		<Card className="flex items-center gap-4">
			<span className={`flex h-[42px] w-[42px] flex-none items-center justify-center rounded-[13px] ${tones[tone]}`}>
				{icon}
			</span>
			<span className="flex flex-col gap-0.5">
				<span className="tnum font-display text-2xl leading-tight font-bold">{value}</span>
				<span className="text-[12.5px] text-ink-2">{label}</span>
				{note && <span className="text-[11px] text-ink-3">{note}</span>}
			</span>
		</Card>
	);
}
