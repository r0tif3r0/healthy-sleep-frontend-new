import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { env } from '@/shared/config/env';
import { apiClient, onUnauthorized } from './client';
import { tokens } from './tokens';

let refreshCalls = 0;
let refreshShouldFail = false;

// Каждый ответ собирается заново: тело Response читается один раз.
const tokenExpired = () =>
	HttpResponse.json(
		{ type: 'client_error', errors: [{ code: 'token_not_valid', detail: 'Токен недействителен', attr: null }] },
		{ status: 401 },
	);

const server = setupServer(
	http.get(`${env.apiBaseUrl}/profile/`, ({ request }) => {
		if (request.headers.get('Authorization') === 'Bearer fresh-access') {
			return HttpResponse.json({ email: 'anna@mail.ru' });
		}
		return tokenExpired();
	}),

	http.post(`${env.apiBaseUrl}/auth/refresh/`, () => {
		refreshCalls += 1;
		if (refreshShouldFail) {
			return HttpResponse.json(
				{ type: 'client_error', errors: [{ code: 'token_not_valid', detail: 'Протух', attr: null }] },
				{ status: 401 },
			);
		}
		return HttpResponse.json({ access: 'fresh-access' });
	}),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());

beforeEach(() => {
	refreshCalls = 0;
	refreshShouldFail = false;
	tokens.set({ access: 'stale-access', refresh: 'refresh-token' });
});

afterEach(() => {
	server.resetHandlers();
	onUnauthorized(null);
	tokens.clear();
});

describe('обновление токена', () => {
	it('на пачку одновременных 401 уходит ровно один запрос обновления', async () => {
		const responses = await Promise.all([
			apiClient.get('/profile/'),
			apiClient.get('/profile/'),
			apiClient.get('/profile/'),
		]);

		expect(refreshCalls).toBe(1);
		expect(responses).toHaveLength(3);
		for (const response of responses) {
			expect(response.data).toEqual({ email: 'anna@mail.ru' });
		}
		expect(tokens.getAccess()).toBe('fresh-access');
	});

	it('повторяет исходный запрос с новым токеном', async () => {
		const response = await apiClient.get('/profile/');
		expect(response.status).toBe(200);
		expect(refreshCalls).toBe(1);
	});

	it('если обновление не удалось — токены очищены и слой авторизации извещён', async () => {
		refreshShouldFail = true;
		const handler = vi.fn();
		onUnauthorized(handler);

		await expect(apiClient.get('/profile/')).rejects.toBeDefined();

		expect(handler).toHaveBeenCalled();
		expect(tokens.getAccess()).toBeNull();
		expect(tokens.getRefresh()).toBeNull();
	});

	it('без токена обновления не дёргает сервер', async () => {
		tokens.clear();
		tokens.set({ access: 'stale-access' });
		const handler = vi.fn();
		onUnauthorized(handler);

		await expect(apiClient.get('/profile/')).rejects.toBeDefined();

		expect(refreshCalls).toBe(0);
		expect(handler).toHaveBeenCalled();
	});

	it('не пытается обновляться повторно на том же запросе', async () => {
		server.use(http.get(`${env.apiBaseUrl}/profile/`, () => tokenExpired()));

		await expect(apiClient.get('/profile/')).rejects.toBeDefined();
		expect(refreshCalls).toBe(1);
	});
});
