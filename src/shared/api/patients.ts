import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import { queryKeys } from './queryKeys';
import type { Paginated, Patient, PatientStatistic, PatientsParams } from './types';

/**
 * Поиск, сортировка и пагинация делаются сервером. Прежний фронтенд сортировал
 * уже загруженные страницы, и на втором листе порядок переставал быть верным.
 */
export const usePatients = (params: PatientsParams) =>
	useQuery({
		queryKey: queryKeys.patients(params),
		queryFn: async (): Promise<Paginated<Patient>> => {
			const { data } = await apiClient.get<Paginated<Patient>>('/patients/', { params });
			return data;
		},
		placeholderData: (previous) => previous,
	});

export const usePatientStatistic = (privateId: string) =>
	useQuery({
		queryKey: queryKeys.patient(privateId),
		queryFn: async (): Promise<PatientStatistic> => {
			const { data } = await apiClient.get<PatientStatistic>(`/get_patient_statistic/${privateId}/`);
			return data;
		},
		enabled: Boolean(privateId),
	});

export const useLinkPatient = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (email: string) => {
			const { data } = await apiClient.post('/patients/link_patient/', { email });
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['patients'] });
		},
	});
};

export const useUnlinkPatient = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: number) => {
			const { data } = await apiClient.post(`/patients/${id}/unlink_patient/`);
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['patients'] });
		},
	});
};
