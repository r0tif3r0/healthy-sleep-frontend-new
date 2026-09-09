import { Link } from 'react-router-dom';
import { illustrations } from '@/assets/illustrations';
import fsiLogo from '@/assets/fsi_logo_on_dark.svg';
import putpLogo from '@/assets/putp_logo.svg';
import { useTheme } from '@/app/providers/useTheme';
import { CheckIcon, LogoMark, MoonIcon, SunIcon } from '@/shared/icons';
import { Illustration, NightSky } from '@/shared/ui';

const STEPS = [
	{
		title: 'Снимите данные с аппарата',
		text: 'На главном экране прибора — кнопка «i», затем «SD» и «Сохранить данные». Аппарат запишет историю терапии на карту памяти.',
	},
	{
		title: 'Укажите папку в кабинете',
		text: 'Вставьте карту в компьютер, нажмите «Выбрать папку» и укажите карту целиком. Архив соберётся сам, дубли не создадутся.',
	},
	{
		title: 'Смотрите динамику вместе с врачом',
		text: 'Показатели появляются в вашем кабинете сразу, а лечащий врач видит их в своём — с графиками за любой период и отчётом на печать.',
	},
];

const PATIENT_POINTS = [
	'Приверженность лечению и длительность сна в маске по ночам',
	'Индексы апноэ и гипопноэ с пояснением, что считается нормой',
	'Утечки маски — видно, когда пора её подтянуть или заменить',
];

const DOCTOR_POINTS = [
	'Все подопечные в одном списке: прибор, давность выгрузки, контакты',
	'Карточка пациента: графики за период и таблица по каждой ночи',
	'Отчёт с русскими подписями и единицами — на печать или в PDF',
	'Прикрепление пациента по адресу электронной почты',
];

/*
 * Показатели разложены по группам, а не одним списком: семнадцать пунктов подряд
 * не читаются. Группы близки по объёму — 6, 5 и 6, — иначе короткая карточка
 * стоит полупустой рядом с длинными.
 */
const INDICATOR_GROUPS = [
	{
		title: 'Использование и приверженность',
		items: [
			'Даты использования',
			'Количество выбранных дней',
			'Количество дней использования',
			'Длительность использования',
			'Средняя длительность использования',
			'Приверженность лечению',
		],
	},
	{
		title: 'Дыхательные события',
		items: [
			'Индекс респираторных событий (AHI)',
			'Индекс обструктивных апноэ (OAI)',
			'Индекс центральных апноэ (CAI)',
			'Индекс неклассифицированных апноэ (UAI)',
			'Индекс гипопноэ (HI)',
		],
	},
	{
		title: 'Давление, утечки и настройки',
		items: [
			'Давление',
			'Утечки воздуха',
			'Минимальное давление',
			'Максимальное давление',
			'Длительность плавного старта (Ramp)',
			'Облегчение выдоха (EPR)',
		],
	},
];

const INDICATOR_COUNT = INDICATOR_GROUPS.reduce((total, group) => total + group.items.length, 0);

/** Приборы сгруппированы по производителю: у каждого своя раскладка файлов на карте. */
const DEVICE_GROUPS = [
	{
		manufacturer: 'ResMed',
		models: ['AirSense 11 AutoSet', 'AirSense S10', 'S9 AutoSet', 'AirCurve 10'],
	},
	{ manufacturer: 'ResVent', models: ['iBreeze 20A Pro'] },
	{ manufacturer: 'Weinmann', models: ['Prisma 20A'] },
];

