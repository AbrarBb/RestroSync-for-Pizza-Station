
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const { user, userRole, signOut } = useAuth();

  return (
    <header className="bg-white shadow-sm py-4 px-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center text-lg font-semibold">
          <span className="text-2xl mr-2">🍕</span> Pizza Station
        </Link>
        
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link to="/menu">Menu</Link>
          </Button>
          
          <Button asChild variant="ghost" size="sm">
            <Link to="/reservations">Reservations</Link>
          </Button>
          
          {!user ? (
            <Button asChild size="sm">
              <Link to="/login">Sign In</Link>
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              {userRole === "admin" && (
                <Button asChild variant="outline" size="sm">
                  <Link to="/staff">Manage Staff</Link>
                </Button>
              )}
              <Button asChild variant="outline" size="sm">
                <Link to="/dashboard">Dashboard</Link>
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => signOut()}
              >
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
