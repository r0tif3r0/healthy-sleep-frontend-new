import { Card, CardHeader } from '@/shared/ui';
import { WarningIcon } from '@/shared/icons';

/**
 * Текст описывает нынешний порядок работы: карта — компьютер — кнопка.
 * Прежняя инструкция вела пациента пересылать медицинские данные почтой
 * на посторонний адрес.
 */
const STEPS = [
	'Включите аппарат в сеть и дождитесь режима ожидания. Карта памяти должна быть внутри.',
	'Нажмите кнопку информации «i» на главном экране аппарата.',
	'В меню выберите пункт «SD» — третий сверху, со значком карты памяти.',
	'Нажмите «Сохранить данные» и подтвердите кнопкой «ОК». Дождитесь сообщения «Данные скопированы».',
	'Слегка нажмите на карту — она выдвинется из слота. Достаньте её и вставьте в компьютер.',
	'Вернитесь на эту страницу, нажмите «Выбрать папку» и укажите карту целиком.',
];

export function UploadInstructions() {
	return (
		<Card className="flex flex-col gap-[18px] p-[22px_24px]">
			<CardHeader title="Как снять данные с аппарата" />

			<ol className="flex flex-col gap-4">
				{STEPS.map((step, index) => (
					<li key={step} className="flex gap-3.5">
						<span className="tnum flex h-[26px] w-[26px] flex-none items-center justify-center rounded-[9px] bg-brand-050 text-[12.5px] font-bold text-brand-600">
							{index + 1}
						</span>
						<p className="text-[13.5px] leading-relaxed text-ink-2">{step}</p>
					</li>
				))}
			</ol>

			<div className="h-px bg-line-soft" />

			<div className="flex items-start gap-3 rounded-control bg-accent-050 p-3.5">
				<WarningIcon size={18} className="mt-px flex-none text-accent-700" />
				<p className="text-[12.5px] leading-relaxed text-accent-700">
					Если аппарат нужно перенастроить, врач пришлёт новый файл конфигурации. Если что-то не
					получается — позвоните в регистратуру: <b>[телефон регистратуры]</b>.
				</p>
			</div>
		</Card>
	);
}
