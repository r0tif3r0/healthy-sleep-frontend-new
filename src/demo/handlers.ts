import { HttpResponse, http, type HttpHandler } from 'msw';
import { env } from '@/shared/config/env';
import type { Paginated, Profile } from '@/shared/api/types';
import {
	DEVICES,
	DOCTOR,
	findByEmail,
	findByPrivateId,
	nightsOf,
	patientsOfDoctor,
	state,
	toStatistic,
} from './db';

/**
 * Ответы демо. Пути и формы ответов повторяют настоящий бэкенд —
 * приложение не знает, что говорит не с сервером.
 */

const api = (path: string) => `${env.apiBaseUrl}${path}`;

const TOKEN_PREFIX = 'demo-token-';

const badRequest = (detail: string, attr: string | null = null) =>
	HttpResponse.json(
		{ type: 'validation_error', errors: [{ code: 'invalid', detail, attr }] },
		{ status: 400 },
	);

const unauthorized = () =>
	HttpResponse.json(
		{ type: 'client_error', errors: [{ code: 'not_authenticated', detail: 'Нужен вход', attr: null }] },
		{ status: 401 },
	);

function currentUser(request: Request): Profile | null {
	const header = request.headers.get('Authorization') ?? '';
	const token = header.replace('Bearer ', '');
	if (!token.startsWith(TOKEN_PREFIX)) return null;

	const id = Number(token.slice(TOKEN_PREFIX.length));
	return state.profiles.get(id) ?? null;
}

const tokensFor = (profile: Profile) => ({
	access: `${TOKEN_PREFIX}${profile.id}`,
	refresh: `${TOKEN_PREFIX}refresh-${profile.id}`,
	role: profile.role,
});

const inRange = (date: string, from: string | null, to: string | null) =>
	(!from || date >= from) && (!to || date <= to);

