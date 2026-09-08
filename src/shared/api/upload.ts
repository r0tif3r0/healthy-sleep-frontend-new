import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import type { UploadResult } from './types';

export interface UploadPayload {
	blob: Blob;
	folderName: string;
}

/**
 * Единственный путь без завершающего слэша — так он объявлен в parsers/urls.py.
 * Поле формы должно называться `data`, иначе сериализатор его не увидит.
 */
export const useUploadCpapData = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ blob, folderName }: UploadPayload): Promise<UploadResult> => {
			const form = new FormData();
			form.append('data', new File([blob], `${folderName}.zip`, { type: 'application/zip' }));

			const { data } = await apiClient.post<UploadResult>('/cpap_data/upload', form, {
				headers: { 'Content-Type': 'multipart/form-data', Accept: 'application/json' },
			});
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['availableDates'] });
			queryClient.invalidateQueries({ queryKey: ['cpapStats'] });
			queryClient.invalidateQueries({ queryKey: ['profile'] });
		},
	});
};
