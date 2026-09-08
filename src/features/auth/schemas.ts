import { z } from 'zod';

/**
 * Правила перенесены из прежнего фронтенда один в один, кроме даты рождения:
 * там дата в будущем принималась (находка Н-12).
 */

const SPECIAL = /[!?@#$%^&*_\-+(){}[\]></\\|.,:;]/;

export const nameSchema = z
	.string()
	.trim()
	.max(30, 'Максимальная длина — 30 символов')
	.regex(/^[A-Za-zА-Яа-яЁё\s-]+$/, 'Только буквы и дефис');

/**
 * Проверка на пустоту идёт первой: иначе у незаполненного поля срабатывает
 * регулярное выражение, и пациент видит «Только буквы и дефис» вместо
 * «Укажите фамилию».
 */
export const requiredName = (message: string) =>
	z
		.string()
		.trim()
		.min(1, message)
		.max(30, 'Максимальная длина — 30 символов')
		.regex(/^[A-Za-zА-Яа-яЁё\s-]+$/, 'Только буквы и дефис');

export const emailSchema = z
	.string()
	.trim()
	.min(1, 'Укажите электронную почту')
	.regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Некорректный формат электронной почты');

/** В API уходит +7XXXXXXXXXX, маска нужна только на экране. */
export const phoneSchema = z
	.string()
	.trim()
	.regex(/^\+7\d{10}$/, 'Телефон в формате +7 (XXX) XXX-XX-XX');

export const passwordSchema = z
	.string()
	.min(8, 'Пароль должен содержать минимум 8 символов')
	.regex(/[a-z]/, 'Нужна минимум одна строчная латинская буква')
	.regex(/[A-Z]/, 'Нужна минимум одна заглавная латинская буква')
	.regex(/\d/, 'Нужна минимум одна цифра')
	.regex(SPECIAL, 'Нужен минимум один специальный символ');

export const birthDateSchema = z
	.string()
	.trim()
	.refine((value) => {
		const date = new Date(value);
		return !Number.isNaN(date.getTime()) && date.getTime() < Date.now();
	}, 'Дата рождения должна быть в прошлом');

export const additionalSchema = z.string().trim().max(250, 'Максимальная длина — 250 символов');

export const loginSchema = z.object({
	email: emailSchema,
	password: z.string().min(1, 'Введите пароль'),
});

export const registerStep1Schema = z.object({
	last_name: requiredName('Укажите фамилию'),
	first_name: requiredName('Укажите имя'),
	patronymic: nameSchema.optional().or(z.literal('')),
	date_birth: birthDateSchema.optional().or(z.literal('')),
	additional: additionalSchema.optional().or(z.literal('')),
});

export const registerStep2Schema = z.object({
	email: emailSchema,
	phone_number: phoneSchema,
	device: z.string(),
});

export const registerStep3Schema = z
	.object({
		password: passwordSchema,
		confirmPassword: z.string().min(1, 'Подтвердите пароль'),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Пароли должны совпадать',
		path: ['confirmPassword'],
	});

export const registerSchema = registerStep1Schema
	.merge(registerStep2Schema)
	.merge(z.object({ password: passwordSchema, confirmPassword: z.string() }))
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Пароли должны совпадать',
		path: ['confirmPassword'],
	});

export const resetRequestSchema = z.object({ email: emailSchema });

export const resetConfirmSchema = z
	.object({
		password: passwordSchema,
		confirmPassword: z.string().min(1, 'Подтвердите пароль'),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Пароли должны совпадать',
		path: ['confirmPassword'],
	});

export const changePasswordSchema = z
	.object({
		old_password: z.string().min(1, 'Введите текущий пароль'),
		new_password: passwordSchema,
		confirmPassword: z.string().min(1, 'Подтвердите пароль'),
	})
	.refine((data) => data.new_password === data.confirmPassword, {
		message: 'Пароли должны совпадать',
		path: ['confirmPassword'],
	});

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type ResetConfirmValues = z.infer<typeof resetConfirmSchema>;
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

/** Живая проверка требований к паролю под полем ввода. */
export const passwordRules = [
	{ label: 'минимум 8 символов', test: (v: string) => v.length >= 8 },
	{ label: 'строчные и заглавные латинские буквы', test: (v: string) => /[a-z]/.test(v) && /[A-Z]/.test(v) },
	{ label: 'минимум одна цифра', test: (v: string) => /\d/.test(v) },
	{ label: 'минимум один спецсимвол: !?@#$%^&*_-+()[]{}></\\|.,:;', test: (v: string) => SPECIAL.test(v) },
];
