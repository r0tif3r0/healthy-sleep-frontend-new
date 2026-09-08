import { tokens } from '@/shared/api/tokens';

/**
 * Плашка демо-режима. Сделана обычным DOM, а не React-компонентом, чтобы
 * приложение о ней ничего не знало: удаление папки src/demo не оставляет
 * висящих импортов в коде приложения.
 *
 * Вход — это подстановка токена и полная перезагрузка: дальше приложение само
 * запрашивает профиль и разбирается с ролью, как с настоящим сервером.
 */

const ACCOUNTS = [
	{ label: 'Пациент', id: 101, path: '/app/stats' },
	{ label: 'Врач', id: 1, path: '/app/patients' },
	{ label: 'Администратор', id: 2, path: '/app/admin' },
];

const STYLE = `
.demo-bar {
	/* Правый нижний угол и с отступом от края: слева плашка перекрывала текст. */
	position: fixed; right: 16px; bottom: 32px; z-index: 70;
	display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
	padding: 10px 14px; border-radius: 14px;
	background: #0b1b3a; color: #e6eefb;
	font: 500 12.5px/1.2 'Golos Text', 'Segoe UI', system-ui, sans-serif;
	box-shadow: 0 12px 28px -14px rgb(0 0 0 / 0.6);
	max-width: calc(100vw - 32px);
}
.demo-bar__tag {
	padding: 3px 9px; border-radius: 999px;
	background: #f5921e; color: #3a1e02; font-weight: 700; font-size: 11px;
	letter-spacing: .04em; text-transform: uppercase;
}
.demo-bar__hint { color: #a8bcdc; }
.demo-bar button {
	padding: 6px 12px; border-radius: 9px; border: 1px solid #23457f;
	background: #122a55; color: #e6eefb; font: inherit; cursor: pointer;
}
.demo-bar button:hover { background: #173768; }
.demo-bar button[data-reset] { border-color: #3a2a12; background: transparent; color: #fba94c; }
@media print { .demo-bar { display: none; } }
`;

export function mountDemoPanel(): void {
	if (document.querySelector('.demo-bar')) return;

	const style = document.createElement('style');
	style.textContent = STYLE;
	document.head.appendChild(style);

	const bar = document.createElement('div');
	bar.className = 'demo-bar';

	const tag = document.createElement('span');
	tag.className = 'demo-bar__tag';
	tag.textContent = 'Демо';
	bar.appendChild(tag);

	const hint = document.createElement('span');
	hint.className = 'demo-bar__hint';
	hint.textContent = 'Войти как:';
	bar.appendChild(hint);

	for (const account of ACCOUNTS) {
		const button = document.createElement('button');
		button.type = 'button';
		button.textContent = account.label;
		button.addEventListener('click', () => {
			tokens.set({ access: `demo-token-${account.id}`, refresh: `demo-token-refresh-${account.id}` });
			window.location.assign(account.path);
		});
		bar.appendChild(button);
	}

	const reset = document.createElement('button');
	reset.type = 'button';
	reset.dataset.reset = 'true';
	reset.textContent = 'Сбросить демо';
	reset.addEventListener('click', () => {
		// Состояние живёт в памяти вкладки, поэтому перезагрузка возвращает его к исходному.
		tokens.clear();
		window.location.assign('/');
	});
	bar.appendChild(reset);

	document.body.appendChild(bar);
}

/**
 * Демо без перехватчика запросов остаётся без данных. Молча показывать пустой
 * кабинет нельзя: человек решит, что сломано приложение, а не демо-обвязка.
 */
export function mountDemoFailure(): void {
	if (document.querySelector('.demo-bar')) return;

	const style = document.createElement('style');
	style.textContent = STYLE;
	document.head.appendChild(style);

	const bar = document.createElement('div');
	bar.className = 'demo-bar';

	const tag = document.createElement('span');
	tag.className = 'demo-bar__tag';
	tag.textContent = 'Демо';
	bar.appendChild(tag);

	const hint = document.createElement('span');
	hint.className = 'demo-bar__hint';
	hint.textContent =
		'Не запустилось: браузер не дал зарегистрировать service worker, данных не будет. Откройте обычное окно (не приватное) или другой браузер.';
	bar.appendChild(hint);

	document.body.appendChild(bar);
}
