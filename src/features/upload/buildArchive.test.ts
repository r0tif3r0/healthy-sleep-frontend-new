import JSZip from 'jszip';
import { describe, expect, it } from 'vitest';
import { EmptyFolderError, buildArchive } from './buildArchive';

const fileAt = (path: string, content = 'данные') => {
	const name = path.split('/').pop() ?? path;
	const file = new File([content], name, { type: 'application/octet-stream' });
	Object.defineProperty(file, 'webkitRelativePath', { value: path });
	return file;
};

describe('сборка архива с карты', () => {
	it('сохраняет структуру папок — разбор ищет файлы по путям', async () => {
		const archive = await buildArchive([
			fileAt('AirSense11/SETTINGS/config.pcfg'),
			fileAt('AirSense11/DATALOG/20260906/therapy.pdat'),
		]);

		const unzipped = await JSZip.loadAsync(archive.blob);
		const paths = Object.keys(unzipped.files).filter((name) => !unzipped.files[name].dir);

		expect(paths).toContain('AirSense11/SETTINGS/config.pcfg');
		expect(paths).toContain('AirSense11/DATALOG/20260906/therapy.pdat');
	});

	it('имя архива берётся из первого сегмента пути', async () => {
		const archive = await buildArchive([fileAt('AirSense11/SETTINGS/config.pcfg')]);
		expect(archive.folderName).toBe('AirSense11');
	});

	it('считает файлы', async () => {
		const archive = await buildArchive([fileAt('a/1.bin'), fileAt('a/2.bin'), fileAt('a/3.bin')]);
		expect(archive.fileCount).toBe(3);
	});

	it('пустая папка отклоняется понятной ошибкой, а не падением', async () => {
		await expect(buildArchive([])).rejects.toBeInstanceOf(EmptyFolderError);
	});

	it('файл без пути кладётся под своим именем', async () => {
		const plain = new File(['данные'], 'therapy.pdat');
		const archive = await buildArchive([plain]);

		const unzipped = await JSZip.loadAsync(archive.blob);
		expect(Object.keys(unzipped.files)).toContain('therapy.pdat');
		expect(archive.folderName).toBe('archive');
	});
});
