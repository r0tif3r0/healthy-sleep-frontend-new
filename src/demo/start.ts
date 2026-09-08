import { handlers } from './handlers';
import { mountDemoFailure, mountDemoPanel } from './panel';

/**
 * Запускает демо-режим: service worker перехватывает запросы к API,
 * и приложение работает без бэкенда. Вызывается только при VITE_DEMO=1.
 *
 * Наружу не бросает: если service worker не поднялся, приложение всё равно
 * должно отрисоваться. Белый экран — худшее из состояний, по нему не понять,
 * сломалось демо или сам сервис.
 */
export async function startDemo(): Promise<void> {
	try {
		const { setupWorker } = await import('msw/browser');
		const worker = setupWorker(...handlers);

		await worker.start({
			// Всё, что не описано обработчиком (шрифты, иконки, сама статика), идёт как есть.
			onUnhandledRequest: 'bypass',
			serviceWorker: { url: `${import.meta.env.BASE_URL}mockServiceWorker.js` },
			quiet: true,
		});

		mountDemoPanel();
	} catch (error) {
		console.error('Демо-режим не запустился:', error);
		mountDemoFailure();
	}
}
