import type {
	CpapStatData,
	CpapStatEntry,
	Device,
	Doctor,
	PatientStatistic,
	Profile,
	Role,
} from '@/shared/api/types';
import raw from './data.json';

/**
 * Состояние демо. Живёт в памяти вкладки: перезагрузка возвращает исходную
 * картину, поэтому следующий зритель всегда видит демо целым.
 *
 * Ночи хранятся смещением в днях от сегодняшнего дня, а не абсолютной датой, —
 * иначе демо протухло бы через месяц и открывалось на пустом периоде.
 */

interface RawNight {
	offset: number;
	data: CpapStatData;
}

interface RawPatient {
	id: number;
	privateId: string;
	email: string;
	phone: string;
	lastName: string;
	firstName: string;
	patronymic: string;
	birth: string;
	joinedAgo: number;
	deviceId: number;
	additional: string;
	nights: RawNight[];
}

export const DEVICES: Device[] = [
	{ id: 1, title: 'AirSense S9', full_name: 'ResMed AirSense S9', manufacturer: 2 },
	{ id: 2, title: 'AirSense S10', full_name: 'ResMed AirSense S10', manufacturer: 2 },
	{ id: 3, title: 'AirSense S11', full_name: 'ResMed AirSense S11', manufacturer: 2 },
	{ id: 4, title: 'AirCurve 10', full_name: 'ResMed AirCurve 10', manufacturer: 2 },
	{ id: 5, title: 'iBreeze 20a', full_name: 'ResVent iBreeze 20a', manufacturer: 1 },
	{ id: 6, title: 'Prisma 20A', full_name: 'Weinmann Prisma 20A', manufacturer: 3 },
];

export const DOCTOR: Doctor = {
	id: 1,
	email: 'doctor@example.ru',
	phone_number: '+79219930177',
	full_name: 'Петров Игорь Сергеевич',
	first_name: 'Игорь',
	last_name: 'Петров',
	patronymic: 'Сергеевич',
	role: 'doctor',
};

const DAY = 24 * 60 * 60 * 1000;

const isoDaysAgo = (days: number): string => {
	const date = new Date(Date.now() - days * DAY);
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${date.getFullYear()}-${month}-${day}`;
};

export interface DemoState {
	profiles: Map<number, Profile>;
	nights: Map<number, CpapStatEntry[]>;
	doctorProfile: Profile;
	adminProfile: Profile;
	nextId: number;
}

function buildPatient(patient: RawPatient): { profile: Profile; nights: CpapStatEntry[] } {
	const nights: CpapStatEntry[] = patient.nights.map((night, index) => ({
		id: patient.id * 1000 + index,
		date: isoDaysAgo(night.offset),
		user: patient.id,
		data: night.data,
	}));

	const lastNight = nights.length > 0 ? nights[nights.length - 1].date : null;

	return {
		nights,
		profile: {
			id: patient.id,
			email: patient.email,
			phone_number: patient.phone,
			full_name: `${patient.lastName} ${patient.firstName} ${patient.patronymic}`.trim(),
			first_name: patient.firstName,
			last_name: patient.lastName,
			patronymic: patient.patronymic || null,
			role: 'patient',
			additional: patient.additional,
			doctor: DOCTOR,
			device: DEVICES.find((device) => device.id === patient.deviceId) ?? null,
			date_joined: isoDaysAgo(patient.joinedAgo),
			date_birth: patient.birth,
			data_updated_at: lastNight,
			private_id: patient.privateId,
		},
	};
}

const staff = (id: number, role: Role, person: Omit<Doctor, 'id' | 'role'>): Profile => ({
	id,
	email: person.email,
	phone_number: person.phone_number,
	full_name: person.full_name,
	first_name: person.first_name,
	last_name: person.last_name,
	patronymic: person.patronymic,
	role,
	additional: '',
	doctor: null,
	device: null,
	date_joined: isoDaysAgo(700),
	date_birth: role === 'doctor' ? '1980-05-12' : '1988-02-20',
	data_updated_at: null,
	private_id: role === 'doctor' ? 'demo-doctor' : 'demo-admin',
});

export function createState(): DemoState {
	const profiles = new Map<number, Profile>();
	const nights = new Map<number, CpapStatEntry[]>();

	for (const patient of raw.patients as RawPatient[]) {
		const built = buildPatient(patient);
		profiles.set(built.profile.id, built.profile);
		nights.set(built.profile.id, built.nights);
	}

	const doctorProfile = staff(DOCTOR.id, 'doctor', {
		email: DOCTOR.email,
		phone_number: DOCTOR.phone_number,
		full_name: DOCTOR.full_name,
		first_name: DOCTOR.first_name,
		last_name: DOCTOR.last_name,
		patronymic: DOCTOR.patronymic,
	});

	const adminProfile = staff(2, 'admin', {
		email: 'admin@example.ru',
		phone_number: '+79219930101',
		full_name: 'Бетанова Ольга Андреевна',
		first_name: 'Ольга',
		last_name: 'Бетанова',
		patronymic: 'Андреевна',
	});

	profiles.set(doctorProfile.id, doctorProfile);
	profiles.set(adminProfile.id, adminProfile);

	return { profiles, nights, doctorProfile, adminProfile, nextId: 200 };
}

export let state: DemoState = createState();

export function resetState(): void {
	state = createState();
}

export const findByEmail = (email: string): Profile | undefined =>
	[...state.profiles.values()].find((profile) => profile.email.toLowerCase() === email.toLowerCase());

export const findByPrivateId = (privateId: string): Profile | undefined =>
	[...state.profiles.values()].find((profile) => profile.private_id === privateId);

export const patientsOfDoctor = (): Profile[] =>
	[...state.profiles.values()].filter((profile) => profile.role === 'patient' && profile.doctor !== null);

export const nightsOf = (userId: number): CpapStatEntry[] => state.nights.get(userId) ?? [];

export const toStatistic = (profile: Profile): PatientStatistic => {
	const nights = nightsOf(profile.id);
	const last = nights[nights.length - 1];

	return {
		...profile,
		statistic: last
			? {
					ahi: last.data.ahi,
					oai: last.data.oai,
					cai: last.data.cai,
					usage: last.data.duration,
					leak: last.data.leak,
				}
			: null,
	};
};
