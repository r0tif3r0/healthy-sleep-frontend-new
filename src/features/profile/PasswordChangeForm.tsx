import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { statusOf, toMessage } from '@/shared/api/errors';
import { useChangePassword } from '@/shared/api/profile';
import { PasswordRules } from '@/features/auth/PasswordRules';
import { changePasswordSchema, type ChangePasswordValues } from '@/features/auth/schemas';
import { Button, Card, CardHeader, Field, PasswordInput, useToast } from '@/shared/ui';

export function PasswordChangeForm() {
	const change = useChangePassword();
	const toast = useToast();

	const {
		register,
		handleSubmit,
		reset,
		watch,
		setError,
		formState: { errors, isSubmitting },
	} = useForm<ChangePasswordValues>({ resolver: zodResolver(changePasswordSchema), mode: 'onTouched' });

	const onSubmit = handleSubmit(async (values) => {
		try {
			await change.mutateAsync({ old_password: values.old_password, new_password: values.new_password });
			reset({ old_password: '', new_password: '', confirmPassword: '' });
			toast.show({ title: 'Пароль изменён', tone: 'ok' });
		} catch (error) {
			// Ошибка старого пароля показывается у поля, а не общим уведомлением.
			if (statusOf(error) === 400) {
				setError('old_password', { message: toMessage(error, 'Неверный текущий пароль') });
			} else {
				toast.show({
					title: 'Не удалось изменить пароль',
					description: toMessage(error, 'Попробуйте позже.'),
					tone: 'bad',
				});
			}
		}
	});

	return (
		<Card className="flex flex-col gap-4">
			<CardHeader title="Изменение пароля" />

			<form onSubmit={onSubmit} className="flex flex-col gap-3.5" noValidate>
				<Field label="Текущий пароль" required error={errors.old_password?.message}>
					<PasswordInput
						autoComplete="current-password"
						invalid={Boolean(errors.old_password)}
						{...register('old_password')}
					/>
				</Field>
				<Field label="Новый пароль" required error={errors.new_password?.message}>
					<PasswordInput
						autoComplete="new-password"
						invalid={Boolean(errors.new_password)}
						{...register('new_password')}
					/>
				</Field>
				<Field label="Подтверждение пароля" required error={errors.confirmPassword?.message}>
					<PasswordInput
						autoComplete="new-password"
						invalid={Boolean(errors.confirmPassword)}
						{...register('confirmPassword')}
					/>
				</Field>

				<PasswordRules value={watch('new_password') ?? ''} />

				<Button type="submit" variant="primary" className="self-start" loading={isSubmitting}>
					Изменить пароль
				</Button>
			</form>
		</Card>
	);
}
