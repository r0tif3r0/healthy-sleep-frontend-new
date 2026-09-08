import { Card, NightSky } from '@/shared/ui';

/**
 * Приверженность нигде не объяснялась, и пациент видел падающее число,
 * ведя себя одинаково: оно зависит от длины выбранного периода.
 */
export function AdherenceNote() {
	return (
		<Card tone="night" className="relative overflow-hidden">
			<NightSky seed={12} className="pointer-events-none absolute inset-0 h-full w-full opacity-70" />

			<div className="relative flex flex-col gap-2.5">
				<h3 className="font-display text-[14.5px] font-bold text-white">Как считается приверженность</h3>
				<p className="text-[12.5px] leading-relaxed text-[#A8BCDC]">
					Это доля ночей выбранного периода, в которые прибор проработал{' '}
					<b className="text-[#E6EEFB]">не меньше четырёх часов</b>. Чем длиннее период без терапии, тем ниже
					число — поэтому сравнивайте только одинаковые по длине периоды.
				</p>
			</div>
		</Card>
	);
}
