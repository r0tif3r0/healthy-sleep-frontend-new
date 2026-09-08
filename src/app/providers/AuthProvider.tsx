import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { onUnauthorized } from '@/shared/api/client';
import { fetchProfile, useProfile } from '@/shared/api/profile';
import { queryKeys } from '@/shared/api/queryKeys';
import { tokens } from '@/shared/api/tokens';
import { AuthContext, type AuthState } from './authContext';

/**
 * Роль пользователя приходит из /profile/, а не лежит рядом с токеном в браузере.
 * Прежний фронтенд решал по cookie, что показывать, — а её правит кто угодно.
 * Цена ответа сервера — один запрос при загрузке.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
	const queryClient = useQueryClient();
	const [hasToken, setHasToken] = useState(() => Boolean(tokens.getAccess()));

	const profileQuery = useProfile(hasToken);

	const signOut = useCallback(() => {
		tokens.clear();
		setHasToken(false);
		queryClient.removeQueries();
	}, [queryClient]);

	const signIn = useCallback<AuthState['signIn']>(
		async ({ access, refresh }) => {
			tokens.set({ access, refresh });
			setHasToken(true);

			const profile = await fetchProfile();
			queryClient.setQueryData(queryKeys.profile(), profile);
			return profile;
		},
		[queryClient],
	);

	// Обновление токена не удалось — сессия кончилась.
	useEffect(() => {
		onUnauthorized(signOut);
		return () => onUnauthorized(null);
	}, [signOut]);

	// Профиль не отдался под живым токеном: дальше показывать кабинет нечестно.
	useEffect(() => {
		if (hasToken && profileQuery.isError) signOut();
	}, [hasToken, profileQuery.isError, signOut]);

	const value = useMemo<AuthState>(() => {
		const profile = hasToken ? (profileQuery.data ?? null) : null;

		return {
			profile,
			role: profile?.role ?? null,
			isAuthenticated: Boolean(profile),
			isLoading: hasToken && profileQuery.isPending,
			signIn,
			signOut,
		};
	}, [hasToken, profileQuery.data, profileQuery.isPending, signIn, signOut]);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
