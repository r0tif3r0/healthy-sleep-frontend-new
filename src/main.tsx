import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from '@/app/App';
import '@/styles/index.css';

const container = document.getElementById('root');
if (!container) {
	throw new Error('Не найден корневой элемент #root');
}

const render = () =>
	createRoot(container).render(
		<StrictMode>
			<App />
		</StrictMode>,
	);

// --- демо-режим (удаляется вместе с папкой src/demo, см. src/demo/README.md) ---
if (import.meta.env.VITE_DEMO === '1') {
	// Динамический импорт: без флага демо-код в сборку не попадает.
	// Приложение рисуем в любом случае — даже если демо-обвязка не поднялась.
	import('@/demo/start')
		.then(({ startDemo }) => startDemo())
		.catch((error: unknown) => console.error('Демо-режим не загрузился:', error))
		.finally(render);
} else {
	render();
}
