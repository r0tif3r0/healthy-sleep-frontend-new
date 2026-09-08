import { createContext } from 'react';
import type { Profile, Role } from '@/shared/api/types';

export interface AuthState {
	profile: Profile | null;
	role: Role | null;
	isAuthenticated: boolean;
	/** Пока профиль не загружен, охрана маршрутов не должна никуда перебрасывать. */
	isLoading: boolean;
	signIn: (payload: { access: string; refresh: string }) => Promise<Profile>;
	signOut: () => void;
}

export const AuthContext = createContext<AuthState | null>(null);
