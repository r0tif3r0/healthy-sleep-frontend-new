import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

/**
 * Отчёт живёт в отдельном узле на уровне body: печатный стиль прячет всё
 * остальное и оставляет только его. Держать документ внутри приложения нельзя —
 * тогда в печать попадают сайдбар и карточки экрана.
 */
export function ReportPortal({ children }: { children: ReactNode }) {
	const [node, setNode] = useState<HTMLElement | null>(null);
	const created = useRef(false);

	useEffect(() => {
		let element = document.getElementById('report-portal');

		if (!element) {
			element = document.createElement('div');
			element.id = 'report-portal';
			document.body.appendChild(element);
			created.current = true;
		}

		setNode(element);

		return () => {
			if (created.current && element?.parentNode) element.parentNode.removeChild(element);
		};
	}, []);

	return node ? createPortal(children, node) : null;
}
