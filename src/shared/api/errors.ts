/**
 * Разбор ответа drf-standardized-errors:
 * `{ type, errors: [{ code, detail, attr }] }`.
 *
 * Прежний фронтенд лазил в `error.response.data.errors[0].detail` в каждом
 * обработчике и падал, когда сервер отвечал не в этом формате.
 */

export interface ServerErrorItem {
	code: string;
	detail: string;
	attr: string | null;
}

export interface ServerErrorBody {
	type: 'validation_error' | 'client_error' | 'server_error' | string;
	errors: ServerErrorItem[];
}

interface ErrorLike {
	response?: { status?: number; data?: unknown };
	message?: string;
}

const asErrorLike = (error: unknown): ErrorLike | null =>
	error && typeof error === 'object' ? (error as ErrorLike) : null;

function body(error: unknown): ServerErrorBody | null {
	const data = asErrorLike(error)?.response?.data;
	if (!data || typeof data !== 'object') return null;

	const candidate = data as Partial<ServerErrorBody>;
	return Array.isArray(candidate.errors) ? (candidate as ServerErrorBody) : null;
}

export function statusOf(error: unknown): number | null {
	return asErrorLike(error)?.response?.status ?? null;
}

export function errorItems(error: unknown): ServerErrorItem[] {
	return body(error)?.errors ?? [];
}

/** Текст для пользователя: сообщение сервера, если оно есть, иначе запасное. */
export function toMessage(error: unknown, fallback: string): string {
	const detail = errorItems(error).find((item) => Boolean(item.detail))?.detail;
	return detail ?? fallback;
}

/** Ошибки по конкретным полям формы — чтобы подсветить поле, а не показать общий тост. */
export function fieldErrors(error: unknown): Record<string, string> {
	const result: Record<string, string> = {};
	for (const item of errorItems(error)) {
		if (item.attr && !result[item.attr]) result[item.attr] = item.detail;
	}
	return result;
}

/** Признак протухшего access-токена: сигнал к обновлению, а не к выходу. */
export function isTokenInvalid(error: unknown): boolean {
	if (statusOf(error) !== 401) return false;
	return errorItems(error).some((item) => item.code === 'token_not_valid');
}

/**
 * Сервер отказывается отдавать статистику, если начало периода — сегодняшний день.
 * Показываем это отдельным понятным текстом, а не общим «что-то пошло не так».
 */
export function isFutureRangeError(error: unknown): boolean {
	if (statusOf(error) !== 400) return false;
	return errorItems(error).some((item) => item.detail?.includes('текущей даты'));
}
