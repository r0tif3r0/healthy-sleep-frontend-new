import type { ReactNode } from 'react';
import { ChartIcon, DocIcon, ShieldIcon, UploadIcon, UserIcon, UsersIcon } from '@/shared/icons';
import type { Role } from '@/shared/api/types';

export interface NavItem {
	to: string;
	label: string;
	/** Подпись для нижнего меню: полная не помещается в колонку шириной с палец. */
	short?: string;
	icon: ReactNode;
}

const PATIENT: NavItem[] = [
	{ to: '/app/stats', label: 'Статистика', icon: <ChartIcon /> },
	{ to: '/app/upload', label: 'Загрузка данных', short: 'Загрузка', icon: <UploadIcon /> },
	{ to: '/app/profile', label: 'Личный кабинет', short: 'Кабинет', icon: <UserIcon /> },
	{ to: '/app/info', label: 'Правовая информация', short: 'Документы', icon: <DocIcon /> },
];

const DOCTOR: NavItem[] = [
	{ to: '/app/patients', label: 'Мои пациенты', short: 'Пациенты', icon: <UsersIcon /> },
	{ to: '/app/profile', label: 'Личный кабинет', short: 'Кабинет', icon: <UserIcon /> },
	{ to: '/app/info', label: 'Правовая информация', short: 'Документы', icon: <DocIcon /> },
];

const ADMIN: NavItem[] = [
	{ to: '/app/admin', label: 'Управление', icon: <ShieldIcon /> },
	{ to: '/app/info', label: 'Правовая информация', short: 'Документы', icon: <DocIcon /> },
];

export function navItemsFor(role: Role | null): NavItem[] {
	if (role === 'doctor') return DOCTOR;
	if (role === 'admin') return ADMIN;
	return PATIENT;
}

export function roleLabel(role: Role | null): string {
	if (role === 'doctor') return 'Врач';
	if (role === 'admin') return 'Администратор';
	return 'Пациент';
}

export function shellSubtitle(role: Role | null): string {
	if (role === 'doctor') return 'Кабинет врача';
	if (role === 'admin') return 'Панель управления';
	return 'Мониторинг СИПАП';
}
