
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Header = () => {
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
          
          <Button asChild size="sm">
            <Link to="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
