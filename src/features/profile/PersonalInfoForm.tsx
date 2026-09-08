import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { fieldErrors, toMessage } from '@/shared/api/errors';
import { useDevices } from '@/shared/api/devices';
import { useUpdateProfile } from '@/shared/api/profile';
import type { Profile } from '@/shared/api/types';
import { maskPhone, toApiPhone } from '@/features/auth/phone';
import {
	additionalSchema,
	birthDateSchema,
	emailSchema,
	nameSchema,
	requiredName,
	phoneSchema,
} from '@/features/auth/schemas';
import { Button, Card, CardHeader, Field, Input, Select, Textarea, useToast } from '@/shared/ui';

const schema = z.object({
	last_name: requiredName('Укажите фамилию'),
	first_name: requiredName('Укажите имя'),
	patronymic: nameSchema.optional().or(z.literal('')),
	date_birth: birthDateSchema.optional().or(z.literal('')),
	additional: additionalSchema.optional().or(z.literal('')),
	email: emailSchema,
	phone_number: phoneSchema.optional().or(z.literal('')),
	device: z.string(),
});

type Values = z.infer<typeof schema>;

const NO_DEVICE = 'none';

export function PersonalInfoForm({ profile }: { profile: Profile }) {
	const devices = useDevices();
	const update = useUpdateProfile();
	const toast = useToast();

	const {
		register,
		control,
		handleSubmit,
		reset,
		setError,
		formState: { errors, isSubmitting, isDirty },
	} = useForm<Values>({ resolver: zodResolver(schema), mode: 'onTouched' });

	useEffect(() => {
		reset({
			last_name: profile.last_name ?? '',
			first_name: profile.first_name ?? '',
			patronymic: profile.patronymic ?? '',
			date_birth: profile.date_birth ?? '',
			additional: profile.additional ?? '',
			email: profile.email ?? '',
			phone_number: profile.phone_number ?? '',
			device: profile.device ? String(profile.device.id) : NO_DEVICE,
		});
	}, [profile, reset]);

	const onSubmit = handleSubmit(async (values) => {
		try {
			await update.mutateAsync({
				last_name: values.last_name,
				first_name: values.first_name,
				patronymic: values.patronymic || '',
				date_birth: values.date_birth || null,
				additional: values.additional || '',
				email: values.email,
				phone_number: values.phone_number || '',
				device: values.device === NO_DEVICE ? null : Number(values.device),
			});
			toast.show({ title: 'Данные сохранены', tone: 'ok' });
		} catch (error) {
			for (const [attr, message] of Object.entries(fieldErrors(error))) {
				if (attr in values) setError(attr as keyof Values, { message });
			}
			toast.show({
				title: 'Не удалось сохранить',
				description: toMessage(error, 'Проверьте введённые данные.'),
				tone: 'bad',
			});
		}
	});

	return (
		<Card className="flex flex-col gap-5">
			<CardHeader title="Личная информация" />

			<form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2" noValidate>
				<Field label="Фамилия" required error={errors.last_name?.message}>
					<Input invalid={Boolean(errors.last_name)} {...register('last_name')} />
				</Field>
				<Field label="Имя" required error={errors.first_name?.message}>
					<Input invalid={Boolean(errors.first_name)} {...register('first_name')} />
				</Field>
				<Field label="Отчество" error={errors.patronymic?.message}>
					<Input invalid={Boolean(errors.patronymic)} {...register('patronymic')} />
				</Field>
				<Field label="Дата рождения" error={errors.date_birth?.message}>
					<Input type="date" invalid={Boolean(errors.date_birth)} {...register('date_birth')} />
				</Field>
				<Field label="Электронная почта" required error={errors.email?.message}>
					<Input type="email" invalid={Boolean(errors.email)} {...register('email')} />
				</Field>
				<Field label="Номер телефона" error={errors.phone_number?.message}>
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
					className="md:col-span-2"
					label="Ваш СИПАП-аппарат"
					hint="От модели зависит, как разбирается архив с карты"
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

				<Field className="md:col-span-2" label="Дополнительно" error={errors.additional?.message}>
					<Textarea rows={3} maxLength={250} invalid={Boolean(errors.additional)} {...register('additional')} />
				</Field>

				<div className="md:col-span-2">
					<Button type="submit" variant="primary" loading={isSubmitting} disabled={!isDirty}>
						Сохранить изменения
					</Button>
				</div>
			</form>
		</Card>
	);
}
