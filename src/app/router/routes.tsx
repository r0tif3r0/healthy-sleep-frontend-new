import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '@/app/providers/useAuth';
import { AppShell } from '@/widgets/AppShell/AppShell';
import AdminPage from '@/pages/AdminPage';
import AuthPage from '@/pages/AuthPage';
import LandingPage from '@/pages/LandingPage';
import LegalPage from '@/pages/LegalPage';
import NotFoundPage from '@/pages/NotFoundPage';
import ResetConfirmPage from '@/pages/ResetConfirmPage';
import ResetRequestPage from '@/pages/ResetRequestPage';
import PatientDetailPage from '@/pages/doctor/PatientDetailPage';
import PatientListPage from '@/pages/doctor/PatientListPage';
import ProfilePage from '@/pages/patient/ProfilePage';
import StatsPage from '@/pages/patient/StatsPage';
import UploadPage from '@/pages/patient/UploadPage';
import { RedirectHome, RequireAuth, RequireRole } from './guards';

/** Гостю показываем публичную страницу, вошедшему — сразу его кабинет. */
function PublicOrHome({ children }: { children: React.ReactNode }) {
	const { isAuthenticated, isLoading } = useAuth();
	if (isLoading) return null;
	return isAuthenticated ? <RedirectHome /> : <>{children}</>;
}

export function AppRoutes() {
	return (
		<Routes>
			<Route path="/" element={<PublicOrHome><LandingPage /></PublicOrHome>} />
			<Route path="/auth" element={<PublicOrHome><AuthPage /></PublicOrHome>} />
			<Route path="/auth/reset" element={<ResetRequestPage />} />
			<Route path="/auth/recovery" element={<ResetConfirmPage />} />
			<Route path="/legal" element={<LegalPage />} />

			<Route element={<RequireAuth />}>
				<Route path="/app" element={<AppShell />}>
					<Route index element={<RedirectHome />} />

					<Route element={<RequireRole role="patient" />}>
						<Route path="stats" element={<StatsPage />} />
						<Route path="upload" element={<UploadPage />} />
					</Route>

					<Route element={<RequireRole role={['patient', 'doctor']} />}>
						<Route path="profile" element={<ProfilePage />} />
					</Route>

					<Route element={<RequireRole role="doctor" />}>
						<Route path="patients" element={<PatientListPage />} />
						<Route path="patients/:privateId" element={<PatientDetailPage />} />
					</Route>

					<Route element={<RequireRole role="admin" />}>
						<Route path="admin" element={<AdminPage />} />
					</Route>

					<Route path="info" element={<LegalPage />} />
				</Route>
			</Route>

			<Route path="/patient/:privateId" element={<Navigate to="/app/patients" replace />} />
			<Route path="*" element={<NotFoundPage />} />
		</Routes>
	);
}
