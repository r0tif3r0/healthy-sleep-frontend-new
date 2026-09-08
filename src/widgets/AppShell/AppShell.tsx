import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/providers/useAuth';
import { ConfirmModal } from '@/shared/ui';
import { Sidebar } from './Sidebar';

export function AppShell() {
	const { signOut } = useAuth();
	const navigate = useNavigate();
	const [logoutOpen, setLogoutOpen] = useState(false);

	return (
		<div className="flex min-h-screen bg-canvas">
			<Sidebar onLogout={() => setLogoutOpen(true)} />

			<main className="min-w-0 flex-1 px-9 pt-8 pb-10">
				<Outlet />
			</main>

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
