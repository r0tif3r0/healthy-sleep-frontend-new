import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * Сбрасывает прокрутку при переходе на другую страницу.
 *
 * Роутер меняет содержимое, но браузер прокрутку не трогает — переход из подвала
 * лендинга на политику открывал её где-то с середины.
 *
 * Возврат назад не трогаем: там прокрутку восстанавливает сам браузер, и увести
 * человека в начало страницы, с которой он ушёл, было бы хуже.
 *
 * Якоря внутри страницы (#how, #devices) тоже не затрагиваются: у них меняется
 * hash, а не pathname.
 */
export function ScrollToTop() {
	const { pathname } = useLocation();
	const navigationType = useNavigationType();

	useEffect(() => {
		/*
		 * behavior указан явно: в стилях у html стоит scroll-behavior: smooth ради
		 * плавных переходов к якорям лендинга, и без этого сброс тоже анимировался бы —
		 * на длинной политике человек смотрел бы, как страница едет через весь текст.
		 * Значение instant перебивает CSS только здесь, якоря остаются плавными.
		 */
		if (navigationType !== 'POP') window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
	}, [pathname, navigationType]);

	return null;
}
