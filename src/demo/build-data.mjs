/**
 * Пересборка demo/data.json из настоящих ночей, разобранных бэкендом.
 *
 * Запускать не нужно при обычной работе — файл data.json уже лежит в репозитории.
 * Скрипт здесь, чтобы демо-данные не были загадочным блобом и их можно было
 * собрать заново, если добавятся архивы новых приборов.
 *
 * Порядок:
 *   1. поднять бэкенд и прогнать архивы (см. корневой README);
 *   2. выгрузить ночи:
 *        docker exec healthysleep_postgres psql -U healthysleep -d healthysleep -t -A \
 *          -c "select u.device_id, s.date, s.data::text from statistic_cpapstatistic s \
 *              join users_user u on u.id=s.user_id where u.email like 'probe.%' \
 *              order by u.device_id, s.date;" > nights.psv
 *   3. node src/demo/build-data.mjs nights.psv
 */
import fs from 'node:fs';
import path from 'node:path';

const source = process.argv[2];
if (!source) {
	console.error('Укажите файл выгрузки: node src/demo/build-data.mjs nights.psv');
	process.exit(1);
}

const byDevice = new Map();
for (const line of fs.readFileSync(source, 'utf8').split('\n')) {
	const trimmed = line.trim();
	if (!trimmed) continue;

	const [device, date, json] = trimmed.split('|');
	const list = byDevice.get(Number(device)) ?? [];
	list.push({ date, data: JSON.parse(json) });
	byDevice.set(Number(device), list);
}
for (const list of byDevice.values()) list.sort((a, b) => a.date.localeCompare(b.date));

/**
 * Ночи раскладываются подряд, по одной на день, заканчиваясь `endsAgo` дней назад.
 *
 * Настоящие даты архивов разрежены на полтора года, и в тридцатидневное окно
 * попадало бы три-четыре ночи — на показе это выглядит как пустая база.
 * Значения показателей остаются приборными, синтетическая только раскладка
 * по календарю; `skipEvery` оставляет реалистичные пропуски терапии.
 */
function toOffsets(nights, endsAgo, skipEvery = 0) {
	const out = [];
	let day = endsAgo;

	for (let i = nights.length - 1; i >= 0; i -= 1) {
		out.unshift({ offset: day, data: nights[i].data });
		day += 1;
		if (skipEvery && (nights.length - i) % skipEvery === 0) day += 1;
	}

	return out;
}

const s10 = byDevice.get(2) ?? [];
const s11 = byDevice.get(3) ?? [];
const airCurve = byDevice.get(4) ?? [];
const resVent = byDevice.get(5) ?? [];

// У S10 71 ночь — делим на двух пациентов с разной картиной терапии.
const s10Good = s10.filter((night) => night.data.duration >= 240).slice(-34);
const s10Poor = s10.filter((night) => night.data.duration < 300).slice(-28);

const patients = [
	{
		id: 101, privateId: 'demo-smirnova', email: 'anna.smirnova@example.ru', phone: '+79214481602',
		lastName: 'Смирнова', firstName: 'Анна', patronymic: 'Петровна', birth: '1971-03-14',
		joinedAgo: 580, deviceId: 2,
		additional: 'Жалобы на утреннюю головную боль сохраняются. Маска заменена в июле.',
		nights: toOffsets(s10Good, 1, 9),
	},
	{
		id: 102, privateId: 'demo-kovalev', email: 'm.kovalev@example.ru', phone: '+79052240711',
		lastName: 'Ковалёв', firstName: 'Михаил', patronymic: 'Юрьевич', birth: '1964-11-02',
		joinedAgo: 410, deviceId: 2,
		additional: 'Тяжело переносит высокое давление, обсуждали снижение верхней границы.',
		nights: toOffsets(s10Poor, 3, 5),
	},
	{
		id: 103, privateId: 'demo-gushchina', email: 'e.gushchina@example.ru', phone: '+79117730458',
		lastName: 'Гущина', firstName: 'Елена', patronymic: 'Сергеевна', birth: '1979-06-27',
		joinedAgo: 120, deviceId: 3, additional: '',
		nights: toOffsets(s11, 1),
	},
	{
		id: 104, privateId: 'demo-fadeeva', email: 'r.fadeeva@example.ru', phone: '+79263381094',
		lastName: 'Фадеева', firstName: 'Раиса', patronymic: 'Ивановна', birth: '1966-09-18',
		joinedAgo: 260, deviceId: 4,
		additional: 'Прибор не даёт разбивки по типам апноэ — учитывать при оценке.',
		nights: toOffsets(airCurve, 2),
	},
	{
		id: 105, privateId: 'demo-lazarev', email: 'd.lazarev@example.ru', phone: '+79690142287',
		lastName: 'Лазарев', firstName: 'Дмитрий', patronymic: 'Олегович', birth: '1983-04-30',
		joinedAgo: 300, deviceId: 5,
		additional: 'Не выходил на связь с прошлого приёма.',
		nights: toOffsets(resVent, 38),
	},
	{
		id: 106, privateId: 'demo-timofeev', email: 'v.timofeev@example.ru', phone: '+79031157426',
		lastName: 'Тимофеев', firstName: 'Валерий', patronymic: 'Львович', birth: '1958-01-09',
		joinedAgo: 45, deviceId: 6,
		additional: 'Прибор получен, обучение проведено. Данных ещё не присылал.',
		nights: [],
	},
];

const target = path.join(path.dirname(new URL(import.meta.url).pathname.slice(1)), 'data.json');
fs.writeFileSync(target, JSON.stringify({ patients }), 'utf8');

for (const patient of patients) {
	const inMonth = patient.nights.filter((n) => n.offset >= 1 && n.offset <= 30);
	const good = inMonth.filter((n) => n.data.duration >= 240).length;
	console.log(
		`${patient.lastName}: ночей ${patient.nights.length}, ` +
			`в окне 30 дней ${inMonth.length}, приверженность ${Math.round((good / 30) * 100)}%`,
	);
}
console.log(`\nЗаписано в ${target}`);
