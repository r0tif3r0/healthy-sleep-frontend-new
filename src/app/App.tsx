import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './providers/AuthProvider';
import { QueryProvider } from './providers/QueryProvider';
import { ThemeProvider } from './providers/ThemeProvider';
import { ToastProvider } from '@/shared/ui';
import { AppRoutes } from './router/routes';
import { ScrollToTop } from './router/ScrollToTop';

function App() {
	return (
		<QueryProvider>
			<ThemeProvider>
				<ToastProvider>
					<BrowserRouter>
						<ScrollToTop />
						<AuthProvider>
							<AppRoutes />
						</AuthProvider>
					</BrowserRouter>
				</ToastProvider>
			</ThemeProvider>
		</QueryProvider>
	);
}

export default App;
