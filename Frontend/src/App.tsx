import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SidebarProvider } from './context/SidebarContext';
import { RoleGuard } from './shared/components/layouts/RoleGuard';
import NotFound from './shared/pages/NotFound';

// Login & Legal Pages
import { LoginPage, TermsPage, PrivacyPage } from './features/auth';

// Admin Logistik Pages
import LogistikDashboard from './features/dashboard/pages/LogistikDashboard';
import LogisticsRoutePlanning from './features/routes/pages/RoutePlanningPage';
import LogisticsDriverPerformance from './features/drivers/pages/DriverPerformancePage';
import LogisticsFleetManagement from './features/fleet/pages/FleetManagementPage';
import LogisticsAnalytics from './features/analytics/pages/AnalyticsPage';
import LogisticsSettings from './features/settings/pages/SettingsPage';
import LoadPlanner from './features/loadPlanner/pages/LoadPlannerPage';
import CustomerData from './features/customers/pages/CustomerDataPage';
import ManagerDashboardPage from './features/manager/pages/ManagerDashboardPage';

// Admin POD Pages
import { 
  PodLayout, 
  PodDashboardPage, 
  VerificationsPage, 
  MonitoringPage, 
  HistoryPage, 
  PodSettingsPage 
} from './features/pod';

// Driver Pages
import { 
  DriverappDashboardPage,
  RouteListPage, 
  DeliveryDetailPage, 
  PodCapturePage, 
  TripSummaryPage, 
  NavigationPage
} from './features/driver-app';

// 🌟 FIX CTO: IMPORT HALAMAN KASIR!
import KasirDashboard from './features/finance/pages/KasirDashboard';
import KasirHistory from './features/finance/pages/KasirHistory';

// Logistics Layout
import LogisticsLayout from './shared/components/layouts/LogisticsLayout';

function App() {
  return (
    <Router>
      <AuthProvider>
        <SidebarProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/terms-of-service" element={<TermsPage />} />
            <Route path="/privacy-policy" element={<PrivacyPage />} />

            {/* Root Redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Admin Logistik Routes */}
            <Route element={<RoleGuard allowedRoles={['admin_distribusi']} />}>
              <Route element={<LogisticsLayout />}>
                <Route path="/logistik" element={<LogistikDashboard />} />
                <Route path="/logistik/route-planning" element={<LogisticsRoutePlanning />} />
                <Route path="/logistik/fleet" element={<LogisticsFleetManagement />} />
                <Route path="/logistik/drivers" element={<LogisticsDriverPerformance />} />
                <Route path="/logistik/customers" element={<CustomerData />} />
                <Route path="/logistik/analytics" element={<LogisticsAnalytics />} />
                <Route path="/logistik/settings" element={<LogisticsSettings />} />
                <Route path="/logistik/load-planner" element={<LoadPlanner />} />
              </Route>
            </Route>

            {/* Manager Logistik Routes */}
            <Route element={<RoleGuard allowedRoles={['manager_logistik']} />}>
              <Route element={<LogisticsLayout />}>
                <Route path="/manager" element={<ManagerDashboardPage />} />
                <Route path="/manager/:tab" element={<ManagerDashboardPage />} />
              </Route>
            </Route>

            {/* Admin POD Routes */}
            <Route element={<RoleGuard allowedRoles={['admin_pod']} />}>
              <Route element={<PodLayout />}>
                <Route path="/pod" element={<PodDashboardPage />} />
                <Route path="/pod/verifications" element={<VerificationsPage />} />
                <Route path="/pod/monitoring" element={<MonitoringPage />} />
                <Route path="/pod/history" element={<HistoryPage />} />
                <Route path="/pod/settings" element={<PodSettingsPage />} />
              </Route>
            </Route>

            {/* finance routes */}
            <Route element={<RoleGuard allowedRoles={['kasir', 'manager_logistik']} />}>
              <Route element={<LogisticsLayout />}>
                <Route path="/finance" element={<KasirDashboard />} />
                <Route path="/finance/history" element={<KasirHistory />} />
              </Route>
            </Route>

            {/* Driver Routes (Mobile First) */}
            <Route element={<RoleGuard allowedRoles={['driver']} />}>
              <Route path="/driver" element={<DriverappDashboardPage />} />
              <Route path="/driver/routes" element={<RouteListPage />} />
              <Route path="/driver/detail" element={<DeliveryDetailPage />} />
              <Route path="/driver/pod" element={<PodCapturePage />} />
              <Route path="/driver/summary" element={<TripSummaryPage />} />
              <Route path="/driver/navigation" element={<NavigationPage />} />
            </Route>

            {/* 🌟 CATCH-ALL ROUTE (TARUH PALING BAWAH!) */}
            <Route path="*" element={<NotFound />} />
            
          </Routes>
        </SidebarProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;