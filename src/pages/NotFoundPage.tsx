import { useNavigate } from 'react-router-dom';
import { illustrations } from '@/assets/illustrations';
import { useAuth } from '@/app/providers/useAuth';
import { Button, Illustration } from '@/shared/ui';

export default function NotFoundPage() {
	const navigate = useNavigate();
	const { isAuthenticated, role } = useAuth();

	const home = !isAuthenticated ? '/' : role === 'doctor' ? '/app/patients' : role === 'admin' ? '/app/admin' : '/app/stats';

	return (
		<div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-canvas px-6 text-center">
			<Illustration source={illustrations.emptySleep} alt="" className="h-48 w-auto max-w-full rounded-card-lg object-cover" />
			<div className="flex max-w-md flex-col gap-3">
				<h1 className="font-display text-3xl font-bold">Такой страницы нет</h1>
				<p className="text-sm leading-relaxed text-ink-2">
					Возможно, ссылка устарела или в адресе опечатка. Вернитесь на главную — оттуда доступны все
					разделы вашего кабинета.
				</p>
			</div>
			<Button variant="primary" size="lg" onClick={() => navigate(home, { replace: true })}>
				Вернуться
			</Button>
		</div>
	);
}
