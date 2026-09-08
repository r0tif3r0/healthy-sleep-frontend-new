import type { SVGProps } from 'react';
import logoUrl from '@/assets/logo.svg';

/**
 * Собственный набор вместо react-icons: один стиль обводки 1.9 и currentColor,
 * поэтому иконки одинаково читаются и на ночном сайдбаре, и на светлой карточке.
 */

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Icon({ size = 19, children, ...rest }: IconProps) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={1.9}
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			focusable="false"
			{...rest}
		>
			{children}
		</svg>
	);
}

export const ChartIcon = (p: IconProps) => (
	<Icon {...p}>
		<path d="M4 19V11M10 19V5M16 19v-6M22 19H2" />
	</Icon>
);

export const UploadIcon = (p: IconProps) => (
	<Icon {...p}>
		<path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M4 16v2.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V16" />
	</Icon>
);

export const UserIcon = (p: IconProps) => (
	<Icon {...p}>
		<circle cx="12" cy="8" r="3.6" />
		<path d="M4.5 20c1.2-3.7 4-5.6 7.5-5.6s6.3 1.9 7.5 5.6" />
	</Icon>
);

export const UsersIcon = (p: IconProps) => (
	<Icon {...p}>
		<circle cx="9" cy="8" r="3.4" />
		<path d="M2.5 20c1-3.4 3.5-5.2 6.5-5.2s5.5 1.8 6.5 5.2M16.5 5.2a3.4 3.4 0 0 1 0 6.6M18 14.9c2.1.6 3.2 2.4 3.5 5.1" />
	</Icon>
);

export const DocIcon = (p: IconProps) => (
	<Icon {...p}>
		<path d="M6 3h8l4 4v14H6z" />
		<path d="M14 3v4h4M9 12h6M9 16h4" />
	</Icon>
);

export const LogoutIcon = (p: IconProps) => (
	<Icon {...p}>
		<path d="M15 12H4m0 0 3.5-3.5M4 12l3.5 3.5M11 5V4a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1v-1" />
	</Icon>
);

export const CalendarIcon = (p: IconProps) => (
	<Icon {...p}>
		<rect x="3.5" y="5" width="17" height="16" rx="2.5" />
		<path d="M3.5 10h17M8 3v4M16 3v4" />
	</Icon>
);

export const SearchIcon = (p: IconProps) => (
	<Icon {...p} strokeWidth={2}>
		<circle cx="11" cy="11" r="6.5" />
		<path d="m16 16 4 4" />
	</Icon>
);

export const PlusIcon = (p: IconProps) => (
	<Icon {...p} strokeWidth={2.3}>
		<path d="M12 5v14M5 12h14" />
	</Icon>
);

export const ChevronLeftIcon = (p: IconProps) => (
	<Icon {...p} strokeWidth={2.2}>
		<path d="M14.5 5 8 12l6.5 7" />
	</Icon>
);

export const ChevronRightIcon = (p: IconProps) => (
	<Icon {...p} strokeWidth={2.2}>
		<path d="M9.5 5 16 12l-6.5 7" />
	</Icon>
);

export const ChevronDownIcon = (p: IconProps) => (
	<Icon {...p} strokeWidth={2.2}>
		<path d="m5 9 7 7 7-7" />
	</Icon>
);

export const CheckIcon = (p: IconProps) => (
	<Icon {...p} strokeWidth={2.2}>
		<path d="m5 12.5 4.4 4.4L19 7.5" />
	</Icon>
);

export const CheckCircleIcon = (p: IconProps) => (
	<Icon {...p} strokeWidth={2.2}>
		<circle cx="12" cy="12" r="9" />
		<path d="m8.4 12.2 2.4 2.4 4.8-5" />
	</Icon>
);

export const InfoIcon = (p: IconProps) => (
	<Icon {...p} strokeWidth={2}>
		<circle cx="12" cy="12" r="9" />
		<path d="M12 11v5.5M12 7.6v.1" />
	</Icon>
);

