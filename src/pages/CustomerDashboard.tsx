
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import CustomerProfile from "@/components/customer/CustomerProfile";
import { Home, LogOut, User } from "lucide-react";
import { Link } from "react-router-dom";

const CustomerDashboard = () => {
  const { user, userRole, signOut } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!user || userRole !== "customer") {
      toast({
        title: "Access denied",
        description: "You need to be logged in as a customer to access this page.",
        variant: "destructive",
      });
      navigate("/login");
    }
  }, [user, userRole, navigate]);

  if (!user || userRole !== "customer") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
            
            <Button asChild variant="ghost" size="sm">
              <Link to="/orders">My Orders</Link>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => signOut()}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">My Account</h1>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/menu">Order Now</Link>
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <CustomerProfile />
          </TabsContent>
          
          <TabsContent value="orders">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">Your Orders</h2>
              <p className="text-center py-6 text-muted-foreground">
                Your order history will appear here
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="favorites">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">Your Favorites</h2>
              <p className="text-center py-6 text-muted-foreground">
                Your favorite items will appear here
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default CustomerDashboard;
