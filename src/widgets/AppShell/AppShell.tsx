import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/providers/useAuth';
import { ConfirmModal } from '@/shared/ui';
import { BottomNav } from './BottomNav';
import { MobileTopBar } from './MobileTopBar';
import { Sidebar } from './Sidebar';

export function AppShell() {
	const { signOut } = useAuth();
	const navigate = useNavigate();
	const [logoutOpen, setLogoutOpen] = useState(false);

	return (
		/*
		 * Ниже 1024px оболочка складывается в колонку: шапка сверху, меню снизу.
		 * Боковая панель остаётся только там, где под неё есть ширина.
		 */
		<div className="flex min-h-screen flex-col bg-canvas lg:flex-row">
			<Sidebar onLogout={() => setLogoutOpen(true)} />
			<MobileTopBar onLogout={() => setLogoutOpen(true)} />

			<main className="min-w-0 flex-1 px-4 pt-5 pb-8 sm:px-6 lg:px-9 lg:pt-8 lg:pb-10">
				<Outlet />
			</main>

			<BottomNav />

			<ConfirmModal
				open={logoutOpen}
				onClose={() => setLogoutOpen(false)}
				onConfirm={() => {
					setLogoutOpen(false);
					signOut();
					navigate('/auth', { replace: true });
				}}
				title="Выйти из аккаунта?"
				description="Загруженные данные останутся в системе — они привязаны к вашей учётной записи."
				confirmLabel="Выйти"
			/>
		</div>
	);
}
