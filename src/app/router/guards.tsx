import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/app/providers/useAuth';
import type { Role } from '@/shared/api/types';
import { Spinner } from '@/shared/ui';

function FullPageLoader() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-canvas text-brand-600">
			<Spinner size={28} />
		</div>
	);
}

/** Пока профиль грузится, никуда не перебрасываем — иначе экран мигает редиректом. */
export function RequireAuth() {
	const { isAuthenticated, isLoading } = useAuth();
	const location = useLocation();

	if (isLoading) return <FullPageLoader />;
	if (!isAuthenticated) return <Navigate to="/auth" replace state={{ from: location.pathname }} />;

	return <Outlet />;
}

/**
 * Роль не подходит — показываем понятный отказ, а не молчаливый переброс:
 * иначе непонятно, почему страница «не открывается».
 */
export function RequireRole({ role }: { role: Role | Role[] }) {
	const { role: current, isLoading } = useAuth();
	const allowed = Array.isArray(role) ? role : [role];

	if (isLoading) return <FullPageLoader />;

	if (!current || !allowed.includes(current)) {
		return (
			<div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center">
				<h1 className="font-display text-2xl font-bold text-ink">Нет доступа</h1>
				<p className="max-w-md text-sm text-ink-2">
					Этот раздел открыт другой роли. Если доступ нужен по работе, обратитесь к администратору центра.
				</p>
			</div>
		);
	}

	return <Outlet />;
}

/** Авторизованного с публичной страницы уводим в его кабинет. */
export function RedirectHome() {
	const { role } = useAuth();
	if (role === 'doctor') return <Navigate to="/app/patients" replace />;
	if (role === 'admin') return <Navigate to="/app/admin" replace />;
	return <Navigate to="/app/stats" replace />;
}
