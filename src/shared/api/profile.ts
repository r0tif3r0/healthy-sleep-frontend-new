import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import { queryKeys } from './queryKeys';
import type { Profile } from './types';

export interface UpdateProfilePayload {
	email?: string;
	phone_number?: string;
	first_name?: string;
	last_name?: string;
	patronymic?: string;
	additional?: string;
	date_birth?: string | null;
	device?: number | null;
}

export const fetchProfile = async (): Promise<Profile> => {
	const { data } = await apiClient.get<Profile>('/profile/');
	return data;
};

export const useProfile = (enabled = true) =>
	useQuery({
		queryKey: queryKeys.profile(),
		queryFn: fetchProfile,
		enabled,
		staleTime: 60_000,
	});

export const useUpdateProfile = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (payload: UpdateProfilePayload) => {
			const { data } = await apiClient.patch<Profile>('/profile/update/', payload);
			return data;
		},
		onSuccess: (profile) => {
			queryClient.setQueryData(queryKeys.profile(), profile);
		},
	});
};

export const useChangePassword = () =>
	useMutation({
		mutationFn: async (payload: { old_password: string; new_password: string }) => {
			const { data } = await apiClient.patch('/profile/change_password/', payload);
			return data;
		},
	});

export const useUnlinkDoctor = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async () => {
			const { data } = await apiClient.post<Profile>('/profile/unlink_doctor/');
			return data;
		},
		onSuccess: (profile) => {
			queryClient.setQueryData(queryKeys.profile(), profile);
		},
	});
};

/**
 * Перевыпуск приватного идентификатора. Точка входа в бэкенде есть,
 * но прежний фронтенд ею не пользовался — а она нужна, если ссылка утекла.
 */
export const useRegeneratePrivateId = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async () => {
			const { data } = await apiClient.post<Profile>('/profile/update_private_id/');
			return data;
		},
		onSuccess: (profile) => {
			queryClient.setQueryData(queryKeys.profile(), profile);
		},
	});
};
