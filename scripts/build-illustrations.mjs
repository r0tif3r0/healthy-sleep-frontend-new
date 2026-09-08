/**
 * Готовит иллюстрации приложения из оригиналов в ../new-assets.
 *
 * Оригиналы — PNG 1672×941 по мегабайту с лишним. В приложение они идут
 * в двух плотностях и двух форматах: WebP для всех современных браузеров
 * и JPEG как запасной вариант.
 *
 * Запуск: node scripts/build-illustrations.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const here = path.dirname(fileURLToPath(import.meta.url));
const SOURCE = path.resolve(here, '../../new-assets');
const TARGET = path.resolve(here, '../src/assets/illustrations');

/**
 * `width` — ширина под обычный экран, `retina` — под экран с двойной плотностью.
 * Больше ширины оригинала не поднимаем: апскейл только портит картинку и вес.
 */
const IMAGES = [
	{
		file: 'ChatGPT_Image_1_sent_2026_g__23_03_25.png',
		name: 'hero-devices',
		width: 700,
		retina: 1400,
		note: 'герой лендинга: ноутбук и телефон с показателями',
	},
	{
		file: 'ChatGPT_Image_5_sent_2026_g__16_03_37.png',
		name: 'auth-night',
		width: 620,
		retina: 941,
		note: 'вертикальная половина экрана входа',
	},
	{
		file: 'ChatGPT_Image_1_sent_2026_g__22_58_20.png',
		name: 'upload-band',
		width: 1200,
		retina: 1672,
		note: 'широкая полоса-шапка страницы загрузки',
	},
	{
		file: 'ChatGPT_Image_1_sent_2026_g__23_00_33.png',
		name: 'empty-sleep',
		width: 700,
		retina: 1400,
		note: 'карточка «пациенту», пустые состояния и 404',
	},
];

fs.mkdirSync(TARGET, { recursive: true });

const kb = (file) => Math.round(fs.statSync(file).size / 1024);

for (const image of IMAGES) {
	const source = path.join(SOURCE, image.file);
	if (!fs.existsSync(source)) {
		console.error(`пропущено, нет файла: ${image.file}`);
		continue;
	}

	const meta = await sharp(source).metadata();
	const sizes = [
		{ suffix: '', width: Math.min(image.width, meta.width) },
		{ suffix: '@2x', width: Math.min(image.retina, meta.width) },
	];

	const report = [];

	for (const size of sizes) {
		const resized = sharp(source).resize({ width: size.width, withoutEnlargement: true });

		const webp = path.join(TARGET, `${image.name}${size.suffix}.webp`);
		await resized.clone().webp({ quality: 82, effort: 5 }).toFile(webp);

		const jpg = path.join(TARGET, `${image.name}${size.suffix}.jpg`);
		await resized.clone().jpeg({ quality: 84, mozjpeg: true, progressive: true }).toFile(jpg);

		report.push(`${size.width}px → webp ${kb(webp)}КБ, jpg ${kb(jpg)}КБ`);
	}

	console.log(`${image.name} (${meta.width}×${meta.height}) — ${image.note}`);
	for (const line of report) console.log(`   ${line}`);
}

// Прежние ужатые файлы из дизайн-канваса больше не нужны.
for (const image of IMAGES) {
	const stale = path.join(TARGET, `${image.name}.jpg.old`);
	if (fs.existsSync(stale)) fs.unlinkSync(stale);
}

console.log('\nГотово.');
