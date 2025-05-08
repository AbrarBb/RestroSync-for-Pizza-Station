
import { Navigate } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireAuth?: boolean;
}

const ProtectedRoute = ({ 
  children, 
  allowedRoles = ["admin", "staff", "customer"],
  requireAuth = true
}: ProtectedRouteProps) => {
  const { user, userRole, isLoading } = useAuth();
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-muted-foreground">Loading...</p>
      </div>
    );
  }
  
  // If route doesn't require auth, allow access
  if (!requireAuth) {
    return <>{children}</>;
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
