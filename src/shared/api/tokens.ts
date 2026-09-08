/**
 * Единственное место, которое знает, где лежат токены.
 *
 * Хранилище браузера не защищает от XSS лучше, чем прежние cookie, — по-настоящему
 * вопрос закрывается только httpOnly-куками на стороне сервера. Выигрыш здесь в том,
 * что место одно, а роль пользователя больше не лежит рядом в куке, которую можно
 * переписать из консоли: она приходит из /profile/.
 */

const ACCESS_KEY = 'hs.access';
const REFRESH_KEY = 'hs.refresh';

const read = (key: string): string | null => {
	try {
		return window.localStorage.getItem(key);
	} catch {
		return null;
	}
};

const write = (key: string, value: string | null) => {
	try {
		if (value === null) window.localStorage.removeItem(key);
		else window.localStorage.setItem(key, value);
	} catch {
		// Приватный режим и запрет на хранилище не должны ронять приложение.
	}
};

export const tokens = {
	getAccess: (): string | null => read(ACCESS_KEY),
	getRefresh: (): string | null => read(REFRESH_KEY),

	set({ access, refresh }: { access: string; refresh?: string }): void {
		write(ACCESS_KEY, access);
		if (refresh !== undefined) write(REFRESH_KEY, refresh);
	},

	setAccess(access: string): void {
		write(ACCESS_KEY, access);
	},

	clear(): void {
		write(ACCESS_KEY, null);
		write(REFRESH_KEY, null);
	},
};
