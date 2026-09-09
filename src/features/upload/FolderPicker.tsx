import { useRef, useState } from 'react';
import { toMessage } from '@/shared/api/errors';
import { pluralNights } from '@/shared/lib/format';
import { useUploadCpapData } from '@/shared/api/upload';
import { UploadIcon } from '@/shared/icons';
import { Button, Card, useToast } from '@/shared/ui';
import { EmptyFolderError, buildArchive } from './buildArchive';

/** Атрибут выбора папки нестандартный, поэтому объявляем его явно. */
declare module 'react' {
	interface InputHTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
		webkitdirectory?: string;
	}
}

interface FolderPickerProps {
	disabled?: boolean;
	onUploaded?: (added: number) => void;
}

export function FolderPicker({ disabled, onUploaded }: FolderPickerProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [packing, setPacking] = useState(false);
	const upload = useUploadCpapData();
	const toast = useToast();

	const handleFiles = async (files: FileList | null) => {
		if (!files) return;

		try {
			setPacking(true);
			const archive = await buildArchive(files);
			setPacking(false);

			const result = await upload.mutateAsync({ blob: archive.blob, folderName: archive.folderName });

			// Прежде «успешно» показывалось и тогда, когда не добавилось ни одной ночи.
			if (result.count > 0) {
				toast.show({
					title: `Добавлено ${pluralNights(result.count)}`,
					description: 'Показатели уже доступны на экране статистики.',
					tone: 'ok',
				});
			} else {
				toast.show({
					title: 'Новых ночей нет',
					description: 'Эти данные уже были загружены раньше. Снимите с прибора свежий архив.',
					tone: 'info',
				});
			}

			onUploaded?.(result.count);
		} catch (error) {
			setPacking(false);
			toast.show({
				title: 'Не удалось загрузить архив',
				description:
					error instanceof EmptyFolderError
						? 'В выбранной папке нет файлов. Укажите папку карты памяти целиком.'
						: toMessage(error, 'Проверьте, что выбрана папка карты памяти прибора.'),
				tone: 'bad',
			});
		} finally {
			if (inputRef.current) inputRef.current.value = '';
		}
	};

	const busy = packing || upload.isPending;

	return (
		<Card
			padding="none"
			className="flex flex-col items-center gap-[18px] border-[1.5px] border-dashed border-[#B9CEEA] px-5 py-8 text-center sm:px-8 sm:py-11"
		>
			<span className="flex h-[72px] w-[72px] items-center justify-center rounded-[22px] bg-brand-050 text-brand-600">
				<UploadIcon size={34} />
			</span>

			<div className="flex flex-col gap-2">
				<h2 className="font-display text-lg font-bold">Выберите папку с SD-карты</h2>
				<p className="mx-auto max-w-[420px] text-[13.5px] leading-relaxed text-ink-2">
					Укажите папку карты целиком. Браузер сам соберёт архив и отправит его — распаковывать
					и переименовывать файлы не нужно.
				</p>
			</div>

			<input
				ref={inputRef}
				type="file"
				multiple
				webkitdirectory=""
				className="hidden"
				onChange={(event) => void handleFiles(event.target.files)}
			/>

			<Button
				variant="primary"
				size="lg"
				disabled={disabled}
				loading={busy}
				onClick={() => inputRef.current?.click()}
			>
				{packing ? 'Собираем архив' : upload.isPending ? 'Отправляем' : 'Выбрать папку'}
			</Button>

			<span className="tnum text-xs text-ink-3">Поддерживаются карты ResMed, ResVent и Weinmann</span>
		</Card>
	);
}

