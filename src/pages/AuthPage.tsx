import { useSearchParams } from 'react-router-dom';
import { AuthLayout } from '@/features/auth/AuthLayout';
import { LoginForm } from '@/features/auth/LoginForm';
import { RegisterForm } from '@/features/auth/RegisterForm';
import { ShieldIcon } from '@/shared/icons';
import { cn } from '@/shared/lib/cn';

type Tab = 'login' | 'register';

/**
 * Вкладка живёт в адресе, а не в состоянии компонента: с лендинга зовут
 * регистрироваться, и ссылка должна открывать сразу регистрацию, а не вход.
 * Заодно выбор переживает перезагрузку и его можно переслать.
 */
export default function AuthPage() {
	const [params, setParams] = useSearchParams();
	const tab: Tab = params.get('tab') === 'register' ? 'register' : 'login';

	const setTab = (value: Tab) =>
		setParams(value === 'register' ? { tab: 'register' } : {}, { replace: true });

	return (
		<AuthLayout>
			<div className="flex gap-[3px] rounded-[14px] bg-surface-2 p-1">
				{(
					[
						['login', 'Вход'],
						['register', 'Регистрация'],
					] as Array<[Tab, string]>
				).map(([value, label]) => (
					<button
						key={value}
						type="button"
						onClick={() => setTab(value)}
						className={cn(
							'flex-1 rounded-control py-[11px] text-center font-display text-sm transition-colors',
							tab === value ? 'bg-surface font-semibold text-ink shadow-card' : 'font-medium text-ink-2',
						)}
					>
						{label}
					</button>
				))}
			</div>

			{tab === 'login' ? <LoginForm /> : <RegisterForm />}

			<div className="h-px bg-line" />

			<div className="flex items-start gap-3 rounded-[14px] border border-line bg-surface p-4">
				<ShieldIcon size={19} className="mt-px flex-none text-brand-600" />
				<p className="text-[12.5px] leading-relaxed text-ink-2">
					Учётные записи врачей и администраторов создаёт администратор центра. Пациент может
					зарегистрироваться самостоятельно.
				</p>
			</div>
		</AuthLayout>
	);
}
