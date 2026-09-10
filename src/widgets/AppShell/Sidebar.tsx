import { NavLink } from 'react-router-dom';
import { useAuth } from '@/app/providers/useAuth';
import { useTheme } from '@/app/providers/useTheme';
import { LogoMark, LogoutIcon, MoonIcon, SunIcon } from '@/shared/icons';
import { cn } from '@/shared/lib/cn';
import { fullName, initials } from '@/shared/lib/format';
import { NightSky } from '@/shared/ui';
import { navItemsFor, roleLabel, shellSubtitle } from './navItems';

export function Sidebar({ onLogout }: { onLogout: () => void }) {
	const { profile, role } = useAuth();
	const { theme, toggle } = useTheme();
	const items = navItemsFor(role);

	return (
		/*
		 * Панель ровно в экран и закреплена: раньше она тянулась во всю длину
		 * страницы, поэтому на статистике за 90 дней небо растягивалось иначе,
		 * чем за неделю. Заодно меню не уезжает вверх на длинных страницах.
		 */
		<aside className="sticky top-0 hidden h-screen w-[248px] flex-none flex-col overflow-hidden bg-night-900 lg:flex">
			{/*
			 * Небо на всю высоту панели, а не одно созвездие под меню: тогда фон пункта
			 * при наведении не «отрезает» кусок рисунка — перекрывать нечего.
			 */}
			<NightSky seed={3} className="pointer-events-none absolute inset-0 h-full w-full opacity-70" />

			{/* Тёплое свечение у нижнего края — как лампа у кровати на иллюстрациях. */}
			<div
				className="pointer-events-none absolute inset-x-0 bottom-0 h-64"
				style={{
					background:
						'radial-gradient(120% 100% at 50% 100%, rgba(245,146,30,.10) 0%, rgba(245,146,30,0) 70%)',
				}}
			/>

			<div className="relative flex h-full flex-col gap-7 p-[26px_16px]">
				<div className="flex items-center gap-3 px-1.5">
					<span className="flex h-11 w-11 flex-none items-center justify-center rounded-[14px] bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,.5)]">
						<LogoMark size={31} />
					</span>
					<span className="flex min-w-0 flex-col gap-[3px]">
						<span className="font-display text-base font-bold text-white">СИПАП-ЦЕНТР</span>
						<span className="truncate text-[10px] font-semibold tracking-[0.09em] text-[#7C93BC] uppercase">
							{shellSubtitle(role)}
						</span>
					</span>
				</div>

				<nav className="flex flex-col gap-1">
					{items.map((item) => (
						<NavLink
							key={item.to}
							to={item.to}
							className={({ isActive }) =>
								cn(
									'relative flex items-center gap-3 rounded-control px-3.5 py-[11px] text-sm transition-colors',
									// Полупрозрачные состояния: небо просвечивает сквозь пункт,
									// вместо того чтобы исчезать под непрозрачной плашкой.
									isActive
										? 'bg-white/10 font-semibold text-white'
										: 'text-[#A8BCDC] hover:bg-white/[0.06] hover:text-white',
								)
							}
						>
							{({ isActive }) => (
								<>
									{isActive && (
										<span className="absolute top-1/2 left-0 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-data-400" />
									)}
									<span className={isActive ? 'text-data-400' : 'text-[#8FA4C6]'}>{item.icon}</span>
									{item.label}
								</>
							)}
						</NavLink>
					))}
				</nav>

				<div className="mt-auto flex flex-col gap-4">
					<button
						type="button"
						onClick={toggle}
						className="flex items-center gap-3 rounded-control px-3.5 py-[11px] text-sm text-[#A8BCDC] transition-colors hover:bg-white/[0.06] hover:text-white"
					>
						<span className="text-[#8FA4C6]">
							{theme === 'dark' ? <SunIcon size={19} /> : <MoonIcon size={19} />}
						</span>
						{theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
					</button>

					<div className="h-px bg-white/10" />

					<div className="flex items-center gap-3 px-1.5 pb-1">
						<span className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-[12px] bg-accent-500 font-display text-[13px] font-bold text-[#3A1E02]">
							{initials(profile)}
						</span>
						<span className="flex min-w-0 flex-col gap-0.5">
							<span className="truncate text-[13px] font-semibold text-[#E6EEFB]">
								{profile ? fullName({ last_name: profile.last_name, first_name: profile.first_name }) : ''}
							</span>
							<span className="text-[11px] text-[#7C93BC]">{roleLabel(role)}</span>
						</span>
						<button
							type="button"
							onClick={onLogout}
							aria-label="Выйти из аккаунта"
							className="ml-auto flex h-8 w-8 flex-none items-center justify-center rounded-lg text-[#6E8AB4] transition-colors hover:bg-white/[0.08] hover:text-white"
						>
							<LogoutIcon size={18} />
						</button>
					</div>
				</div>
			</div>
		</aside>
	);
}
