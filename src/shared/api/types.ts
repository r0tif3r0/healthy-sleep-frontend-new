/**
 * Типы ответов бэкенда. Повторяют сериализаторы healthy-sleep-backend-main
 * и меняться в одностороннем порядке не могут.
 */

export type Role = 'patient' | 'doctor' | 'admin';

export interface Device {
	id: number;
	title: string;
	full_name: string;
	manufacturer: number;
}

export interface Doctor {
	id: number;
	email: string;
	phone_number: string;
	full_name: string;
	first_name: string;
	last_name: string;
	patronymic: string | null;
	role: Role;
}

export interface Profile {
	id: number;
	email: string;
	phone_number: string;
	full_name: string;
	first_name: string;
	last_name: string;
	patronymic: string | null;
	role: Role;
	additional: string;
	doctor: Doctor | null;
	device: Device | null;
	date_joined: string;
	date_birth: string | null;
	data_updated_at: string | null;
	private_id: string;
}

/** Пациент в списке врача — тот же ProfileSerializer. */
export type Patient = Profile;

/** Карточка пациента для врача: профиль плюс сводка показателей. */
export interface PatientStatistic extends Profile {
	statistic: {
		ahi: number | null;
		oai: number | null;
		cai: number | null;
		usage: number | null;
		leak: number | null;
	} | null;
}

/**
 * Показатели за одну ночь. Пятнадцать полей, как их отдаёт разбор карты.
 * У части приборов отдельные поля отсутствуют — приходит null.
 */
export interface CpapStatData {
	ai: number;
	hi: number;
	ahi: number;
	cai: number | null;
	epr: number | null;
	oai: number | null;
	uai: number | null;
	leak: number | null;
	duration: number;
	ramp_time: number | null;
	temperature: number | null;
	max_pressure: number;
	min_pressure: number;
	mask_pressure: number;
}

export interface CpapStatEntry {
	id: number;
	date: string;
	user: number;
	data: CpapStatData;
}

export interface Paginated<T> {
	count: number;
	next: string | null;
	previous: string | null;
	results: T[];
}

export interface LoginResponse {
	access: string;
	refresh: string;
	role: Role;
}

export interface RegisterResponse {
	message: string;
	access: string;
	refresh: string;
}

export interface RefreshResponse {
	access: string;
}

/** `count` — сколько ночей действительно добавлено. Ноль означает «всё это уже загружено». */
export interface UploadResult {
	detail: string;
	count: number;
}

export interface PatientsParams {
	page?: number;
	page_size?: number;
	search?: string;
	ordering?: string;
	device?: number;
}
