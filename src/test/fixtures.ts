import type { CpapStatEntry, PatientStatistic, Profile } from '@/shared/api/types';
import { addDays, toApiDate } from '@/shared/lib/dates';

const today = new Date();

/** Ночи привязаны к «вчера», чтобы попадать в период по умолчанию. */
export const nightDates = Array.from({ length: 6 }, (_, index) => toApiDate(addDays(today, -(index + 1))));

export const patientProfile: Profile = {
	id: 1,
	email: 'anna.smirnova@mail.ru',
	phone_number: '+79214481602',
	full_name: 'Смирнова Анна Петровна',
	first_name: 'Анна',
	last_name: 'Смирнова',
	patronymic: 'Петровна',
	role: 'patient',
	additional: 'Жалобы на утреннюю головную боль сохраняются.',
	doctor: null,
	device: { id: 3, title: 'AirSense 11 AutoSet', full_name: 'ResMed AirSense 11 AutoSet', manufacturer: 1 },
	date_joined: '2025-02-04',
	date_birth: '1971-03-14',
	data_updated_at: nightDates[0],
	private_id: 'abc123',
};

export const doctorProfile: Profile = {
	...patientProfile,
	id: 2,
	email: 'petrov@sleep.ru',
	full_name: 'Петров Игорь Сергеевич',
	first_name: 'Игорь',
	last_name: 'Петров',
	patronymic: 'Сергеевич',
	role: 'doctor',
	private_id: 'doc001',
};

export const patientStatistic: PatientStatistic = {
	...patientProfile,
	statistic: { ahi: 1.8, oai: 0.6, cai: 0.3, usage: 402, leak: 20 },
};

const night = (date: string, duration: number): CpapStatEntry => ({
	id: Number(date.replaceAll('-', '')),
	date,
	user: 1,
	data: {
		ai: 0.5,
		hi: 0.9,
		ahi: 1.8,
		cai: 0.3,
		epr: 2,
		oai: 0.6,
		uai: 0,
		leak: 20,
		duration,
		ramp_time: 15,
		temperature: 27,
		max_pressure: 13,
		min_pressure: 4,
		mask_pressure: 10.4,
	},
});

/** Пять ночей нормы и одна короче четырёх часов — чтобы было видно оба состояния. */
export const cpapStats: CpapStatEntry[] = nightDates.map((date, index) =>
	night(date, index === 3 ? 184 : 402),
);

export const patientsPage = {
	count: 1,
	next: null,
	previous: null,
	results: [patientProfile],
};
