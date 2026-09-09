import { useAuth } from '@/app/providers/useAuth';
import { useTheme } from '@/app/providers/useTheme';
import { LogoMark, LogoutIcon, MoonIcon, SunIcon } from '@/shared/icons';
import { shellSubtitle } from './navItems';

/**
 * Верх оболочки на узком экране. В нижнее меню влезают только разделы,
 * а тема и выход должны остаться доступны: у администратора в меню нет
 * «Личного кабинета», и спрятанный туда выход стал бы недостижим.
 */
export function MobileTopBar({ onLogout }: { onLogout: () => void }) {
	const { role } = useAuth();
	const { theme, toggle } = useTheme();

	return (
		<header className="sticky top-0 z-30 flex flex-none items-center gap-3 border-b border-white/10 bg-night-900 px-4 py-2.5 lg:hidden">
			<span className="flex h-9 w-9 flex-none items-center justify-center rounded-[11px] bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,.5)]">
				<LogoMark size={25} />
			</span>

			<span className="flex min-w-0 flex-col gap-px">
				<span className="font-display text-[14.5px] leading-tight font-bold text-white">Здоровый сон</span>
				<span className="truncate text-[9.5px] leading-tight font-semibold tracking-[0.09em] text-[#7C93BC] uppercase">
					{shellSubtitle(role)}
				</span>
			</span>

			<div className="ml-auto flex flex-none items-center gap-1">
				<button
					type="button"
					onClick={toggle}
					aria-label={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
					className="flex h-10 w-10 items-center justify-center rounded-xl text-[#8FA4C6] transition-colors hover:bg-white/[0.08] hover:text-white"
				>
					{theme === 'dark' ? <SunIcon size={19} /> : <MoonIcon size={19} />}
				</button>
				<button
					type="button"
					onClick={onLogout}
					aria-label="Выйти из аккаунта"
					className="flex h-10 w-10 items-center justify-center rounded-xl text-[#6E8AB4] transition-colors hover:bg-white/[0.08] hover:text-white"
				>
					<LogoutIcon size={19} />
				</button>
			</div>
		</header>
	);
}
