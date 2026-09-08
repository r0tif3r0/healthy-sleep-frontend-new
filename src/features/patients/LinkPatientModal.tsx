import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toMessage } from '@/shared/api/errors';
import { useLinkPatient } from '@/shared/api/patients';
import { emailSchema } from '@/features/auth/schemas';
import { Button, Field, Input, Modal, useToast } from '@/shared/ui';

const schema = z.object({ email: emailSchema });
type Values = z.infer<typeof schema>;

export function LinkPatientModal({ open, onClose }: { open: boolean; onClose: () => void }) {
	const link = useLinkPatient();
	const toast = useToast();

	const {
		register,
		handleSubmit,
		reset,
		setError,
		formState: { errors, isSubmitting },
	} = useForm<Values>({ resolver: zodResolver(schema), mode: 'onTouched', defaultValues: { email: '' } });

	// Закрыли окно — очищаем поле и ошибку: иначе при следующем открытии
	// внутри лежит прежняя почта и прежнее сообщение об ошибке.
	const close = () => {
		reset({ email: '' });
		onClose();
	};

	const onSubmit = handleSubmit(async (values) => {
		try {
			await link.mutateAsync(values.email);
			toast.show({ title: 'Пациент прикреплён', tone: 'ok' });
			close();
		} catch (error) {
			setError('email', {
				message: toMessage(error, 'Не удалось прикрепить пациента с этой почтой.'),
			});
		}
	});

	return (
		<Modal
			open={open}
			onClose={close}
			title="Прикрепить пациента"
			description="Укажите почту, с которой пациент зарегистрировался в сервисе."
			footer={
				<>
					<Button variant="secondary" onClick={close}>
						Отмена
					</Button>
					<Button variant="primary" form="link-patient" type="submit" loading={isSubmitting}>
						Прикрепить
					</Button>
				</>
			}
		>
			<form id="link-patient" onSubmit={onSubmit} noValidate>
				<Field label="Электронная почта пациента" error={errors.email?.message}>
					<Input
						type="email"
						autoFocus
						placeholder="anna.smirnova@mail.ru"
						invalid={Boolean(errors.email)}
						{...register('email')}
					/>
				</Field>
			</form>
		</Modal>
	);
}