export default function LandingPage() {
	const { theme, toggle } = useTheme();

	return (
		<div className="bg-canvas">
			<div id="top" className="relative overflow-hidden bg-night-950">
				<NightSky seed={11} constellations={2} className="pointer-events-none absolute inset-0 h-full w-full opacity-80" />

				<nav className="relative mx-auto flex h-21 max-w-[1180px] items-center gap-9 px-4 sm:px-8 lg:px-10">
					<a href="#top" className="group flex items-center gap-3">
						<span className="flex h-[42px] w-[42px] transition-transform group-hover:scale-105 flex-none items-center justify-center rounded-[14px] bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,.5)]">
							<LogoMark size={30} />
						</span>
						{/* На узком экране название прячется: со знаком, темой и «Войти» оно переносилось на вторую строку. */}
						<span className="hidden font-display text-[17px] font-bold whitespace-nowrap text-white sm:inline">
							Здоровый сон
						</span>
					</a>

					<div className="ml-5 hidden items-center gap-6 text-sm text-[#A8BCDC] lg:flex">
						<a href="#how" className="transition-colors hover:text-white">Как это работает</a>
						<a href="#roles" className="transition-colors hover:text-white">Пациенту и врачу</a>
						<a href="#indicators" className="transition-colors hover:text-white">Показатели</a>
						<a href="#devices" className="transition-colors hover:text-white">Приборы</a>
					</div>

					<div className="ml-auto flex flex-none items-center gap-2.5">
						{/*
						 * Тему можно было переключить только внутри кабинета: гость,
						 * которому светлая страница режет глаза, до этой кнопки не доходил.
						 */}
						<button
							type="button"
							onClick={toggle}
							aria-label={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
							className="flex h-11 w-11 flex-none items-center justify-center rounded-control text-[#A8BCDC] transition-colors hover:bg-white/[0.08] hover:text-white"
						>
							{theme === 'dark' ? <SunIcon size={20} /> : <MoonIcon size={20} />}
						</button>

						<Link
							to="/auth"
							className="rounded-control bg-accent-500 px-5 py-[11px] font-display text-sm font-semibold text-white shadow-action transition-colors hover:bg-accent-400 sm:px-6"
						>
							Войти
						</Link>
					</div>
				</nav>

				<div className="relative mx-auto grid max-w-[1180px] items-center gap-12 px-4 sm:px-8 lg:px-10 pt-14 pb-19 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
					<div className="flex flex-col gap-6">
						<span className="w-fit rounded-full border border-data-400/30 bg-data-400/12 px-4 py-[7px] text-[12.5px] font-semibold text-data-300">
							Телемониторинг СИПАП-терапии
						</span>
						<h1 className="font-display text-[clamp(32px,5vw,50px)] leading-[1.1] font-extrabold text-balance text-white">
							Терапия работает?
							<br />
							Теперь это видно, а не кажется.
						</h1>
						<p className="max-w-[520px] text-[17px] leading-relaxed text-[#B8CBE8]">
							Карта памяти СИПАП-аппарата хранит до 365 ночей: сколько вы спали в маске, сколько было
							остановок дыхания, какими были давление и утечки. «Здоровый сон» читает эти карты
							и показывает динамику — вам и вашему врачу.
						</p>
						<div className="flex flex-wrap items-center gap-3.5 pt-1">
							<Link
								to="/auth"
								className="w-full rounded-[14px] bg-accent-500 px-8 py-4 text-center font-display text-[15.5px] font-semibold text-white shadow-action sm:w-auto transition-all hover:-translate-y-0.5 hover:bg-accent-400 hover:shadow-[0_14px_32px_-10px_rgb(245_146_30/0.85)]"
							>
								Войти в личный кабинет
							</Link>
							<a
								href="#how"
								className="w-full rounded-[14px] border border-[#93AEDA]/36 px-7 py-4 text-center font-display text-[15.5px] font-semibold text-[#DCE7F8] sm:w-auto transition-colors hover:border-[#93AEDA]/70 hover:bg-white/5"
							>
								Как загрузить данные
							</a>
						</div>
					</div>

					<Illustration
						source={illustrations.heroDevices}
						alt="Показатели терапии на ноутбуке и телефоне"
						className="w-full rounded-[22px] shadow-[0_30px_70px_-30px_rgba(0,0,0,.75)]"
						eager
					/>
				</div>
			</div>

			<section id="how" className="scroll-mt-8 mx-auto flex max-w-[1180px] flex-col gap-10 px-4 sm:px-8 lg:px-10 pt-19 pb-5">
				<div className="flex max-w-[660px] flex-col gap-3">
					<h2 className="font-display text-[clamp(24px,3vw,34px)] font-bold">
						Три шага между картой памяти и приёмом у врача
					</h2>
					<p className="text-base leading-relaxed text-ink-2">
						Не нужно ничего распаковывать, переименовывать и пересылать почтой. Карта — компьютер — кнопка.
					</p>
				</div>

				<div className="grid gap-[22px] md:grid-cols-3">
					{STEPS.map((step, index) => (
						<article
							key={step.title}
							className="flex flex-col gap-4 rounded-card-lg border border-line bg-surface p-4 transition-all sm:p-7 hover:-translate-y-0.5 hover:border-ink-4 hover:shadow-card-lg"
						>
							<span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-night-900 font-display text-base font-bold text-white">
								{index + 1}
							</span>
							<h3 className="font-display text-lg font-bold">{step.title}</h3>
							<p className="text-[14.5px] leading-relaxed text-ink-2">{step.text}</p>
						</article>
					))}
				</div>
			</section>

			<section id="roles" className="scroll-mt-8 mx-auto grid max-w-[1180px] gap-[22px] px-4 sm:px-8 lg:px-10 pt-16 pb-5 lg:grid-cols-2">
				<article className="flex flex-col overflow-hidden rounded-[22px] border border-line bg-surface">
					<Illustration
						source={illustrations.emptySleep}
						alt="Пациент на СИПАП-терапии ночью"
						className="h-[196px] w-full object-cover"
						style={{ objectPosition: 'center 58%' }}
					/>
					<div className="flex flex-col gap-4 p-4 sm:p-7">
						<span className="w-fit rounded-full bg-accent-050 px-3.5 py-1.5 text-xs font-semibold text-accent-700">
							Пациенту
						</span>
						<h3 className="font-display text-[23px] font-bold">
							Понятный ответ на вопрос «Мне становится лучше?»
						</h3>
						<ul className="flex flex-col gap-3">
							{PATIENT_POINTS.map((point) => (
								<li key={point} className="flex items-start gap-3">
									<CheckIcon size={19} className="mt-0.5 flex-none text-ok" />
									<span className="text-[14.5px] leading-relaxed text-ink-2">{point}</span>
								</li>
							))}
						</ul>
					</div>
				</article>

				<article className="relative flex flex-col gap-4 overflow-hidden rounded-[22px] bg-night-900 p-4 sm:p-8">
					<NightSky seed={23} className="pointer-events-none absolute inset-0 h-full w-full opacity-70" />
					<span className="relative w-fit rounded-full bg-data-400/14 px-3.5 py-1.5 text-xs font-semibold text-data-300">
						Врачу
					</span>
					<h3 className="relative font-display text-[23px] font-bold text-white">
						Список пациентов, у которых терапия идёт не по плану
					</h3>
					<ul className="relative flex flex-col gap-3">
						{DOCTOR_POINTS.map((point) => (
							<li key={point} className="flex items-start gap-3">
								<CheckIcon size={19} className="mt-0.5 flex-none text-data-400" />
								<span className="text-[14.5px] leading-relaxed text-[#B8CBE8]">{point}</span>
							</li>
						))}
					</ul>
				</article>
			</section>

			<section id="indicators" className="scroll-mt-8 mx-auto flex max-w-[1180px] flex-col gap-7 px-4 sm:px-8 lg:px-10 pt-16 pb-5">
				<div className="flex max-w-[620px] flex-col gap-3">
					<h2 className="font-display text-[clamp(24px,3vw,34px)] font-bold">
						{INDICATOR_COUNT} показателей терапии — из данных прибора, а не со слов
					</h2>
					<p className="text-base leading-relaxed text-ink-2">
						Всё, что записал аппарат за ночь, разбирается и приводится к единому виду — независимо
						от производителя.
					</p>
				</div>

				<div className="grid gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
					{INDICATOR_GROUPS.map((group) => (
						<div
							key={group.title}
							className="flex flex-col gap-3.5 rounded-card-lg border border-line bg-surface p-4 sm:p-6"
						>
							<h3 className="font-display text-[15px] font-bold">{group.title}</h3>
							<ul className="flex flex-col gap-2.5">
								{group.items.map((item) => (
									<li key={item} className="flex items-start gap-2.5 text-[13.5px] leading-snug text-ink-2">
										<span className="mt-[7px] h-1.5 w-1.5 flex-none rounded-full bg-data-400" />
										{item}
									</li>
								))}
							</ul>
						</div>
					))}
				</div>
			</section>

			{/*
			 * Приборы отдельной секцией: раньше они шли следом за показателями внутри
			 * одного блока и отличались только цветом плашки — в тёмной теме два
			 * оттенка ночи почти совпадали, и список читался как продолжение показателей.
			 */}
			<section id="devices" className="scroll-mt-8 mx-auto flex max-w-[1180px] flex-col gap-7 px-4 sm:px-8 lg:px-10 pt-16 pb-5">
				<div className="flex max-w-[620px] flex-col gap-3">
					<h2 className="font-display text-[clamp(24px,3vw,34px)] font-bold">Поддерживаемые приборы</h2>
					<p className="text-base leading-relaxed text-ink-2">
						От модели зависит, как разбирается архив с карты: у каждого производителя своя раскладка
						файлов. Прибор указывается в личном кабинете один раз.
					</p>
				</div>

				{/* Карточки без звёздного неба: до подвала оно идёт ещё дважды подряд и перестаёт читаться как приём. */}
				<div className="grid items-start gap-[18px] sm:grid-cols-3">
					{DEVICE_GROUPS.map((group) => (
						<div key={group.manufacturer} className="flex flex-col gap-3.5 rounded-card-lg bg-night-900 p-4 sm:p-6">
							<h3 className="font-display text-[15px] font-bold text-white">{group.manufacturer}</h3>
							<ul className="flex flex-col gap-2.5">
								{group.models.map((model) => (
									<li key={model} className="text-[13.5px] leading-snug text-[#B8CBE8]">
										{model}
									</li>
								))}
							</ul>
						</div>
					))}
				</div>
			</section>

			<section className="mx-auto max-w-[1180px] px-4 sm:px-8 lg:px-10 pt-16 pb-16">
				<div className="relative flex flex-wrap items-center justify-between gap-10 overflow-hidden rounded-[24px] bg-night-950 p-5 sm:p-9 lg:p-12">
					<NightSky seed={17} className="pointer-events-none absolute inset-0 h-full w-full opacity-75" />
					<div className="relative flex max-w-[620px] flex-col gap-3.5">
						<h2 className="font-display text-[clamp(22px,3vw,32px)] leading-tight font-bold text-balance text-white">
							Учётную запись выдаёт ваш медицинский центр
						</h2>
						<p className="text-base leading-relaxed text-[#B8CBE8]">
							Если вы уже проходите СИПАП-терапию в центре — войдите с почтой, на которую оформлено
							наблюдение. Врачей и администраторов заводит администратор центра.
						</p>
					</div>
					<Link
						to="/auth"
						className="relative w-full rounded-[14px] bg-accent-500 px-9 py-[17px] text-center font-display text-base font-semibold whitespace-nowrap text-white shadow-action sm:w-auto transition-all hover:-translate-y-0.5 hover:bg-accent-400 hover:shadow-[0_14px_32px_-10px_rgb(245_146_30/0.85)]"
					>
						Войти в кабинет
					</Link>
				</div>
			</section>

			{/*
			 * Подвал ночной в обеих темах, как шапка: оба знака поддержки рассчитаны
			 * на тёмную подложку, а светлый подвал заставлял бы держать для них
			 * отдельную плашку посреди страницы.
			 */}
			{/* Граница нужна тёмной теме: там холст страницы того же цвета, что и подвал. */}
			<footer className="relative overflow-hidden border-t border-white/10 bg-night-950">
				<NightSky seed={23} constellations={2} className="pointer-events-none absolute inset-0 h-full w-full opacity-80" />

				<div className="relative mx-auto flex max-w-[1180px] flex-wrap items-start justify-between gap-10 px-4 sm:px-8 lg:px-10 py-10">
					<div className="flex max-w-[440px] flex-col gap-3.5">
						<span className="flex items-center gap-3">
							{/* Знак на белой подложке — как в шапке и на входе: на ночном фоне он иначе теряется. */}
							<span className="flex h-11 w-11 flex-none items-center justify-center rounded-[14px] bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,.5)]">
								<LogoMark size={31} />
							</span>
							<span className="font-display text-[15px] font-bold text-white">Здоровый сон</span>
						</span>
						<p className="text-[13px] leading-relaxed text-[#7C93BC]">
							ООО «СИПАП ЦЕНТР» · ОГРН 1267800061462 · ИНН 7801753538
							<br />
							199106, Санкт-Петербург, площадь Морской Славы, д. 1, литера А
						</p>
					</div>

					<div className="flex flex-wrap gap-14">
						<FooterColumn title="Сервис">
							<Link to="/auth">Вход в кабинет</Link>
							<a href="#how">Как загрузить данные</a>
							<a href="#indicators">Какие показатели видны</a>
							<a href="#devices">Поддерживаемые приборы</a>
						</FooterColumn>
						<FooterColumn title="Документы">
							<Link to="/legal">Политика обработки персональных данных</Link>
						</FooterColumn>
						<FooterColumn title="Связь">
							<span>[телефон центра]</span>
							<span>[почта центра]</span>
						</FooterColumn>
					</div>
				</div>

				<div className="relative border-t border-white/10">
					<div className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-x-10 gap-y-5 px-4 sm:px-8 lg:px-10 py-7">
						<div className="flex flex-none items-center gap-7">
							{/* Подписи у знаков нет: текст рядом называет обе организации полностью. */}
							<img
								src={fsiLogo}
								alt=""
								loading="lazy"
								decoding="async"
								className="h-11 w-auto sm:h-14"
							/>
							<img
								src={putpLogo}
								alt=""
								loading="lazy"
								decoding="async"
								className="h-[60px] w-auto sm:h-[76px]"
							/>
						</div>

						<p className="max-w-[680px] text-[12.5px] leading-relaxed text-[#8FA4C6]">
							Проект реализован при поддержке Фонда содействия инновациям в рамках программы
							«Студенческий стартап» мероприятия «Платформа университетского технологического
							предпринимательства» федерального проекта «Технологии»
						</p>
					</div>
				</div>
			</footer>
		</div>
	);
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<div className="flex flex-col gap-2.5">
			<span className="text-[11.5px] font-semibold tracking-[0.05em] text-[#7C93BC] uppercase">{title}</span>
			<div className="flex flex-col items-start gap-2.5 text-[13.5px] text-[#A8BCDC] [&_a]:transition-colors [&_a:hover]:text-white">{children}</div>
		</div>
	);
}

