/**
 * Раскладка звёзд для ночных поверхностей: сайдбара, героя лендинга, врезок.
 *
 * Небо рисуется в натуральную величину поверхности, а не растягивается под неё.
 * Раньше размеры задавались пропсами и картинка масштабировалась: чем длиннее
 * страница, тем крупнее и реже становились звёзды — на сайдбаре при переходе
 * с недели на три месяца небо заметно «размазывало».
 *
 * Звёзды раскладываются полосами по BAND пикселей. Содержимое полосы зависит
 * только от её номера, поэтому выросшая страница дописывает полосы снизу,
 * а уже нарисованные звёзды остаются на своих местах.
 */

/** Высота полосы, внутри которой звёзды раскладываются заново. */
const BAND = 600;

/** Одна звезда на столько пикселей площади — плотность одинакова везде. */
const DENSITY = 5200;

export interface Star {
	x: number;
	y: number;
	r: number;
	o: number;
}

/** Простой воспроизводимый генератор: небо не должно «мигать» при перерисовке. */
function random(seed: number) {
	let state = seed >>> 0;
	return () => {
		state = (state + 0x6d2b79f5) >>> 0;
		let t = Math.imul(state ^ (state >>> 15), 1 | state);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/**
 * Соединяем только близкие звёзды: иначе созвездие вырождается в одну длинную
 * прямую через всю поверхность.
 */
function connect(stars: Star[], next: () => number, count: number, maxSpan: number) {
	const lines: Star[][] = [];
	const used = new Set<number>();

	for (let line = 0; line < count; line += 1) {
		let index = Math.floor(next() * stars.length);
		const path: Star[] = [];

		for (let step = 0; step < 4; step += 1) {
			if (used.has(index)) break;
			used.add(index);
			path.push(stars[index]);

			let best = -1;
			let bestDistance = Infinity;
			for (let i = 0; i < stars.length; i += 1) {
				if (used.has(i)) continue;
				const dx = stars[i].x - stars[index].x;
				const dy = stars[i].y - stars[index].y;
				const distance = Math.hypot(dx, dy);
				if (distance < bestDistance && distance <= maxSpan) {
					bestDistance = distance;
					best = i;
				}
			}
			if (best === -1) break;
			index = best;
		}

		if (path.length > 2) lines.push(path);
	}

	return lines;
}

export function buildSky(seed: number, width: number, height: number, constellations: number) {
	const stars: Star[] = [];
	const lines: Star[][] = [];
	const perBand = Math.max(6, Math.round((width * BAND) / DENSITY));
	const maxSpan = Math.min(width, BAND) * 0.42;

	for (let band = 0; band < Math.ceil(height / BAND); band += 1) {
		// Полоса зависит только от своего номера — при росте страницы не пересобирается.
		const next = random(seed * 7919 + band);
		const bandStars: Star[] = [];

		for (let i = 0; i < perBand; i += 1) {
			bandStars.push({
				x: next() * width,
				y: band * BAND + next() * BAND,
				// Крупных звёзд мало — иначе небо превращается в шум.
				r: next() < 0.16 ? 1.6 + next() * 0.6 : 0.7 + next() * 0.7,
				o: 0.22 + next() * 0.5,
			});
		}

		// Созвездия строим по всей полосе, а в разметку кладём только видимое:
		// последняя полоса почти всегда обрезана, и её низ рисовать незачем.
		lines.push(...connect(bandStars, next, constellations, maxSpan));
		stars.push(...bandStars.filter((star) => star.y <= height));
	}

	return { stars, lines };
}
