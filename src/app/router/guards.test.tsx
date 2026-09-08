import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { AuthProvider } from '@/app/providers/AuthProvider';
import { RequireAuth, RequireRole } from '@/app/router/guards';
import { tokens } from '@/shared/api/tokens';
import type { Role } from '@/shared/api/types';
import { env } from '@/shared/config/env';

let role: Role = 'patient';
let profileDelayMs = 0;

const profile = () => ({
	id: 1,
	email: 'anna@mail.ru',
	phone_number: '+79214481602',
	full_name: 'Смирнова Анна Петровна',
	first_name: 'Анна',
	last_name: 'Смирнова',
	patronymic: 'Петровна',
	role,
	additional: '',
	doctor: null,
	device: null,
	date_joined: '2025-02-04',
	date_birth: '1971-03-14',
	data_updated_at: null,
	private_id: 'abc123',
});

const server = setupServer(
	http.get(`${env.apiBaseUrl}/profile/`, async () => {
		if (profileDelayMs) await new Promise((resolve) => setTimeout(resolve, profileDelayMs));
		return HttpResponse.json(profile());
	}),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());

beforeEach(() => {
	role = 'patient';
	profileDelayMs = 0;
});

afterEach(() => {
	tokens.clear();
	server.resetHandlers();
});

function renderAt(path: string) {
	const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

	return render(
		<QueryClientProvider client={queryClient}>
			<MemoryRouter initialEntries={[path]}>
				<AuthProvider>
					<Routes>
						<Route path="/auth" element={<p>Экран входа</p>} />
						<Route element={<RequireAuth />}>
							<Route path="/app/stats" element={<p>Статистика</p>} />
							<Route element={<RequireRole role="doctor" />}>
								<Route path="/app/patients" element={<p>Список пациентов</p>} />
							</Route>
						</Route>
					</Routes>
				</AuthProvider>
			</MemoryRouter>
		</QueryClientProvider>,
	);
}

describe('охрана маршрутов', () => {
	it('гостя уводит на экран входа', async () => {
		renderAt('/app/stats');
		expect(await screen.findByText('Экран входа')).toBeInTheDocument();
	});

	it('пациента пускает в его кабинет', async () => {
		tokens.set({ access: 'access', refresh: 'refresh' });
		renderAt('/app/stats');
		expect(await screen.findByText('Статистика')).toBeInTheDocument();
	});

	it('пока профиль грузится, редиректа на вход нет', async () => {
		tokens.set({ access: 'access', refresh: 'refresh' });
		profileDelayMs = 50;

		renderAt('/app/stats');

		expect(screen.queryByText('Экран входа')).not.toBeInTheDocument();
		expect(await screen.findByText('Статистика')).toBeInTheDocument();
	});

	it('пациенту на врачебном маршруте показывает отказ, а не молчаливый переброс', async () => {
		tokens.set({ access: 'access', refresh: 'refresh' });
		renderAt('/app/patients');

		expect(await screen.findByText('Нет доступа')).toBeInTheDocument();
		expect(screen.queryByText('Список пациентов')).not.toBeInTheDocument();
	});

	it('врача на врачебный маршрут пускает', async () => {
		role = 'doctor';
		tokens.set({ access: 'access', refresh: 'refresh' });
		renderAt('/app/patients');

		expect(await screen.findByText('Список пациентов')).toBeInTheDocument();
	});

	it('роль берётся из профиля, а не из хранилища браузера', async () => {
		role = 'doctor';
		tokens.set({ access: 'access', refresh: 'refresh' });
		window.localStorage.setItem('hs.role', 'patient');

		renderAt('/app/patients');

		await waitFor(() => expect(screen.getByText('Список пациентов')).toBeInTheDocument());
		window.localStorage.removeItem('hs.role');
	});
});
