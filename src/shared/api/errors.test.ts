import { describe, expect, it } from 'vitest';
import { fieldErrors, isFutureRangeError, isTokenInvalid, statusOf, toMessage } from './errors';

const serverError = (status: number, data: unknown) => ({
	isAxiosError: true,
	response: { status, data },
});

describe('разбор ошибок сервера', () => {
	it('берёт detail первой ошибки', () => {
		const error = serverError(400, {
			type: 'validation_error',
			errors: [{ code: 'invalid', detail: 'Пациент уже прикреплён', attr: 'email' }],
		});
		expect(toMessage(error, 'Запасной текст')).toBe('Пациент уже прикреплён');
	});

	it('без структуры отдаёт запасной текст', () => {
		expect(toMessage(serverError(500, {}), 'Запасной текст')).toBe('Запасной текст');
		expect(toMessage(new Error('boom'), 'Запасной текст')).toBe('Запасной текст');
		expect(toMessage(undefined, 'Запасной текст')).toBe('Запасной текст');
	});

	it('раскладывает ошибки по полям формы', () => {
		const error = serverError(400, {
			type: 'validation_error',
			errors: [
				{ code: 'invalid', detail: 'Некорректная почта', attr: 'email' },
				{ code: 'required', detail: 'Укажите телефон', attr: 'phone_number' },
			],
		});
		expect(fieldErrors(error)).toEqual({
			email: 'Некорректная почта',
			phone_number: 'Укажите телефон',
		});
	});

	it('отдаёт код ответа', () => {
		expect(statusOf(serverError(404, {}))).toBe(404);
		expect(statusOf(new Error('boom'))).toBeNull();
	});
});

describe('распознавание особых ошибок', () => {
	it('узнаёт протухший токен', () => {
		const error = serverError(401, {
			type: 'client_error',
			errors: [{ code: 'token_not_valid', detail: 'Токен недействителен', attr: null }],
		});
		expect(isTokenInvalid(error)).toBe(true);
	});

	it('не путает протухший токен с обычной ошибкой доступа', () => {
		expect(isTokenInvalid(serverError(401, { errors: [{ code: 'not_authenticated' }] }))).toBe(false);
		expect(isTokenInvalid(serverError(403, { errors: [{ code: 'token_not_valid' }] }))).toBe(false);
	});

	it('узнаёт отказ сервера принять сегодняшнюю дату как начало периода', () => {
		const error = serverError(400, {
			type: 'validation_error',
			errors: [
				{ code: 'invalid', detail: 'Значение ОТ не может быть больше или равно текущей даты', attr: 'from' },
			],
		});
		expect(isFutureRangeError(error)).toBe(true);
		expect(isFutureRangeError(serverError(400, { errors: [{ code: 'invalid', detail: 'Другое' }] }))).toBe(false);
	});
});