export const handlers: HttpHandler[] = [
	// --- вход и регистрация ---------------------------------------------------

	http.post(api('/auth/login/'), async ({ request }) => {
		const body = (await request.json()) as { email?: string };
		const profile = findByEmail(body.email ?? '');

		// Пароль в демо не проверяется: настоящей авторизации здесь нет.
		if (!profile) return badRequest('Пользователь с такой почтой не найден', 'email');
		return HttpResponse.json(tokensFor(profile));
	}),

	http.post(api('/auth/register/'), async ({ request }) => {
		const body = (await request.json()) as Record<string, string | number | null>;
		const email = String(body.email ?? '');

		if (findByEmail(email)) return badRequest('Пользователь с такой почтой уже есть', 'email');

		const id = state.nextId++;
		const profile: Profile = {
			id,
			email,
			phone_number: String(body.phone_number ?? ''),
			full_name: `${body.last_name} ${body.first_name} ${body.patronymic ?? ''}`.trim(),
			first_name: String(body.first_name ?? ''),
			last_name: String(body.last_name ?? ''),
			patronymic: body.patronymic ? String(body.patronymic) : null,
			role: 'patient',
			additional: String(body.additional ?? ''),
			doctor: null,
			device: DEVICES.find((device) => device.id === Number(body.device)) ?? null,
			date_joined: new Date().toISOString().slice(0, 10),
			date_birth: body.date_birth ? String(body.date_birth) : null,
			data_updated_at: null,
			private_id: `demo-new-${id}`,
		};

		state.profiles.set(id, profile);
		state.nights.set(id, []);

		return HttpResponse.json({ message: 'Регистрация прошла успешно', ...tokensFor(profile) });
	}),

	http.post(api('/auth/refresh/'), async ({ request }) => {
		const body = (await request.json()) as { refresh?: string };
		const id = Number((body.refresh ?? '').replace(`${TOKEN_PREFIX}refresh-`, ''));
		const profile = state.profiles.get(id);

		if (!profile) return unauthorized();
		return HttpResponse.json({ access: `${TOKEN_PREFIX}${profile.id}` });
	}),

	http.post(api('/auth/reset_password/'), () =>
		HttpResponse.json({ detail: 'Ссылка отправлена' }),
	),
	http.post(api('/auth/reset_password/validate/'), () => HttpResponse.json({ detail: 'ok' })),
	http.post(api('/auth/reset_password/confirm/'), () =>
		HttpResponse.json({ detail: 'Пароль изменён' }),
	),

	// --- справочники и профиль ------------------------------------------------

	http.get(api('/devices/'), () => HttpResponse.json(DEVICES)),

	http.get(api('/profile/'), ({ request }) => {
		const profile = currentUser(request);
		return profile ? HttpResponse.json(profile) : unauthorized();
	}),

	http.patch(api('/profile/update/'), async ({ request }) => {
		const profile = currentUser(request);
		if (!profile) return unauthorized();

		const body = (await request.json()) as Record<string, string | number | null>;
		const updated: Profile = {
			...profile,
			email: body.email !== undefined ? String(body.email) : profile.email,
			phone_number: body.phone_number !== undefined ? String(body.phone_number) : profile.phone_number,
			first_name: body.first_name !== undefined ? String(body.first_name) : profile.first_name,
			last_name: body.last_name !== undefined ? String(body.last_name) : profile.last_name,
			patronymic: body.patronymic !== undefined ? String(body.patronymic) || null : profile.patronymic,
			additional: body.additional !== undefined ? String(body.additional) : profile.additional,
			date_birth: body.date_birth !== undefined ? (body.date_birth as string | null) : profile.date_birth,
			device:
				body.device !== undefined
					? (DEVICES.find((device) => device.id === Number(body.device)) ?? null)
					: profile.device,
		};
		updated.full_name = `${updated.last_name} ${updated.first_name} ${updated.patronymic ?? ''}`.trim();

		state.profiles.set(profile.id, updated);
		return HttpResponse.json(updated);
	}),

	http.patch(api('/profile/change_password/'), ({ request }) =>
		currentUser(request) ? HttpResponse.json({ detail: 'Пароль изменён' }) : unauthorized(),
	),

	http.post(api('/profile/check_password/'), ({ request }) =>
		currentUser(request) ? HttpResponse.json({ detail: 'Верно' }) : unauthorized(),
	),

	http.post(api('/profile/unlink_doctor/'), ({ request }) => {
		const profile = currentUser(request);
		if (!profile) return unauthorized();

		const updated = { ...profile, doctor: null };
		state.profiles.set(profile.id, updated);
		return HttpResponse.json(updated);
	}),

	http.post(api('/profile/update_private_id/'), ({ request }) => {
		const profile = currentUser(request);
		if (!profile) return unauthorized();

		const updated = { ...profile, private_id: `demo-${Math.random().toString(36).slice(2, 10)}` };
		state.profiles.set(profile.id, updated);
		return HttpResponse.json(updated);
	}),

	// --- пациенты у врача -----------------------------------------------------

	http.get(api('/patients/'), ({ request }) => {
		const doctor = currentUser(request);
		if (!doctor || doctor.role !== 'doctor') return unauthorized();

		const url = new URL(request.url);
		const search = (url.searchParams.get('search') ?? '').trim().toLowerCase();
		const ordering = url.searchParams.get('ordering') ?? 'last_name';
		const page = Number(url.searchParams.get('page') ?? 1);
		const pageSize = Number(url.searchParams.get('page_size') ?? 10);

		let list = patientsOfDoctor();

		if (search) {
			list = list.filter((patient) =>
				[patient.last_name, patient.first_name, patient.email, patient.phone_number]
					.join(' ')
					.toLowerCase()
					.includes(search),
			);
		}

		const desc = ordering.startsWith('-');
		const field = desc ? ordering.slice(1) : ordering;
		const key = (patient: Profile) =>
			field === 'date_joined'
				? patient.date_joined
				: field === 'device__title'
					? (patient.device?.title ?? '')
					: patient.last_name;

		list = [...list].sort((a, b) => key(a).localeCompare(key(b), 'ru') * (desc ? -1 : 1));

		const start = (page - 1) * pageSize;
		const results = list.slice(start, start + pageSize);

		const body: Paginated<Profile> = {
			count: list.length,
			next: start + pageSize < list.length ? 'next' : null,
			previous: page > 1 ? 'prev' : null,
			results,
		};
		return HttpResponse.json(body);
	}),

	http.post(api('/patients/link_patient/'), async ({ request }) => {
		const doctor = currentUser(request);
		if (!doctor || doctor.role !== 'doctor') return unauthorized();

		const body = (await request.json()) as { email?: string };
		const patient = findByEmail(body.email ?? '');

		if (!patient || patient.role !== 'patient') {
			return badRequest('Пациент с такой почтой не найден', 'email');
		}
		if (patient.doctor) return badRequest('Пациент уже прикреплён к врачу', 'email');

		state.profiles.set(patient.id, { ...patient, doctor: DOCTOR });
		return HttpResponse.json({ detail: 'Пациент прикреплён' });
	}),

	http.post(api('/patients/:id/unlink_patient/'), ({ request, params }) => {
		const doctor = currentUser(request);
		if (!doctor || doctor.role !== 'doctor') return unauthorized();

		const patient = state.profiles.get(Number(params.id));
		if (!patient) return badRequest('Пациент не найден');

		state.profiles.set(patient.id, { ...patient, doctor: null });
		return HttpResponse.json({ detail: 'Пациент отвязан' });
	}),

	http.get(api('/get_patient_statistic/:privateId/'), ({ params }) => {
		const profile = findByPrivateId(String(params.privateId));
		return profile ? HttpResponse.json(toStatistic(profile)) : badRequest('Пациент не найден');
	}),

	// --- статистика и загрузка ------------------------------------------------

	http.get(api('/statistics/get_dates/:privateId/'), ({ params }) => {
		const profile = findByPrivateId(String(params.privateId));
		if (!profile) return badRequest('Пациент не найден');

		return HttpResponse.json({ available_dates: nightsOf(profile.id).map((night) => night.date) });
	}),

	http.get(api('/statistics/cpap_stats/:privateId/'), ({ request, params }) => {
		const profile = findByPrivateId(String(params.privateId));
		if (!profile) return badRequest('Пациент не найден');

		const url = new URL(request.url);
		const from = url.searchParams.get('from');
		const to = url.searchParams.get('to');

		const today = new Date().toISOString().slice(0, 10);
		if (from && from >= today) {
			return badRequest('Значение ОТ не может быть больше или равно текущей даты', 'from');
		}

		return HttpResponse.json(nightsOf(profile.id).filter((night) => inRange(night.date, from, to)));
	}),

	http.post(api('/cpap_data/upload'), ({ request }) => {
		const profile = currentUser(request);
		if (!profile) return unauthorized();

		const existing = nightsOf(profile.id);
		const known = new Set(existing.map((night) => night.date));

		// Показатели берём из истории самого пациента, а при её отсутствии — у любого,
		// у кого данные есть: демо должно уметь наполнить и пустого пациента.
		const donor = existing.length > 0 ? existing : ([...state.nights.values()].find((l) => l.length > 0) ?? []);
		if (donor.length === 0) {
			return HttpResponse.json({ detail: 'Данные успешно загружены', count: 0 });
		}

		// Заполняем пропуски в последних тридцати днях — так видно, что число
		// добавленных ночей и приверженность меняются на глазах.
		const gaps: string[] = [];
		for (let daysAgo = 1; daysAgo <= 30 && gaps.length < 2; daysAgo += 1) {
			const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
			if (!known.has(date)) gaps.push(date);
		}

		const added = gaps.map((date, index) => ({
			...donor[donor.length - 1 - (index % donor.length)],
			id: profile.id * 1000 + existing.length + index + 1,
			user: profile.id,
			date,
		}));

		if (added.length > 0) {
			const merged = [...existing, ...added].sort((a, b) => a.date.localeCompare(b.date));
			state.nights.set(profile.id, merged);
			state.profiles.set(profile.id, {
				...profile,
				data_updated_at: merged[merged.length - 1].date,
			});
		}

		return HttpResponse.json({ detail: 'Данные успешно загружены', count: added.length });
	}),
];
