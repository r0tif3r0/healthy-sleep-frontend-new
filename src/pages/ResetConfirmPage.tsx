import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useResetPasswordConfirm } from '@/shared/api/auth';
import { toMessage } from '@/shared/api/errors';
import { AuthLayout } from '@/features/auth/AuthLayout';
import { PasswordRules } from '@/features/auth/PasswordRules';
import { resetConfirmSchema, type ResetConfirmValues } from '@/features/auth/schemas';
import { CheckCircleIcon, WarningIcon } from '@/shared/icons';
import { Button, Field, PasswordInput, useToast } from '@/shared/ui';

export default function ResetConfirmPage() {
	const [params] = useSearchParams();
	const token = params.get('token');
	const navigate = useNavigate();
	const toast = useToast();
	const confirm = useResetPasswordConfirm();
	const [done, setDone] = useState(false);

	const {
		register,
		handleSubmit,
		watch,
		setError,
		formState: { errors, isSubmitting },
	} = useForm<ResetConfirmValues>({ resolver: zodResolver(resetConfirmSchema), mode: 'onTouched' });

	const onSubmit = handleSubmit(async (values) => {
		if (!token) return;

		try {
			await confirm.mutateAsync({ token, password: values.password });
			setDone(true);
			toast.show({ title: 'Пароль изменён', tone: 'ok' });
		} catch (error) {
			setError('password', {
				message: toMessage(error, 'Ссылка недействительна или устарела. Запросите новую.'),
			});
		}
	});

	if (!token) {
		return (
			<AuthLayout>
				<div className="flex flex-col gap-4">
					<WarningIcon size={32} className="text-accent-500" />
					<h1 className="font-display text-2xl font-bold">Ссылка неполная</h1>
					<p className="text-sm leading-relaxed text-ink-2">
						В адресе нет одноразового кода. Откройте ссылку из письма целиком или запросите новую.
					</p>
					<Button variant="primary" size="lg" block onClick={() => navigate('/auth/reset')}>
						Запросить новую ссылку
					</Button>
				</div>
			</AuthLayout>
		);
	}

	if (done) {
		return (
			<AuthLayout>
				<div className="flex flex-col gap-4">
					<CheckCircleIcon size={32} className="text-ok" />
					<h1 className="font-display text-2xl font-bold">Пароль изменён</h1>
					<p className="text-sm text-ink-2">Войдите с новым паролем.</p>
					<Button variant="primary" size="lg" block onClick={() => navigate('/auth', { replace: true })}>
						Перейти ко входу
					</Button>
				</div>
			</AuthLayout>
		);
	}

	return (
		<AuthLayout>
			<form onSubmit={onSubmit} className="flex flex-col gap-6" noValidate>
				<div className="flex flex-col gap-2">
					<h1 className="font-display text-2xl font-bold">Новый пароль</h1>
					<p className="text-sm text-ink-2">Придумайте пароль, который не использовали раньше.</p>
				</div>

				<div className="flex flex-col gap-3.5">
					<Field label="Новый пароль" required error={errors.password?.message}>
						<PasswordInput autoComplete="new-password" invalid={Boolean(errors.password)} {...register('password')} />
					</Field>
					<Field label="Подтверждение пароля" required error={errors.confirmPassword?.message}>
						<PasswordInput
							autoComplete="new-password"
							invalid={Boolean(errors.confirmPassword)}
							{...register('confirmPassword')}
						/>
					</Field>
					<PasswordRules value={watch('password') ?? ''} />
				</div>

				<Button type="submit" variant="primary" size="lg" block loading={isSubmitting}>
					Изменить пароль
				</Button>

				<p className="text-center text-[13.5px]">
					<Link to="/auth" className="text-brand-600 hover:underline">
						Вернуться ко входу
					</Link>
				</p>
			</form>
		</AuthLayout>
	);
}
