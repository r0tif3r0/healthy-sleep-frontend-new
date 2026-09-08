import { useState } from 'react';
import { toMessage } from '@/shared/api/errors';
import { useRegeneratePrivateId, useUnlinkDoctor } from '@/shared/api/profile';
import type { Profile } from '@/shared/api/types';
import { patientLink } from '@/shared/config/env';
import { CopyIcon, RefreshIcon } from '@/shared/icons';
import { fullName } from '@/shared/lib/format';
import { Button, Card, CardHeader, ConfirmModal, useToast } from '@/shared/ui';

/**
 * Показываемая и копируемая ссылка — одна и та же строка из одной переменной.
 * Прежде на экране был один адрес, а копировался другой, и оба вели на домен
 * прошлого подрядчика, зашитый прямо в коде.
 */
export function DoctorLinkCard({ profile }: { profile: Profile }) {
	const toast = useToast();
	const unlink = useUnlinkDoctor();
	const regenerate = useRegeneratePrivateId();
	const [unlinkOpen, setUnlinkOpen] = useState(false);
	const [regenerateOpen, setRegenerateOpen] = useState(false);

	const link = patientLink(profile.private_id);

	const copy = async () => {
		try {
			await navigator.clipboard.writeText(link);
			toast.show({ title: 'Ссылка скопирована', tone: 'ok' });
		} catch {
			toast.show({
				title: 'Не удалось скопировать',
				description: 'Выделите адрес и скопируйте его вручную.',
				tone: 'bad',
			});
		}
	};

	return (
		<Card className="flex flex-col gap-4">
			<CardHeader title="Ссылка для врача" />

			{profile.doctor ? (
				<div className="flex flex-col gap-2">
					<span className="text-[12.5px] font-semibold text-ink-2">Ваш врач</span>
					<div className="flex items-center justify-between gap-3 rounded-control bg-surface-2 px-4 py-3">
						<span className="text-[13.5px]">{fullName(profile.doctor)}</span>
						<button
							type="button"
							onClick={() => setUnlinkOpen(true)}
							className="text-[13px] text-bad underline underline-offset-2 hover:no-underline"
						>
							Отвязать
						</button>
					</div>
				</div>
			) : (
				<p className="text-[13.5px] text-ink-2">
					Вы не закреплены за врачом. Передайте врачу ссылку ниже — он сможет прикрепить вас
					к своему списку.
				</p>
			)}

			<div className="flex flex-col gap-2">
				<span className="text-[12.5px] font-semibold text-ink-2">Персональная ссылка</span>
				<code className="tnum block overflow-x-auto rounded-control bg-surface-2 px-4 py-3 text-[12.5px] text-ink-2">
					{link}
				</code>
			</div>

			<div className="flex flex-wrap gap-2.5">
				<Button variant="primary" icon={<CopyIcon size={17} />} onClick={copy}>
					Скопировать ссылку
				</Button>
				<Button variant="secondary" icon={<RefreshIcon size={17} />} onClick={() => setRegenerateOpen(true)}>
					Перевыпустить
				</Button>
			</div>

			<ConfirmModal
				open={unlinkOpen}
				onClose={() => setUnlinkOpen(false)}
				title="Отвязать врача?"
				description="Врач перестанет видеть вашу статистику. Прикрепиться снова можно будет по той же ссылке."
				confirmLabel="Отвязать"
				danger
				loading={unlink.isPending}
				onConfirm={async () => {
					try {
						await unlink.mutateAsync();
						toast.show({ title: 'Врач отвязан', tone: 'ok' });
					} catch (error) {
						toast.show({
							title: 'Не удалось отвязать врача',
							description: toMessage(error, 'Попробуйте позже.'),
							tone: 'bad',
						});
					} finally {
						setUnlinkOpen(false);
					}
				}}
			/>

			<ConfirmModal
				open={regenerateOpen}
				onClose={() => setRegenerateOpen(false)}
				title="Перевыпустить ссылку?"
				description="Прежняя ссылка перестанет работать. Понадобится, если адрес попал не тем людям."
				confirmLabel="Перевыпустить"
				loading={regenerate.isPending}
				onConfirm={async () => {
					try {
						await regenerate.mutateAsync();
						toast.show({ title: 'Ссылка обновлена', tone: 'ok' });
					} catch (error) {
						toast.show({
							title: 'Не удалось перевыпустить ссылку',
							description: toMessage(error, 'Попробуйте позже.'),
							tone: 'bad',
						});
					} finally {
						setRegenerateOpen(false);
					}
				}}
			/>
		</Card>
	);
}
