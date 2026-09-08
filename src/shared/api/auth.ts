import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { env } from '@/shared/config/env';
import type { LoginResponse, RegisterResponse } from './types';

/**
 * Вход, регистрация и сброс пароля идут мимо apiClient: у гостя ещё нет токена,
 * а интерцептор обновления здесь только мешал бы.
 */
const guest = axios.create({ baseURL: env.apiBaseUrl });

export interface LoginPayload {
	email: string;
	password: string;
}

export interface RegisterPayload {
	email: string;
	phone_number: string;
	first_name: string;
	last_name: string;
	patronymic?: string;
	date_birth?: string;
	password: string;
	device?: number | null;
	additional?: string;
}

export const useLogin = () =>
	useMutation({
		mutationFn: async (payload: LoginPayload) => {
			const { data } = await guest.post<LoginResponse>('/auth/login/', payload);
			return data;
		},
	});

export const useRegister = () =>
	useMutation({
		mutationFn: async (payload: RegisterPayload) => {
			const { data } = await guest.post<RegisterResponse>('/auth/register/', payload);
			return data;
		},
	});

export const useResetPasswordRequest = () =>
	useMutation({
		mutationFn: async (payload: { email: string }) => {
			const { data } = await guest.post('/auth/reset_password/', payload);
			return data;
		},
	});

export const useResetPasswordValidate = () =>
	useMutation({
		mutationFn: async (payload: { token: string }) => {
			const { data } = await guest.post('/auth/reset_password/validate/', payload);
			return data;
		},
	});

export const useResetPasswordConfirm = () =>
	useMutation({
		mutationFn: async (payload: { token: string; password: string }) => {
			const { data } = await guest.post('/auth/reset_password/confirm/', payload);
			return data;
		},
	});
