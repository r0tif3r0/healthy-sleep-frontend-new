import { NavLink } from 'react-router-dom';
import { useAuth } from '@/app/providers/useAuth';
import { cn } from '@/shared/lib/cn';
import { navItemsFor } from './navItems';

/**
 * Меню узкого экрана. Боковая панель забирала бы под себя 248px из 360 —
 * ниже 1024px разделы переезжают вниз, под большой палец.
 *
 * Панель липкая, а не плавающая: так она занимает место в потоке и контент
 * страницы никогда не оказывается под ней.
 */
export function BottomNav() {
	const { role } = useAuth();
	const items = navItemsFor(role);

	return (
		<nav
			aria-label="Разделы кабинета"
			className="sticky bottom-0 z-30 flex flex-none border-t border-white/10 bg-night-900 pb-[env(safe-area-inset-bottom)] lg:hidden"
		>
			{items.map((item) => (
				<NavLink
					key={item.to}
					to={item.to}
					/*
					 * Подпись сокращена, но имя ссылки остаётся полным: «Кабинет»
					 * под иконкой и «Личный кабинет» для чтения с экрана.
					 */
					aria-label={item.label}
					className={({ isActive }) =>
						cn(
							'flex min-w-0 flex-1 flex-col items-center justify-center gap-[5px] px-1 py-2.5 text-[10.5px] transition-colors',
							isActive ? 'font-semibold text-white' : 'font-medium text-[#8FA4C6]',
						)
					}
				>
					{({ isActive }) => (
						<>
							<span className={isActive ? 'text-data-400' : 'text-[#8FA4C6]'}>{item.icon}</span>
							<span className="max-w-full truncate">{item.short ?? item.label}</span>
						</>
					)}
				</NavLink>
			))}
		</nav>
	);
}
