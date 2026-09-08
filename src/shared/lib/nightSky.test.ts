import { describe, expect, it } from 'vitest';
import { buildSky } from './nightSky';

/** Сайдбар: ширина фиксирована, высота равна длине страницы. */
const WIDTH = 248;

describe('ночное небо', () => {
	it('при росте страницы уже нарисованные звёзды остаются на местах', () => {
		const short = buildSky(3, WIDTH, 900, 1);
		const long = buildSky(3, WIDTH, 3000, 1);
		const where = new Set(long.stars.map((star) => `${star.x};${star.y};${star.r}`));

		// Длинная страница дописывает полосы снизу, а не пересобирает небо заново.
		expect(short.stars.length).toBeGreaterThan(0);
		expect(short.stars.every((star) => where.has(`${star.x};${star.y};${star.r}`))).toBe(true);
	});

	it('плотность звёзд не зависит от высоты поверхности', () => {
		const density = (height: number) => buildSky(3, WIDTH, height, 1).stars.length / height;

		// Раньше число звёзд было фиксированным, и на длинной странице они разъезжались.
		expect(density(3000)).toBeCloseTo(density(1200), 2);
	});

	it('размер звёзд не зависит от высоты поверхности', () => {
		const radii = (height: number) => buildSky(3, WIDTH, height, 1).stars.map((star) => star.r);

		// Небо рисуется в натуральную величину, поэтому радиусы всегда в одном диапазоне.
		expect(Math.max(...radii(3000))).toBeLessThanOrEqual(2.2);
		expect(Math.max(...radii(900))).toBeLessThanOrEqual(2.2);
		expect(Math.min(...radii(3000))).toBeGreaterThanOrEqual(0.7);
	});

	it('звёзды не выходят за пределы поверхности', () => {
		const { stars } = buildSky(3, WIDTH, 1000, 1);
		const visible = stars.filter((star) => star.y <= 1000);

		expect(visible.length).toBeGreaterThan(0);
		expect(visible.every((star) => star.x >= 0 && star.x <= WIDTH)).toBe(true);
	});

	it('созвездия не растягиваются через всю поверхность', () => {
		const { lines } = buildSky(3, WIDTH, 3000, 2);
		expect(lines.length).toBeGreaterThan(0);

		const longest = Math.max(
			...lines.flatMap((path) =>
				path.slice(1).map((star, index) => Math.hypot(star.x - path[index].x, star.y - path[index].y)),
			),
		);

		// Отрезок длиннее короткой стороны выглядит как черта поперёк панели, а не как созвездие.
		expect(longest).toBeLessThanOrEqual(WIDTH * 0.42);
	});
});
