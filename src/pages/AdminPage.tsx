import { env } from '@/shared/config/env';
import { ShieldIcon } from '@/shared/icons';
import { Button, Card } from '@/shared/ui';

const CAPABILITIES = [
	'Перечень всех зарегистрированных пользователей',
	'Создание учётных записей врачей, пациентов и администраторов',
	'Правка данных существующих пользователей',
	'Удаление учётных записей',
];

/**
 * Управление пользователями живёт в панели администрирования на стороне сервера:
 * REST-интерфейса для создания и правки учётных записей у бэкенда нет,
 * а дублировать его во фронтенде значило бы менять серверную часть.
 */
export default function AdminPage() {
	const adminUrl = `${env.apiBaseUrl}/admin/`;

	return (
		<div className="flex flex-col gap-6">
			<h1 className="font-display text-[27px] font-bold">Управление пользователями</h1>

			<Card className="flex max-w-2xl flex-col gap-5">
				<span className="flex h-12 w-12 items-center justify-center rounded-[15px] bg-brand-050 text-brand-600">
					<ShieldIcon size={24} />
				</span>

				<div className="flex flex-col gap-2.5">
					<h2 className="font-display text-lg font-bold">Панель администрирования</h2>
					<p className="text-sm leading-relaxed text-ink-2">
						Учётные записи создаются и правятся в серверной панели управления. Вход — по той же почте
						и паролю, что и здесь.
					</p>
				</div>

				<ul className="flex flex-col gap-2.5">
					{CAPABILITIES.map((item) => (
						<li key={item} className="flex items-start gap-2.5 text-[13.5px] text-ink-2">
							<span className="mt-[7px] h-1.5 w-1.5 flex-none rounded-full bg-ink-4" />
							{item}
						</li>
					))}
				</ul>

				<Button
					variant="primary"
					className="self-start"
					onClick={() => window.open(adminUrl, '_blank', 'noopener,noreferrer')}
				>
					Открыть панель управления
				</Button>
			</Card>
		</div>
	);
}
