import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { illustrations } from '@/assets/illustrations';
import { LogoMark } from '@/shared/icons';
import { DEVICE_COUNT, INDICATOR_COUNT } from '@/shared/lib/catalog';
import { Illustration } from '@/shared/ui';

/*
 * Числа берутся из общего перечня, а не пишутся строкой: пока они стояли здесь
 * и на лендинге по отдельности, показателей тут осталось 14, а там уже стало 17.
 */
const FACTS = [
	{ value: String(DEVICE_COUNT), label: 'моделей приборов' },
	{ value: '365', label: 'ночей в памяти' },
	{ value: String(INDICATOR_COUNT), label: 'показателей терапии' },
];

/** Ночная половина слева — та же иллюстрация, что и в макетах; форма справа. */
export function AuthLayout({ children }: { children: ReactNode }) {
	return (
		<div className="flex min-h-screen bg-canvas">
			<div className="relative hidden w-[600px] flex-none overflow-hidden bg-night-900 lg:block">
				<Illustration
					source={illustrations.authNight}
					alt="Пациент на СИПАП-терапии ночью"
					className="absolute inset-0 h-full w-full object-cover"
					style={{ objectPosition: 'center 22%' }}
					eager
				/>
				<div
					className="absolute inset-0"
					style={{
						background:
							'linear-gradient(180deg, rgba(8,18,43,.72) 0%, rgba(8,18,43,.18) 34%, rgba(8,18,43,.88) 100%)',
					}}
				/>

				<div className="relative flex h-full flex-col justify-between p-10">
					<Link to="/" className="flex items-center gap-3.5">
						<span className="flex h-[46px] w-[46px] flex-none items-center justify-center rounded-[15px] bg-white shadow-[0_4px_16px_-6px_rgba(0,0,0,.6)]">
							<LogoMark size={32} />
						</span>
						<span className="flex flex-col gap-[3px]">
							<span className="font-display text-lg font-bold text-white">СИПАП-ЦЕНТР</span>
							<span className="text-[10.5px] font-semibold tracking-[0.09em] text-[#93AEDA] uppercase">
								Мониторинг СИПАП-терапии
							</span>
						</span>
					</Link>

					<div className="flex max-w-[440px] flex-col gap-[18px]">
						<h2 className="font-display text-[33px] leading-tight font-bold text-balance text-white">
							Ваши ночи — уже данные. Осталось их прочитать.
						</h2>
						<p className="text-[15px] leading-relaxed text-[#B8CBE8]">
							Карта памяти из СИПАП-аппарата хранит до 365 ночей терапии. Загрузите её — и врач увидит
							динамику, а не воспоминания о самочувствии.
						</p>
						<div className="flex gap-6 pt-2">
							{FACTS.map((fact, index) => (
								<div key={fact.label} className="flex gap-6">
									{index > 0 && <span className="w-px bg-[#93AEDA]/30" />}
									<span className="flex flex-col gap-[3px]">
										<span className="tnum font-display text-2xl font-bold text-white">{fact.value}</span>
										<span className="text-xs text-[#8FA9CF]">{fact.label}</span>
									</span>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>

			<div className="flex flex-1 items-center justify-center p-6 sm:p-10">
				<div className="flex w-full max-w-[426px] flex-col gap-6">{children}</div>
			</div>
		</div>
	);
}
