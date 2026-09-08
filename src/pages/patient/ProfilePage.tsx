import { useProfile } from '@/shared/api/profile';
import { DoctorLinkCard } from '@/features/profile/DoctorLinkCard';
import { PasswordChangeForm } from '@/features/profile/PasswordChangeForm';
import { PersonalInfoForm } from '@/features/profile/PersonalInfoForm';
import { QueryBoundary, SkeletonCard } from '@/shared/ui';

export default function ProfilePage() {
	const profileQuery = useProfile();

	return (
		<div className="flex flex-col gap-6">
			<h1 className="font-display text-[27px] font-bold">Личный кабинет</h1>

			<QueryBoundary
				query={profileQuery}
				errorText="Не удалось загрузить профиль"
				skeleton={
					<div className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
						<SkeletonCard lines={6} />
						<SkeletonCard lines={4} />
					</div>
				}
			>
				{(profile) => (
					<div className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] xl:items-start">
						<PersonalInfoForm profile={profile} />

						<div className="flex flex-col gap-5">
							{profile.role === 'patient' && <DoctorLinkCard profile={profile} />}
							<PasswordChangeForm />
						</div>
					</div>
				)}
			</QueryBoundary>
		</div>
	);
}
