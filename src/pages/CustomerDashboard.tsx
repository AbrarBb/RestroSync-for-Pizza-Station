
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import CustomerProfile from "@/components/customer/CustomerProfile";
import { Home, LogOut, User, Package, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { orderService } from "@/lib/orderService";
import { Order } from "@/lib/supabase";
import OrderTracker from "@/components/customer/OrderTracker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const CustomerDashboard = () => {
  const { user, userRole, signOut } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!user || userRole !== "customer") {
      toast({
        title: "Access denied",
        description: "You need to be logged in as a customer to access this page.",
        variant: "destructive",
      });
      navigate("/login");
    } else {
      fetchOrders();
    }
  }, [user, userRole, navigate]);
  
  const fetchOrders = async () => {
    if (!user) return;
    
    setLoading(true);
    const customerOrders = await orderService.getCustomerOrders(user.id);
    setOrders(customerOrders);
    setLoading(false);
  };
  
  if (!user || userRole !== "customer") {
    return null;
  }
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case "preparing": return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "ready": return "bg-green-100 text-green-800 hover:bg-green-200";
      case "delivering": return "bg-purple-100 text-purple-800 hover:bg-purple-200";
      case "delivered": return "bg-gray-100 text-gray-800 hover:bg-gray-200";
      case "cancelled": return "bg-red-100 text-red-800 hover:bg-red-200";
      default: return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
              <Link to="/my-orders">My Orders</Link>
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
            <TabsTrigger value="orders">
              <Package className="h-4 w-4 mr-2" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="favorites">
              <Star className="h-4 w-4 mr-2" />
              Favorites
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <CustomerProfile />
          </TabsContent>
          
          <TabsContent value="orders">
            <div className="space-y-6">
              {selectedOrderId ? (
                <div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedOrderId(null)}
                    className="mb-4"
                  >
                    ← Back to Orders
                  </Button>
                  <OrderTracker orderId={selectedOrderId} />
                </div>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Your Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-center py-6">
                        <p className="text-muted-foreground">Loading your orders...</p>
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="text-center py-6">
                        <p className="text-muted-foreground">
                          You haven't placed any orders yet.
                        </p>
                        <Button asChild className="mt-4">
                          <Link to="/menu">Order Now</Link>
                        </Button>
                      </div>
                    ) : (
                      <div className="divide-y">
                        {orders.map((order) => (
                          <div key={order.id} className="py-4">
                            <div className="flex justify-between items-center mb-2">
                              <div>
                                <p className="font-medium">
                                  Order #{order.id.substring(0, 8)}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {formatDate(order.created_at)}
                                </p>
                              </div>
                              <Badge className={`${getStatusColor(order.status)} capitalize`}>
                                {order.status}
                              </Badge>
                            </div>
                            
                            <div className="flex justify-between items-center mb-3">
                              <p className="text-sm">
                                {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                              </p>
                              <p className="font-medium">৳{order.total.toFixed(2)}</p>
                            </div>
                            
                            <Button 
                              size="sm" 
                              onClick={() => setSelectedOrderId(order.id)}
                            >
                              Track Order
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
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
