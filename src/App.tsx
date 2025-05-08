
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Menu from "./pages/Menu";
import Reservations from "./pages/Reservations";
import NotFound from "./pages/NotFound";
import Orders from "./pages/Orders";
import Inventory from "./pages/Inventory";
import Customers from "./pages/Customers";
import Staff from "./pages/Staff";
import Reports from "./pages/Reports";
import MenuManagement from "./pages/MenuManagement";
import DeliveryManagement from "./pages/DeliveryManagement";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={["admin", "staff"]}>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/menu" element={
              <ProtectedRoute requireAuth={false}>
                <Menu />
              </ProtectedRoute>
            } />
            <Route path="/reservations" element={
              <ProtectedRoute requireAuth={false}>
                <Reservations />
              </ProtectedRoute>
            } />
            <Route path="/orders" element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            } />
            <Route path="/menu-management" element={
              <ProtectedRoute allowedRoles={["admin", "staff"]}>
                <MenuManagement />
              </ProtectedRoute>
            } />
            <Route path="/inventory" element={
              <ProtectedRoute allowedRoles={["admin", "staff"]}>
                <Inventory />
              </ProtectedRoute>
            } />
            <Route path="/customers" element={
              <ProtectedRoute allowedRoles={["admin", "staff"]}>
                <Customers />
              </ProtectedRoute>
            } />
            <Route path="/staff" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Staff />
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Reports />
              </ProtectedRoute>
            } />
            <Route path="/delivery" element={
              <ProtectedRoute allowedRoles={["admin", "staff"]}>
                <DeliveryManagement />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
