
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Index from './pages/Index';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Menu from './pages/Menu';
import NotFound from './pages/NotFound';
import Orders from './pages/Orders';
import Staff from './pages/Staff';
import Inventory from './pages/Inventory';
import MenuManagement from './pages/MenuManagement';
import Reservations from './pages/Reservations';
import Reports from './pages/Reports';
import CustomerDashboard from './pages/CustomerDashboard';
import Feedback from './pages/Feedback';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from './components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProtectedRoute from './components/ProtectedRoute';
import Customers from './pages/Customers';
import DeliveryManagement from './pages/DeliveryManagement';
import { initializeStorage } from './lib/supabaseStorageHelper';

console.log('Initializing application...');
initializeStorage();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/login" element={<Login />} />
            
            {/* Customer Routes */}
            <Route path="/customer-dashboard" element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <CustomerDashboard />
              </ProtectedRoute>
            } />
            
            {/* Orders - accessible by all authenticated users */}
            <Route path="/orders" element={
              <ProtectedRoute allowedRoles={["admin", "staff", "customer"]}>
                <Orders />
              </ProtectedRoute>
            } />
            
            {/* Admin/Staff Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={["admin", "staff"]}>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/staff" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Staff />
              </ProtectedRoute>
            } />
            <Route path="/customers" element={
              <ProtectedRoute allowedRoles={["admin", "staff"]}>
                <Customers />
              </ProtectedRoute>
            } />
            <Route path="/inventory" element={
              <ProtectedRoute allowedRoles={["admin", "staff"]}>
                <Inventory />
              </ProtectedRoute>
            } />
            <Route path="/menu-management" element={
              <ProtectedRoute allowedRoles={["admin", "staff"]}>
                <MenuManagement />
              </ProtectedRoute>
            } />
            <Route path="/reservations" element={
              <ProtectedRoute allowedRoles={["admin", "staff"]}>
                <Reservations />
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute allowedRoles={["admin", "staff"]}>
                <Reports />
              </ProtectedRoute>
            } />
            <Route path="/feedback" element={
              <ProtectedRoute allowedRoles={["admin", "staff"]}>
                <Feedback />
              </ProtectedRoute>
            } />
            <Route path="/delivery-management" element={
              <ProtectedRoute allowedRoles={["admin", "staff"]}>
                <DeliveryManagement />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
