
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
  
  console.log('ProtectedRoute - DEBUG INFO:');
  console.log('- user exists:', !!user);
  console.log('- user email:', user?.email);
  console.log('- userRole:', userRole);
  console.log('- allowedRoles:', allowedRoles);
  console.log('- isLoading:', isLoading);
  console.log('- requireAuth:', requireAuth);
  
  // Show loading state
  if (isLoading) {
    console.log('ProtectedRoute - Showing loading state');
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-muted-foreground">Loading...</p>
      </div>
    );
  }
  
  // If route doesn't require auth, allow access
  if (!requireAuth) {
    console.log('ProtectedRoute - Route does not require auth, allowing access');
    return <>{children}</>;
  }
  
  // Check if user is authenticated
  if (!user) {
    console.log('ProtectedRoute - No user found, redirecting to login');
    toast({
      title: "Authentication required",
      description: "You need to sign in to access this page.",
      variant: "destructive",
    });
    return <Navigate to="/login" replace />;
  }
  
  // If no userRole is determined yet but user exists, show loading
  if (!userRole) {
    console.log('ProtectedRoute - User exists but no role determined yet, showing loading');
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-muted-foreground">Determining user permissions...</p>
      </div>
    );
  }
  
  // Check role-based access
  console.log('ProtectedRoute - Checking role access...');
  console.log('- userRole:', userRole);
  console.log('- allowedRoles:', allowedRoles);
  console.log('- includes check:', allowedRoles.includes(userRole));
  
  if (!allowedRoles.includes(userRole)) {
    console.log('ProtectedRoute - Access denied - userRole:', userRole, 'not in allowedRoles:', allowedRoles);
    toast({
      title: "Access denied",
      description: `This area is restricted to ${allowedRoles.join(" or ")} roles. Your role: ${userRole}`,
      variant: "destructive",
    });
    
    // Direct users based on their role
    if (userRole === "customer") {
      console.log('ProtectedRoute - Redirecting customer to customer dashboard');
      return <Navigate to="/customer-dashboard" replace />;
    } else if (userRole === "staff") {
      console.log('ProtectedRoute - Redirecting staff to dashboard');
      return <Navigate to="/dashboard" replace />;
    } else {
      console.log('ProtectedRoute - Redirecting admin to dashboard');
      return <Navigate to="/dashboard" replace />;
    }
  }
  
  console.log('ProtectedRoute - Access granted - userRole:', userRole, 'is in allowedRoles:', allowedRoles);
  return <>{children}</>;
};

export default ProtectedRoute;
