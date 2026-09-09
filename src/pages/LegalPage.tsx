import { Link } from 'react-router-dom';
import { useAuth } from '@/app/providers/useAuth';
import { ChevronLeftIcon, WarningIcon } from '@/shared/icons';
import { Card } from '@/shared/ui';

const SECTIONS = [
	{
		title: '1. Общие положения',
		paragraphs: [
			'Настоящая политика обработки персональных данных составлена в соответствии с требованиями Федерального закона от 27.07.2006 № 152-ФЗ «О персональных данных» и определяет порядок обработки персональных данных и меры по обеспечению их безопасности.',
			'Оператор ставит своей важнейшей целью соблюдение прав и свобод человека и гражданина при обработке его персональных данных, в том числе защиты прав на неприкосновенность частной жизни, личную и семейную тайну.',
		],
	},
	{
		title: '2. Состав обрабатываемых данных',
		paragraphs: [
			'Сервис обрабатывает данные учётной записи: фамилию, имя, отчество, дату рождения, адрес электронной почты, номер телефона, а также сведения о модели СИПАП-аппарата.',
			'Отдельно обрабатываются показатели терапии, считанные с карты памяти прибора: длительность использования, индексы дыхательных событий, утечки, давление и настройки аппарата с привязкой к дате.',
		],
	},
	{
		title: '3. Цели обработки',
		paragraphs: [
			'Показатели терапии обрабатываются для того, чтобы пациент и его лечащий врач могли оценивать эффективность лечения в динамике.',
			'Доступ врача к данным пациента возникает только после того, как пациент прикреплён к врачу, и прекращается сразу после отвязки.',
		],
	},
];

export default function LegalPage() {
	const { isAuthenticated } = useAuth();

	return (
		<div className={isAuthenticated ? 'flex flex-col gap-6' : 'mx-auto flex max-w-[860px] flex-col gap-6 px-6 py-12'}>
			{!isAuthenticated && (
				<Link to="/" className="inline-flex w-fit items-center gap-2 text-[13.5px] text-brand-600 hover:underline">
					<ChevronLeftIcon size={16} />
					На главную
				</Link>
			)}

			<h1 className="font-display text-[22px] font-bold sm:text-[27px]">Правовая информация</h1>

			<Card className="flex items-start gap-3 border-accent-500/30 bg-accent-050">
				<WarningIcon size={20} className="mt-px flex-none text-accent-700" />
				<p className="text-[13px] leading-relaxed text-accent-700">
					Документ приведён в сокращении. Для публикации нужны: полная редакция политики, реквизиты
					оператора персональных данных, срок хранения данных терапии и порядок обращения субъекта
					данных — адрес и форма запроса.
				</p>
			</Card>

			{SECTIONS.map((section) => (
				<Card key={section.title} className="flex flex-col gap-3">
					<h2 className="font-display text-base font-bold">{section.title}</h2>
					{section.paragraphs.map((paragraph) => (
						<p key={paragraph} className="text-[14px] leading-relaxed text-ink-2">
							{paragraph}
						</p>
					))}
				</Card>
			))}
		</div>
	);
}