export const WarningIcon = (p: IconProps) => (
	<Icon {...p}>
		<path d="M12 4.5 21 19.5H3L12 4.5Z" />
		<path d="M12 10.5v4M12 17.4v.1" />
	</Icon>
);

export const ClockIcon = (p: IconProps) => (
	<Icon {...p}>
		<circle cx="12" cy="12" r="8.5" />
		<path d="M12 7.5V12l3 2" />
	</Icon>
);

export const DeviceIcon = (p: IconProps) => (
	<Icon {...p}>
		<rect x="2.5" y="7" width="19" height="11" rx="2.5" />
		<circle cx="17" cy="12.5" r="2.2" />
		<path d="M6 11.5h5" />
	</Icon>
);

export const EyeIcon = (p: IconProps) => (
	<Icon {...p}>
		<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
		<circle cx="12" cy="12" r="3" />
	</Icon>
);

export const EyeOffIcon = (p: IconProps) => (
	<Icon {...p}>
		<path d="M4 4l16 16M9.9 5.9A9.7 9.7 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-3.3 4.1M6.6 7.9A17 17 0 0 0 2.5 12S6 18.5 12 18.5c1 0 2-.2 2.9-.5" />
		<path d="M9.9 10a3 3 0 0 0 4.2 4.2" />
	</Icon>
);

export const DownloadIcon = (p: IconProps) => (
	<Icon {...p} strokeWidth={2}>
		<path d="M12 4v11m0 0-4-4m4 4 4-4M5 18.5h14" />
	</Icon>
);

export const CopyIcon = (p: IconProps) => (
	<Icon {...p}>
		<rect x="8" y="8" width="12" height="12" rx="2.5" />
		<path d="M16 8V5.5A1.5 1.5 0 0 0 14.5 4h-9A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H8" />
	</Icon>
);

export const ShieldIcon = (p: IconProps) => (
	<Icon {...p}>
		<path d="M12 3 4 6.2v5.4c0 4.6 3.2 8.4 8 9.4 4.8-1 8-4.8 8-9.4V6.2L12 3Z" />
		<path d="m9 12 2.2 2.2L15.5 10" />
	</Icon>
);

export const CloseIcon = (p: IconProps) => (
	<Icon {...p} strokeWidth={2.2}>
		<path d="M6 6l12 12M18 6 6 18" />
	</Icon>
);

export const SunIcon = (p: IconProps) => (
	<Icon {...p}>
		<circle cx="12" cy="12" r="4" />
		<path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4" />
	</Icon>
);

export const MoonIcon = (p: IconProps) => (
	<Icon {...p}>
		<path d="M20 14.2A8.5 8.5 0 0 1 9.8 4 8.5 8.5 0 1 0 20 14.2Z" />
	</Icon>
);

export const RefreshIcon = (p: IconProps) => (
	<Icon {...p}>
		<path d="M20 12a8 8 0 1 1-2.6-5.9M20 4v4h-4" />
	</Icon>
);

export const LinkIcon = (p: IconProps) => (
	<Icon {...p}>
		<path d="M10.5 13.5a4 4 0 0 0 5.7 0l2.6-2.6a4 4 0 0 0-5.7-5.7l-1.3 1.3" />
		<path d="M13.5 10.5a4 4 0 0 0-5.7 0l-2.6 2.6a4 4 0 0 0 5.7 5.7l1.3-1.3" />
	</Icon>
);

/**
 * Знак «Здорового сна» — исходный файл src/assets/logo.svg.
 *
 * Тёмно-синий полумесяц почти сливается с ночным фоном, поэтому на тёмных
 * поверхностях знак ставится на светлую плашку (см. вызовы), а сам файл
 * не перекрашивается.
 */
export function LogoMark({ size = 27, className }: { size?: number; className?: string }) {
	return <img src={logoUrl} width={size} height={size} alt="" aria-hidden="true" className={className} />;
}
