import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppShell } from './components/layout/AppShell';
import { CatalogAdminRoute } from './components/auth/CatalogAdminRoute';
import { ItemManagementRoute } from './components/auth/ItemManagementRoute';
import { RoleRoute } from './components/auth/RoleRoute';
import { SuperAdminRoute } from './components/auth/SuperAdminRoute';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { CustomersPage } from './pages/CustomersPage';
import { OrdersPage } from './pages/OrdersPage';
import { ItemsPage } from './pages/ItemsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { CrockeriesPage } from './pages/CrockeriesPage';
import { CrockeryReturnsPage } from './pages/CrockeryReturnsPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { RemindersPage } from './pages/RemindersPage';
import { DeliveryPendingPage } from './pages/DeliveryPendingPage';
import { KitchenPage } from './pages/KitchenPage';
import { ReportDetailPage } from './pages/reports/ReportDetailPage';
import { SetupPinPage } from './pages/SetupPinPage';
import { UsersPage } from './pages/UsersPage';

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ledger-50 text-sm text-ledger-700">
        Loading session…
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (user?.must_set_pin && location.pathname !== '/setup-pin') {
    return <Navigate to="/setup-pin" replace />;
  }

  return <>{children}</>;
}

function PinSetupRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ledger-50 text-sm text-ledger-700">
        Loading session…
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user && !user.must_set_pin) return <Navigate to="/" replace />;

  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/setup-pin"
              element={
                <PinSetupRoute>
                  <SetupPinPage />
                </PinSetupRoute>
              }
            />
            <Route
              element={
                <ProtectedRoute>
                  <AppShell />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route
                path="reminders"
                element={
                  <RoleRoute>
                    <RemindersPage />
                  </RoleRoute>
                }
              />
              <Route
                path="orders"
                element={
                  <RoleRoute>
                    <OrdersPage />
                  </RoleRoute>
                }
              />
              <Route
                path="delivery-pending"
                element={
                  <RoleRoute>
                    <DeliveryPendingPage />
                  </RoleRoute>
                }
              />
              <Route
                path="customers"
                element={
                  <SuperAdminRoute>
                    <CustomersPage />
                  </SuperAdminRoute>
                }
              />
              <Route
                path="items"
                element={
                  <ItemManagementRoute>
                    <ItemsPage />
                  </ItemManagementRoute>
                }
              />
              <Route
                path="categories"
                element={
                  <CatalogAdminRoute>
                    <CategoriesPage />
                  </CatalogAdminRoute>
                }
              />
              <Route
                path="crockeries"
                element={
                  <CatalogAdminRoute>
                    <CrockeriesPage />
                  </CatalogAdminRoute>
                }
              />
              <Route
                path="crockery-returns"
                element={
                  <RoleRoute>
                    <CrockeryReturnsPage />
                  </RoleRoute>
                }
              />
              <Route
                path="payments"
                element={
                  <RoleRoute>
                    <PaymentsPage />
                  </RoleRoute>
                }
              />
              <Route
                path="kitchen"
                element={
                  <RoleRoute>
                    <KitchenPage />
                  </RoleRoute>
                }
              />
              <Route
                path="users"
                element={
                  <CatalogAdminRoute>
                    <UsersPage />
                  </CatalogAdminRoute>
                }
              />
              <Route
                path="reports/:reportPath"
                element={
                  <CatalogAdminRoute>
                    <ReportDetailPage />
                  </CatalogAdminRoute>
                }
              />
              <Route
                path="reports"
                element={
                  <CatalogAdminRoute>
                    <Navigate to="collections" replace />
                  </CatalogAdminRoute>
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
