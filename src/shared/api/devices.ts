import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { env } from '@/shared/config/env';
import { queryKeys } from './queryKeys';
import type { Device } from './types';

/** Справочник приборов открыт: он нужен на форме регистрации, до входа. */
export const useDevices = () =>
	useQuery({
		queryKey: queryKeys.devices(),
		queryFn: async (): Promise<Device[]> => {
			const { data } = await axios.get<Device[]>(`${env.apiBaseUrl}/devices/`);
			return data;
		},
		staleTime: 30 * 60_000,
	});
