
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
      title: "Authentication required",
      description: "You need to sign in to access this page.",
      variant: "destructive",
    });
    return <Navigate to="/login" replace />;
  }
  
  // If no userRole is determined yet but user exists, show loading
  if (!userRole) {
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-muted-foreground">Determining user permissions...</p>
      </div>
    );
  }
  
  // Check role-based access
  if (!allowedRoles.includes(userRole)) {
    toast({
      title: "Access denied",
      description: `This area is restricted to ${allowedRoles.join(" or ")} roles.`,
      variant: "destructive",
    });
    
    // Direct users based on their role
    if (userRole === "customer") {
      return <Navigate to="/customer-dashboard" replace />;
    } else if (userRole === "staff") {
      return <Navigate to="/dashboard" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
