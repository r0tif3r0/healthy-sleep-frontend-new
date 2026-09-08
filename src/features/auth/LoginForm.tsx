import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/providers/useAuth';
import { useLogin } from '@/shared/api/auth';
import { toMessage } from '@/shared/api/errors';
import { Button, Field, Input, PasswordInput, useToast } from '@/shared/ui';
import { loginSchema, type LoginValues } from './schemas';

export function LoginForm() {
	const { signIn } = useAuth();
	const login = useLogin();
	const navigate = useNavigate();
	const toast = useToast();

	const {
		register,
		handleSubmit,
		setError,
		formState: { errors, isSubmitting },
	} = useForm<LoginValues>({ resolver: zodResolver(loginSchema), mode: 'onTouched' });

	const onSubmit = handleSubmit(async (values) => {
		try {
			const response = await login.mutateAsync(values);
			const profile = await signIn({ access: response.access, refresh: response.refresh });

			if (profile.role === 'doctor') navigate('/app/patients', { replace: true });
			else if (profile.role === 'admin') navigate('/app/admin', { replace: true });
			else navigate('/app/stats', { replace: true });
		} catch (error) {
			// Сервер не уточняет, что именно неверно, — и правильно делает.
			setError('password', { message: 'Неверная почта или пароль' });
			toast.show({
				title: 'Не удалось войти',
				description: toMessage(error, 'Проверьте почту и пароль.'),
				tone: 'bad',
			});
		}
	});

	return (
		<form onSubmit={onSubmit} className="flex flex-col gap-6" noValidate>
			<div className="flex flex-col gap-2">
				<h1 className="font-display text-2xl font-bold">С возвращением</h1>
				<p className="text-sm text-ink-2">Войдите, чтобы посмотреть статистику терапии.</p>
			</div>

			<div className="flex flex-col gap-3.5">
				<Field label="Электронная почта" error={errors.email?.message}>
					<Input
						type="email"
						autoComplete="email"
						placeholder="anna.smirnova@mail.ru"
						invalid={Boolean(errors.email)}
						{...register('email')}
					/>
				</Field>

				<Field label="Пароль" error={errors.password?.message}>
					<PasswordInput
						autoComplete="current-password"
						placeholder="Введите пароль"
						invalid={Boolean(errors.password)}
						{...register('password')}
					/>
				</Field>
			</div>

			<div className="flex flex-col gap-3.5">
				<Button type="submit" variant="primary" size="lg" block loading={isSubmitting}>
					Войти
				</Button>
				<p className="text-center text-[13.5px]">
					<Link to="/auth/reset" className="text-brand-600 hover:underline">
						Не помню пароль
					</Link>
				</p>
			</div>
		</form>
	);
}
