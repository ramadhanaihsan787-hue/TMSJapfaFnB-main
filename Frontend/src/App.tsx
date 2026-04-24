import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SidebarProvider } from './context/SidebarContext';
import { RoleGuard } from './components/layouts/RoleGuard';

// Login Page
import Login from './pages/login/Login';

// Legal Pages (co-located in Login.tsx)
import { TermsOfService } from './pages/login/Login';
import { PrivacyPolicy } from './pages/login/Login';

// 🌟 INI YANG BERUBAH BOS! IMPORT FILE RAKITAN BARU KITA!
import LogistikDashboard from './features/dashboard/pages/LogistikDashboard';

// Admin Logistik Pages (Sisanya masih pake yang lama, gapapa biarin aja dulu)
import LogisticsRoutePlanning from './features/routes/pages/RoutePlanningPage';
import LogisticsDriverPerformance from './features/drivers/pages/DriverPerformancePage';
import LogisticsFleetManagement from './features/fleet/pages/FleetManagementPage';
import LogisticsAnalytics from './features/analytics/pages/AnalyticsPage';
import LogisticsSettings from './features/settings/pages/SettingsPage';
import LoadPlanner from './pages/logistik/LoadPlanner';
import CustomerData from './features/customers/pages/CustomerDataPage';
import ManagerLogistik from './pages/manager_logistik/ManagerLogistik';

// Admin POD Pages
import PodDashboard from './pages/pod/Dashboard';
import PodVerifications from './pages/pod/Verifications';
import PodMonitoring from './pages/pod/Monitoring';
import PodHistory from './pages/pod/History';
import PodSettings from './pages/pod/Settings';

// Driver Pages
import DriverDashboard from './pages/driver/Dashboard';
import DriverRouteList from './pages/driver/RouteList';
import DriverDeliveryDetail from './pages/driver/DeliveryDetail';
import DriverPodCapture from './pages/driver/PodCapture';
import DriverTripSummary from './pages/driver/TripSummary';

// Logistics Layout
import LogisticsLayout from './components/layouts/LogisticsLayout';

function App() {
  return (
    <Router>
      <AuthProvider>
        <SidebarProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />

            {/* Root Redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Admin Logistik Routes */}
            <Route element={<RoleGuard allowedRoles={['admin_distribusi']} />}>
              <Route element={<LogisticsLayout />}>
                {/* 🌟 INI JUGA BERUBAH: Panggil komponen LogistikDashboard yang baru */}
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
                <Route path="/manager" element={<ManagerLogistik />} />
              </Route>
            </Route>

            {/* Admin POD Routes */}
            <Route element={<RoleGuard allowedRoles={['admin_pod']} />}>
              <Route path="/pod" element={<PodDashboard />} />
              <Route path="/pod/verifications" element={<PodVerifications />} />
              <Route path="/pod/monitoring" element={<PodMonitoring />} />
              <Route path="/pod/history" element={<PodHistory />} />
              <Route path="/pod/settings" element={<PodSettings />} />
              {/* Catch-all for pod routes */}
              <Route path="/pod/*" element={<Navigate to="/pod" replace />} />
            </Route>

            {/* Driver Routes (Mobile First) */}
            <Route element={<RoleGuard allowedRoles={['driver']} />}>
              <Route path="/driver" element={<DriverDashboard />} />
              <Route path="/driver/routes" element={<DriverRouteList />} />
              <Route path="/driver/detail" element={<DriverDeliveryDetail />} />
              <Route path="/driver/pod" element={<DriverPodCapture />} />
              <Route path="/driver/summary" element={<DriverTripSummary />} />
            </Route>

            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </SidebarProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;