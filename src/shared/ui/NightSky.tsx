import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { buildSky } from '@/shared/lib/nightSky';

/**
 * Ночное небо для тёмных поверхностей. Размеры не задаются снаружи: компонент
 * меряет собственную поверхность и рисует небо в натуральную величину, поэтому
 * звёзды одинаковы и на короткой странице, и на длинной. Раскладку считает
 * buildSky — см. комментарий там.
 */
interface NightSkyProps {
	/** Номер набора: одно и то же число всегда даёт одно и то же небо. */
	seed?: number;
	/** Сколько созвездий приходится на полосу неба. */
	constellations?: number;
	className?: string;
}

export function NightSky({ seed = 1, constellations = 1, className }: NightSkyProps) {
	const holder = useRef<HTMLDivElement>(null);
	const [size, setSize] = useState({ width: 0, height: 0 });

	useLayoutEffect(() => {
		const node = holder.current;
		if (!node) return;

		const measure = () => {
			const box = node.getBoundingClientRect();
			const width = Math.round(box.width);
			const height = Math.round(box.height);
			// Дробные доли пикселя не должны пересобирать небо на каждом кадре.
			setSize((previous) =>
				previous.width === width && previous.height === height ? previous : { width, height },
			);
		};

		// Меряем сами, а не ждём первого вызова наблюдателя: небо должно быть
		// на первом же кадре, и не во всяком окружении этот вызов приходит.
		measure();

		// Смена размера окна — самый частый случай, и он ловится везде.
		window.addEventListener('resize', measure);

		// В jsdom наблюдателя нет: небо декоративное, без него экран просто чуть проще.
		const observer =
			typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
		observer?.observe(node);

		return () => {
			window.removeEventListener('resize', measure);
			observer?.disconnect();
		};
	}, []);

	const sky = useMemo(
		() => buildSky(seed, size.width, size.height, constellations),
		[seed, size.width, size.height, constellations],
	);

	return (
		<div ref={holder} className={className} aria-hidden="true">
			{size.width > 0 && size.height > 0 && (
				<svg
					width={size.width}
					height={size.height}
					viewBox={`0 0 ${size.width} ${size.height}`}
					className="block"
					focusable="false"
				>
					{sky.lines.map((path, index) => (
						<polyline
							key={`line-${index}`}
							points={path.map((star) => `${star.x.toFixed(1)},${star.y.toFixed(1)}`).join(' ')}
							fill="none"
							stroke="#7BA0D8"
							strokeOpacity={0.14}
							strokeWidth={0.8}
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					))}
					{sky.stars.map((star, index) => (
						<circle
							key={`star-${index}`}
							cx={star.x.toFixed(1)}
							cy={star.y.toFixed(1)}
							r={star.r.toFixed(2)}
							fill="#BBD3F5"
							fillOpacity={star.o.toFixed(2)}
						/>
					))}
				</svg>
			)}
		</div>
	);
}
