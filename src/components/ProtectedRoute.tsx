
import { Navigate } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute = ({ children, allowedRoles = ["admin", "staff", "customer"] }: ProtectedRouteProps) => {
  const { user, userRole, isLoading } = useAuth();
  
  // Show loading state
  if (isLoading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }
  
  // Check if user is authenticated
  if (!user) {
    toast({
      title: "Access denied",
      description: "You need to sign in first.",
      variant: "destructive",
    });
    return <Navigate to="/login" replace />;
  }
  
  // Check role-based access
  if (userRole && !allowedRoles.includes(userRole)) {
    toast({
      title: "Permission denied",
      description: "You don't have permission to access this page.",
      variant: "destructive",
    });
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
