import { useNavigate } from 'react-router-dom';
import { illustrations } from '@/assets/illustrations';
import { FolderPicker } from '@/features/upload/FolderPicker';
import { UploadInstructions } from '@/features/upload/UploadInstructions';
import { useProfile } from '@/shared/api/profile';
import { DeviceIcon, WarningIcon } from '@/shared/icons';
import { formatDateLong } from '@/shared/lib/format';
import { Button, Card, Illustration, SkeletonCard } from '@/shared/ui';

export default function UploadPage() {
	const navigate = useNavigate();
	const profileQuery = useProfile();
	const profile = profileQuery.data;
	const device = profile?.device;

	return (
		<div className="flex flex-col gap-[22px]">
			<div className="relative h-[186px] overflow-hidden rounded-card-lg">
				<Illustration
					source={illustrations.uploadBand}
					alt="Ночь, СИПАП-аппарат у кровати"
					className="absolute inset-0 h-full w-full object-cover"
					style={{ objectPosition: 'center 42%' }}
					eager
				/>
				<div
					className="absolute inset-0"
					style={{
						background:
							'linear-gradient(90deg, rgba(9,20,48,.94) 0%, rgba(9,20,48,.78) 42%, rgba(9,20,48,.12) 100%)',
					}}
				/>
				<div className="relative flex h-full max-w-[640px] flex-col justify-center gap-2.5 px-9">
					<h1 className="font-display text-[27px] font-bold text-white">Загрузка данных с карты</h1>
					<p className="text-[14.5px] leading-relaxed text-[#B8CBE8]">
						Достаньте карту памяти из аппарата, вставьте её в компьютер и укажите папку целиком —
						остальное сделаем мы.
					</p>
				</div>
			</div>

			<div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] xl:items-start">
				<div className="flex min-w-0 flex-col gap-5">
					{profileQuery.isPending ? (
						<SkeletonCard lines={1} />
					) : device ? (
						<Card className="flex items-center gap-4">
							<span className="flex h-[46px] w-[46px] flex-none items-center justify-center rounded-[14px] bg-brand-050 text-brand-600">
								<DeviceIcon size={23} />
							</span>
							<span className="flex min-w-0 flex-col gap-1">
								<span className="text-[12.5px] text-ink-2">Ваш аппарат</span>
								<span className="font-display text-base font-bold">{device.full_name}</span>
							</span>
							<Button
								variant="ghost"
								size="sm"
								className="ml-auto"
								onClick={() => navigate('/app/profile')}
							>
								Изменить
							</Button>
						</Card>
					) : (
						<Card className="flex items-start gap-4">
							<WarningIcon size={22} className="mt-0.5 flex-none text-accent-500" />
							<div className="flex flex-col gap-2">
								<p className="font-display text-base font-bold">Аппарат не указан</p>
								<p className="text-[13.5px] leading-relaxed text-ink-2">
									Без модели прибора разобрать архив не получится: у каждого производителя своя
									раскладка файлов на карте. Укажите аппарат в личном кабинете.
								</p>
								<Button
									variant="primary"
									size="sm"
									className="mt-1 self-start"
									onClick={() => navigate('/app/profile')}
								>
									Указать аппарат
								</Button>
							</div>
						</Card>
					)}

					<FolderPicker disabled={!device} />

					{profile?.data_updated_at && (
						<Card className="flex flex-col gap-2">
							<span className="text-[12.5px] font-semibold text-ink-2">Последняя выгрузка</span>
							<span className="tnum font-display text-base font-bold">
								{formatDateLong(profile.data_updated_at)}
							</span>
						</Card>
					)}
				</div>

				<UploadInstructions />
			</div>
		</div>
	);
}
