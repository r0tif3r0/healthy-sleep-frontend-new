const trimSlash = (value: string) => value.replace(/\/+$/, '');

/**
 * Адрес сайта берётся из окружения, а не из кода: при смене домена ссылка,
 * которую пациент копирует для врача, должна меняться вместе с ним.
 */
export const env = {
	apiBaseUrl: trimSlash(import.meta.env?.VITE_API_BASE_URL ?? ''),
	publicUrl: trimSlash(import.meta.env?.VITE_PUBLIC_URL ?? ''),
};

/** Ссылка на страницу пациента для лечащего врача. */
export function patientLink(privateId: string): string {
	const base = env.publicUrl || window.location.origin;
	return `${base}/app/patients/${privateId}`;
}
