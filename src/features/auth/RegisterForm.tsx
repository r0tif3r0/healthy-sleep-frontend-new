import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/providers/useAuth';
import { useRegister } from '@/shared/api/auth';
import { fieldErrors, toMessage } from '@/shared/api/errors';
import { useDevices } from '@/shared/api/devices';
import { ChevronLeftIcon } from '@/shared/icons';
import { Button, Field, Input, PasswordInput, Select, Textarea, useToast } from '@/shared/ui';
import { PasswordRules } from './PasswordRules';
import { maskPhone, toApiPhone } from './phone';
import { registerSchema, type RegisterValues } from './schemas';

const STEP_FIELDS = [
	['last_name', 'first_name', 'patronymic', 'date_birth', 'additional'],
	['email', 'phone_number', 'device'],
	['password', 'confirmPassword'],
] as const satisfies ReadonlyArray<ReadonlyArray<keyof RegisterValues>>;

const NO_DEVICE = 'none';

export function RegisterForm() {
	const [step, setStep] = useState(0);
	const { signIn } = useAuth();
	const navigate = useNavigate();
	const toast = useToast();
	const registerUser = useRegister();
	const devices = useDevices();

	const form = useForm<RegisterValues>({
		resolver: zodResolver(registerSchema),
		mode: 'onTouched',
		defaultValues: {
			last_name: '',
			first_name: '',
			patronymic: '',
			date_birth: '',
			additional: '',
			email: '',
			phone_number: '',
			device: NO_DEVICE,
			password: '',
			confirmPassword: '',
		},
	});

	const {
		register,
		control,
		handleSubmit,
		trigger,
		setError,
		watch,
		formState: { errors, isSubmitting },
	} = form;

	const next = async () => {
		const valid = await trigger(STEP_FIELDS[step] as unknown as Array<keyof RegisterValues>);
		if (valid) setStep((current) => Math.min(current + 1, 2));
	};

	const onSubmit = handleSubmit(async (values) => {
		try {
			const response = await registerUser.mutateAsync({
				email: values.email,
				phone_number: values.phone_number,
				first_name: values.first_name,
				last_name: values.last_name,
				patronymic: values.patronymic || undefined,
				date_birth: values.date_birth || undefined,
				password: values.password,
				device: values.device === NO_DEVICE ? null : Number(values.device),
				additional: values.additional || undefined,
			});

			await signIn({ access: response.access, refresh: response.refresh });
			navigate('/app/stats', { replace: true });
		} catch (error) {
			// Ошибки полей показываем у полей, а не общим уведомлением.
			const byField = fieldErrors(error);
			for (const [attr, message] of Object.entries(byField)) {
				if (attr in values) setError(attr as keyof RegisterValues, { message });
			}

			toast.show({
				title: 'Не удалось зарегистрироваться',
				description: toMessage(error, 'Проверьте введённые данные.'),
				tone: 'bad',
			});
		}
	});

	return (
		<form onSubmit={onSubmit} className="flex flex-col gap-6" noValidate>
			<div className="flex items-center justify-between gap-4">
				<h1 className="font-display text-2xl font-bold">
					Шаг {step + 1} <span className="text-ink-4">/ 3</span>
				</h1>
				{step > 0 && (
					<Button size="sm" variant="ghost" icon={<ChevronLeftIcon size={15} />} onClick={() => setStep(step - 1)}>
						Назад
					</Button>
				)}
			</div>

			{step === 0 && (
				<div className="flex flex-col gap-3.5">
					<Field label="Фамилия" required error={errors.last_name?.message}>
						<Input placeholder="Смирнова" invalid={Boolean(errors.last_name)} {...register('last_name')} />
					</Field>
					<Field label="Имя" required error={errors.first_name?.message}>
						<Input placeholder="Анна" invalid={Boolean(errors.first_name)} {...register('first_name')} />
					</Field>
					<Field label="Отчество" error={errors.patronymic?.message}>
						<Input placeholder="Петровна" invalid={Boolean(errors.patronymic)} {...register('patronymic')} />
					</Field>
					<Field label="Дата рождения" error={errors.date_birth?.message}>
						<Input type="date" invalid={Boolean(errors.date_birth)} {...register('date_birth')} />
					</Field>
					<Field label="Дополнительно" hint="До 250 символов" error={errors.additional?.message}>
						<Textarea
							rows={3}
							maxLength={250}
							placeholder="Что важно знать врачу"
							invalid={Boolean(errors.additional)}
							{...register('additional')}
						/>
					</Field>
				</div>
			)}

			{step === 1 && (
				<div className="flex flex-col gap-3.5">
					<Field label="Электронная почта" required error={errors.email?.message}>
						<Input
							type="email"
							autoComplete="email"
							placeholder="anna.smirnova@mail.ru"
							invalid={Boolean(errors.email)}
							{...register('email')}
						/>
					</Field>

					<Field label="Номер телефона" required error={errors.phone_number?.message}>
						<Controller
							control={control}
							name="phone_number"
							render={({ field }) => (
								<Input
									type="tel"
									inputMode="tel"
									placeholder="+7 (___) ___-__-__"
									invalid={Boolean(errors.phone_number)}
									value={maskPhone(field.value ?? '')}
									onChange={(event) => field.onChange(toApiPhone(event.target.value))}
									onBlur={field.onBlur}
								/>
							)}
						/>
					</Field>

					<Field
						label="Ваш СИПАП-аппарат"
						hint="Модель можно указать позже в личном кабинете"
						error={errors.device?.message}
					>
						<Select invalid={Boolean(errors.device)} {...register('device')}>
							<option value={NO_DEVICE}>У меня нет аппарата</option>
							{devices.data?.map((device) => (
								<option key={device.id} value={String(device.id)}>
									{device.full_name}
								</option>
							))}
						</Select>
					</Field>
				</div>
			)}

			{step === 2 && (
				<div className="flex flex-col gap-3.5">
					<Field label="Пароль" required error={errors.password?.message}>
						<PasswordInput
							autoComplete="new-password"
							invalid={Boolean(errors.password)}
							{...register('password')}
						/>
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
			)}

			{step < 2 ? (
				<Button variant="primary" size="lg" block onClick={next}>
					Продолжить
				</Button>
			) : (
				<Button type="submit" variant="primary" size="lg" block loading={isSubmitting}>
					Зарегистрироваться
				</Button>
			)}
		</form>
	);
}
