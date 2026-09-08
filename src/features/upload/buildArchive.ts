import JSZip from 'jszip';

export class EmptyFolderError extends Error {
	constructor() {
		super('В выбранной папке нет файлов');
		this.name = 'EmptyFolderError';
	}
}

export interface Archive {
	blob: Blob;
	folderName: string;
	fileCount: number;
}

/**
 * Собирает выбранную папку карты памяти в zip прямо в браузере.
 *
 * Структура папок сохраняется: разбор на сервере ищет файлы по путям внутри
 * архива, поэтому «сплющивать» дерево нельзя. Логика перенесена из прежнего
 * фронтенда — она проверена на реальных архивах пяти приборов.
 */
export async function buildArchive(files: FileList | File[]): Promise<Archive> {
	const list = Array.from(files);
	if (list.length === 0) throw new EmptyFolderError();

	const zip = new JSZip();
	for (const file of list) {
		const path = (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name;
		zip.file(path, file);
	}

	const blob = await zip.generateAsync({ type: 'blob' });
	const firstPath = (list[0] as File & { webkitRelativePath?: string }).webkitRelativePath ?? '';
	const folderName = firstPath.split('/')[0] || 'archive';

	return { blob, folderName, fileCount: list.length };
}
