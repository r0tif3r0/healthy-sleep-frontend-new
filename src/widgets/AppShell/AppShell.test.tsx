import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import { Route } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import type { Profile } from '@/shared/api/types';
import { tokens } from '@/shared/api/tokens';
import { env } from '@/shared/config/env';
import { renderRoute } from '@/test/renderApp';
import { doctorProfile, patientProfile } from '@/test/fixtures';
import { AppShell } from './AppShell';

const adminProfile: Profile = { ...doctorProfile, role: 'admin' };

let profile: Profile = patientProfile;

const server = setupServer(
	http.get(`${env.apiBaseUrl}/profile/`, () => HttpResponse.json(profile)),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterAll(() => server.close());

beforeEach(() => {
	profile = patientProfile;
	// Тема живёт в localStorage: без сброса выбор одного теста утекает в следующий.
	window.localStorage.clear();
	tokens.set({ access: 'access', refresh: 'refresh' });
});

afterEach(() => {
	tokens.clear();
	server.resetHandlers();
});

function renderShell() {
	return renderRoute(
		'/app/stats',
		<Route path="/app" element={<AppShell />}>
			<Route path="stats" element={<p>содержимое</p>} />
		</Route>,
	);
}

/** Меню узкого экрана: те же пункты роли, что и в боковой панели, только снизу. */
async function bottomNav() {
	return screen.findByRole('navigation', { name: 'Разделы кабинета' });
}

describe('оболочка кабинета на узком экране', () => {
	it('показывает пациенту его разделы в нижнем меню', async () => {
		renderShell();

		const nav = within(await bottomNav());
		expect(await nav.findByRole('link', { name: 'Статистика' })).toBeInTheDocument();
		expect(nav.getByRole('link', { name: 'Загрузка данных' })).toBeInTheDocument();
		expect(nav.getByRole('link', { name: 'Личный кабинет' })).toBeInTheDocument();
		expect(nav.getByRole('link', { name: 'Правовая информация' })).toBeInTheDocument();
	});

	it('не пускает врача в разделы пациента', async () => {
		profile = doctorProfile;
		renderShell();

		const nav = within(await bottomNav());
		expect(await nav.findByRole('link', { name: 'Мои пациенты' })).toBeInTheDocument();
		expect(nav.queryByRole('link', { name: 'Загрузка данных' })).not.toBeInTheDocument();
	});

	/*
	 * У администратора в меню нет «Личного кабинета», поэтому выход живёт
	 * в верхней панели: спрячь его в профиль — и администратор не выйдет вовсе.
	 */
	it('оставляет администратору выход в верхней панели', async () => {
		profile = adminProfile;
		renderShell();

		const bar = within(await screen.findByRole('banner'));
		await userEvent.click(bar.getByRole('button', { name: 'Выйти из аккаунта' }));

		expect(await screen.findByText('Выйти из аккаунта?')).toBeInTheDocument();
	});

	it('переключает тему из верхней панели', async () => {
		renderShell();

		const bar = within(await screen.findByRole('banner'));
		await userEvent.click(await bar.findByRole('button', { name: 'Тёмная тема' }));

		expect(document.documentElement.dataset.theme).toBe('dark');
		expect(bar.getByRole('button', { name: 'Светлая тема' })).toBeInTheDocument();
	});
});
