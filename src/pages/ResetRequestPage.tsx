import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useResetPasswordRequest } from '@/shared/api/auth';
import { toMessage } from '@/shared/api/errors';
import { AuthLayout } from '@/features/auth/AuthLayout';
import { resetRequestSchema } from '@/features/auth/schemas';
import { CheckCircleIcon, ChevronLeftIcon } from '@/shared/icons';
import { Button, Field, Input } from '@/shared/ui';

type Values = { email: string };

export default function ResetRequestPage() {
	const [sentTo, setSentTo] = useState<string | null>(null);
	const request = useResetPasswordRequest();

	const {
		register,
		handleSubmit,
		setError,
		formState: { errors, isSubmitting },
	} = useForm<Values>({ resolver: zodResolver(resetRequestSchema), mode: 'onTouched' });

	const onSubmit = handleSubmit(async (values) => {
		try {
			await request.mutateAsync(values);
			setSentTo(values.email);
		} catch (error) {
			// Прежде кнопка уходила в бесконечную загрузку и молчала (находка Н-6).
			setError('email', {
				message: toMessage(error, 'Не удалось отправить письмо. Попробуйте позже или обратитесь в центр.'),
			});
		}
	});

	return (
		<AuthLayout>
			<Link to="/auth" className="inline-flex w-fit items-center gap-2 text-[13.5px] text-brand-600 hover:underline">
				<ChevronLeftIcon size={16} />
				К входу
			</Link>

			{sentTo ? (
				<div className="flex flex-col gap-4">
					<CheckCircleIcon size={32} className="text-ok" />
					<h1 className="font-display text-2xl font-bold">Письмо отправлено</h1>
					<p className="text-sm leading-relaxed text-ink-2">
						Ссылка для смены пароля ушла на <span className="font-semibold text-ink">{sentTo}</span>. Она
						одноразовая — если письма нет, проверьте папку со спамом.
					</p>
					<Button variant="secondary" size="lg" block onClick={() => setSentTo(null)}>
						Отправить ещё раз
					</Button>
				</div>
			) : (
				<form onSubmit={onSubmit} className="flex flex-col gap-6" noValidate>
					<div className="flex flex-col gap-2">
						<h1 className="font-display text-2xl font-bold">Восстановление пароля</h1>
						<p className="text-sm text-ink-2">
							Укажите почту, на которую оформлено наблюдение. Пришлём ссылку для смены пароля.
						</p>
					</div>

					<Field label="Электронная почта" error={errors.email?.message}>
						<Input
							type="email"
							autoComplete="email"
							placeholder="anna.smirnova@mail.ru"
							invalid={Boolean(errors.email)}
							{...register('email')}
						/>
					</Field>

					<Button type="submit" variant="primary" size="lg" block loading={isSubmitting}>
						Отправить ссылку
					</Button>
				</form>
			)}
		</AuthLayout>
	);
}
