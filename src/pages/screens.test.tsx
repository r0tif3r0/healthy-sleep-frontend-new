import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { tokens } from '@/shared/api/tokens';
import { env } from '@/shared/config/env';
import { Route } from 'react-router-dom';
import { renderRoute } from '@/test/renderApp';
import { cpapStats, doctorProfile, nightDates, patientProfile, patientStatistic, patientsPage } from '@/test/fixtures';
import StatsPage from './patient/StatsPage';
import UploadPage from './patient/UploadPage';
import PatientListPage from './doctor/PatientListPage';
import PatientDetailPage from './doctor/PatientDetailPage';

// В jsdom нет canvas, а тесты проверяют данные и подписи, а не отрисовку.
vi.mock('react-chartjs-2', () => ({
	Bar: () => <div data-testid="chart" />,
	Line: () => <div data-testid="chart" />,
}));

let profile = patientProfile;
let dates: string[] = nightDates;

const server = setupServer(
	http.get(`${env.apiBaseUrl}/profile/`, () => HttpResponse.json(profile)),
	http.get(`${env.apiBaseUrl}/devices/`, () => HttpResponse.json([])),
	http.get(`${env.apiBaseUrl}/statistics/get_dates/:id`, () =>
		HttpResponse.json({ available_dates: dates }),
	),
	http.get(`${env.apiBaseUrl}/statistics/cpap_stats/:id`, () =>
		HttpResponse.json(dates.length ? cpapStats : []),
	),
	http.get(`${env.apiBaseUrl}/patients/`, () => HttpResponse.json(patientsPage)),
	http.get(`${env.apiBaseUrl}/get_patient_statistic/:id`, () => HttpResponse.json(patientStatistic)),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterAll(() => server.close());

beforeEach(() => {
	profile = patientProfile;
	dates = nightDates;
	tokens.set({ access: 'access', refresh: 'refresh' });
});

afterEach(() => {
	tokens.clear();
	server.resetHandlers();
});

describe('экран статистики пациента', () => {
	it('показывает показатели и графики за период', async () => {
		renderRoute('/app/stats', <Route path="/app/stats" element={<StatsPage />} />);

		expect(await screen.findByText('Статистика терапии')).toBeInTheDocument();
		expect(await screen.findByText('ResMed AirSense 11 AutoSet', { exact: false })).toBeInTheDocument();

		// Пять ночей нормы из шести дней периода.
		expect(await screen.findByText('Приверженность лечению')).toBeInTheDocument();
		expect(await screen.findByText('Индекс AHI, средний')).toBeInTheDocument();
		expect(await screen.findByText('Утечки воздуха, средние')).toBeInTheDocument();

		expect(await screen.findAllByTestId('chart')).toHaveLength(3);
	});

	it('индексы подписаны событиями в час, а не процентами', async () => {
		renderRoute('/app/stats', <Route path="/app/stats" element={<StatsPage />} />);

		const units = await screen.findAllByText('событий/час');
		expect(units.length).toBeGreaterThan(0);
		expect(screen.queryByText(/AHI.*%/)).not.toBeInTheDocument();
	});

	it('настройки прибора выводятся в мм рт. ст. и минутах', async () => {
		renderRoute('/app/stats', <Route path="/app/stats" element={<StatsPage />} />);

		expect(await screen.findByText('Настройки прибора')).toBeInTheDocument();
		expect(await screen.findByText('4,0 мм рт. ст.')).toBeInTheDocument();
		expect(await screen.findByText('13,0 мм рт. ст.')).toBeInTheDocument();
		expect(await screen.findByText('15 мин')).toBeInTheDocument();
		expect(await screen.findByText('EPR, облегчение выдоха')).toBeInTheDocument();
	});

	it('смена периода не схлопывает экран: показатели держатся, пока едет новый запрос', async () => {
		renderRoute('/app/stats', <Route path="/app/stats" element={<StatsPage />} />);

		expect(await screen.findByText('Приверженность лечению')).toBeInTheDocument();

		// Новый период отвечает не сразу — ловим именно момент ожидания.
		let answer = () => {};
		const held = new Promise<void>((resolve) => {
			answer = resolve;
		});
		server.use(
			http.get(`${env.apiBaseUrl}/statistics/cpap_stats/:id`, async () => {
				await held;
				return HttpResponse.json(cpapStats);
			}),
		);

		await userEvent.click(screen.getByRole('radio', { name: '7 дней' }));

		// Раньше здесь экран подменялся скелетоном и страница дёргалась.
		expect(screen.getByText('Приверженность лечению')).toBeInTheDocument();
		expect(screen.getByText('Приверженность лечению').closest('[aria-busy]')).not.toBeNull();

		answer();
		await waitFor(() =>
			expect(screen.getByText('Приверженность лечению').closest('[aria-busy]')).toBeNull(),
		);
	});

	it('без данных показывает пустое состояние с кнопкой загрузки', async () => {
		dates = [];
		renderRoute('/app/stats', <Route path="/app/stats" element={<StatsPage />} />);

		expect(await screen.findByText('Статистики пока нет')).toBeInTheDocument();
		expect(await screen.findByRole('button', { name: /Загрузить данные/ })).toBeInTheDocument();
	});
});

describe('экран загрузки', () => {
	it('без указанного прибора кнопка выбора папки недоступна', async () => {
		profile = { ...patientProfile, device: null };
		renderRoute('/app/upload', <Route path="/app/upload" element={<UploadPage />} />);

		expect(await screen.findByText('Аппарат не указан')).toBeInTheDocument();
		expect(await screen.findByRole('button', { name: 'Выбрать папку' })).toBeDisabled();
	});

	it('с прибором кнопка доступна, инструкция на месте', async () => {
		renderRoute('/app/upload', <Route path="/app/upload" element={<UploadPage />} />);

		const pick = await screen.findByRole('button', { name: 'Выбрать папку' });
		await waitFor(() => expect(pick).toBeEnabled());
		expect(await screen.findByText('Как снять данные с аппарата')).toBeInTheDocument();
	});
});

describe('список пациентов у врача', () => {
	beforeEach(() => {
		profile = doctorProfile;
	});

	it('показывает пациента с давностью выгрузки', async () => {
		renderRoute('/app/patients', <Route path="/app/patients" element={<PatientListPage />} />);

		expect(await screen.findByText('Мои пациенты')).toBeInTheDocument();
		// Таблица и карточки живут в разметке обе — в браузере лишнюю прячет CSS.
		expect(await screen.findAllByText('Смирнова Анна Петровна')).not.toHaveLength(0);
		expect(await screen.findByRole('button', { name: /Прикрепить пациента/ })).toBeInTheDocument();
	});
});

describe('карточка пациента у врача', () => {
	beforeEach(() => {
		profile = doctorProfile;
	});

	it('показывает данные пациента и таблицу ночей с русскими подписями', async () => {
		renderRoute(
			'/app/patients/abc123',
			<Route path="/app/patients/:privateId" element={<PatientDetailPage />} />,
		);

		expect(await screen.findByRole('heading', { name: 'Смирнова Анна Петровна' })).toBeInTheDocument();

		const table = await screen.findByText('Данные по ночам');
		expect(table).toBeInTheDocument();

		expect(await screen.findAllByText('AHI, событий/час')).not.toHaveLength(0);
		expect(await screen.findAllByText('Давление, мм рт. ст.')).not.toHaveLength(0);
		expect(await screen.findAllByText('Плавный старт, мин')).not.toHaveLength(0);
		expect(await screen.findAllByText('EPR, мм рт. ст.')).not.toHaveLength(0);
	});

	it('кнопка выгрузки недоступна, когда за период нет ночей', async () => {
		dates = [];
		renderRoute(
			'/app/patients/abc123',
			<Route path="/app/patients/:privateId" element={<PatientDetailPage />} />,
		);

		const button = await screen.findByRole('button', { name: /Выгрузить отчёт/ });
		expect(button).toBeDisabled();
		expect(
			await screen.findByText(/Кнопка выгрузки включится, когда в выбранном периоде появятся ночи/),
		).toBeInTheDocument();
	});

	it('при наличии данных кнопка выгрузки активна и отчёт собран', async () => {
		renderRoute(
			'/app/patients/abc123',
			<Route path="/app/patients/:privateId" element={<PatientDetailPage />} />,
		);

		await waitFor(async () =>
			expect(await screen.findByRole('button', { name: /Выгрузить отчёт/ })).toBeEnabled(),
		);

		const report = document.getElementById('report-root');
		expect(report).not.toBeNull();
		expect(within(report as HTMLElement).getByText('Отчёт по СИПАП-терапии')).toBeInTheDocument();
		// Все ночи попадают в документ: отчёт собирается из данных, а не снимком экрана.
		expect(within(report as HTMLElement).getAllByRole('row').length).toBeGreaterThanOrEqual(cpapStats.length);
	});
});
