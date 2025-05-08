
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Calendar, Clock, CheckCircle2, XCircle, Package, ChevronRight } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { ordersService, Order } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import Header from "@/components/layout/Header";

interface OrderDetailsProps {
  order: Order;
  onClose: () => void;
  onUpdateStatus?: (id: string, status: Order['status']) => void;
  isAdmin?: boolean;
}

const OrderDetails = ({ order, onClose, onUpdateStatus, isAdmin = false }: OrderDetailsProps) => {
  const items = order.items as { id: string; name: string; price: number; quantity: number }[];
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.07;
  const total = subtotal + tax;
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const formatTime = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Order #{order.id.substring(0, 8).toUpperCase()}</DialogTitle>
        <DialogDescription>
          Placed on {formatDate(order.created_at)} at {formatTime(order.created_at)}
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-medium mb-2">Order Status</h4>
          <div className="flex items-center space-x-2">
            <Badge
              variant="outline"
              className={`
                ${order.status === "pending" ? "bg-yellow-100 text-yellow-800" : ""}
                ${order.status === "preparing" ? "bg-blue-100 text-blue-800" : ""}
                ${order.status === "ready" ? "bg-green-100 text-green-800" : ""}
                ${order.status === "delivered" ? "bg-gray-100 text-gray-800" : ""}
                ${order.status === "cancelled" ? "bg-red-100 text-red-800" : ""}
              `}
            >
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
            
            {isAdmin && onUpdateStatus && (
              <div className="ml-auto space-x-2">
                {order.status !== "cancelled" && order.status !== "delivered" && (
                  <>
                    {order.status !== "ready" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onUpdateStatus(order.id, "ready")}
                      >
                        Mark Ready
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => onUpdateStatus(order.id, "delivered")}
                    >
                      Mark Delivered
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onUpdateStatus(order.id, "cancelled")}
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-2">Order Type</h4>
          <p className="capitalize flex items-center">
            {order.order_type === "delivery" ? (
              <>
                <Package className="h-4 w-4 mr-2" />
                Delivery to {order.delivery_address}
              </>
            ) : order.order_type === "pickup" ? (
              <>
                <Package className="h-4 w-4 mr-2" />
                Pickup at store
              </>
            ) : (
              <>
                <Package className="h-4 w-4 mr-2" />
                Dine-in (Table {order.table_number || "N/A"})
              </>
            )}
          </p>
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-2">Order Items</h4>
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="flex justify-between">
                <div>
                  <span className="font-medium">{item.quantity}×</span> {item.name}
                </div>
                <div>৳{(item.price * item.quantity).toFixed(2)}</div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>৳{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax (7%)</span>
              <span>৳{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span>৳{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-2">Payment</h4>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Badge variant={order.payment_status === "paid" ? "default" : "outline"}>
                {order.payment_status === "paid" ? (
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                ) : (
                  <XCircle className="h-3 w-3 mr-1" />
                )}
                {order.payment_status === "paid" ? "Paid" : "Pending"}
              </Badge>
              <span className="ml-2 text-sm text-muted-foreground">
                ({order.payment_method || "Unknown payment method"})
              </span>
            </div>
            
            {order.payment_status !== "paid" && !isAdmin && (
              <Button size="sm" variant="outline">
                Pay Now
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

const CustomerOrders = () => {
  const { user } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Get customer orders
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["customerOrders", user?.id],
    queryFn: () => user ? ordersService.getByCustomerId(user.id) : Promise.resolve([]),
    enabled: !!user,
  });

  // Filter orders based on status
  const pendingOrders = orders.filter(order => 
    ["pending", "preparing", "ready"].includes(order.status)
  );
  const completedOrders = orders.filter(order => 
    order.status === "delivered"
  );
  const cancelledOrders = orders.filter(order => 
    order.status === "cancelled"
  );
  
  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-gray-500">Loading your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">My Orders</h1>
          
          {orders.length === 0 ? (
            <div className="text-center py-16">
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium">No orders yet</h3>
              <p className="text-gray-500 mt-1">When you place your order, you'll see it here</p>
              <Button className="mt-6" asChild>
                <a href="/menu">Order Now</a>
              </Button>
            </div>
          ) : (
            <Tabs defaultValue="active">
              <TabsList className="mb-6">
                <TabsTrigger value="active">
                  Active ({pendingOrders.length})
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Completed ({completedOrders.length})
                </TabsTrigger>
                <TabsTrigger value="cancelled">
                  Cancelled ({cancelledOrders.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="active">
                {pendingOrders.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-gray-500">You have no active orders</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingOrders.map((order) => (
                      <OrderCard 
                        key={order.id}
                        order={order}
                        onClick={() => viewOrderDetails(order)}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="completed">
                {completedOrders.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-gray-500">You have no completed orders</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {completedOrders.map((order) => (
                      <OrderCard 
                        key={order.id}
                        order={order}
                        onClick={() => viewOrderDetails(order)}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="cancelled">
                {cancelledOrders.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-gray-500">You have no cancelled orders</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cancelledOrders.map((order) => (
                      <OrderCard 
                        key={order.id}
                        order={order}
                        onClick={() => viewOrderDetails(order)}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        {selectedOrder && (
          <OrderDetails
            order={selectedOrder}
            onClose={() => setDialogOpen(false)}
          />
        )}
      </Dialog>
      
      <footer className="bg-gray-100 py-6">
        <div className="container mx-auto text-center text-gray-500">
          <p>&copy; 2025 Pizza Station. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

const StaffOrders = () => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  
  // Get all orders
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["allOrders"],
    queryFn: ordersService.getAll,
  });

  // Update order status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: Order['status'] }) => {
      return ordersService.updateStatus(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allOrders"] });
      toast({
        title: "Order Updated",
        description: "Order status has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update order",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter orders based on status
  const pendingOrders = orders.filter(order => order.status === "pending");
  const preparingOrders = orders.filter(order => order.status === "preparing");
  const readyOrders = orders.filter(order => order.status === "ready");
  const completedOrders = orders.filter(order => 
    order.status === "delivered" || order.status === "cancelled"
  );
  
  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setDialogOpen(true);
  };

  const handleUpdateStatus = (id: string, status: Order['status']) => {
    updateStatusMutation.mutate({ id, status });
    setDialogOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Order Management</h1>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="ml-2 text-gray-500">Loading orders...</p>
          </div>
        ) : (
          <Tabs defaultValue="pending">
            <TabsList className="mb-6">
              <TabsTrigger value="pending">
                Pending ({pendingOrders.length})
              </TabsTrigger>
              <TabsTrigger value="preparing">
                Preparing ({preparingOrders.length})
              </TabsTrigger>
              <TabsTrigger value="ready">
                Ready ({readyOrders.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({completedOrders.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="pending">
              {pendingOrders.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-500">No pending orders</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingOrders.map((order) => (
                    <Card key={order.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex justify-between">
                          <span>Order #{order.id.substring(0, 8).toUpperCase()}</span>
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                            Pending
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span className="text-xs">
                              {new Date(order.created_at).toLocaleDateString()}
                            </span>
                            <Clock className="h-3 w-3 ml-2 mr-1" />
                            <span className="text-xs">
                              {new Date(order.created_at).toLocaleTimeString()}
                            </span>
                          </div>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Customer:</span>
                            <span>{order.customer_name || "Guest"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Order Type:</span>
                            <span className="capitalize">{order.order_type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Total:</span>
                            <span className="font-medium">৳{order.total.toFixed(2)}</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-2">
                        <div className="flex justify-between w-full">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => viewOrderDetails(order)}
                          >
                            View Details
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleUpdateStatus(order.id, "preparing")}
                          >
                            Start Preparing
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="preparing">
              {preparingOrders.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-500">No orders being prepared</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {preparingOrders.map((order) => (
                    <Card key={order.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex justify-between">
                          <span>Order #{order.id.substring(0, 8).toUpperCase()}</span>
                          <Badge variant="outline" className="bg-blue-100 text-blue-800">
                            Preparing
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span className="text-xs">
                              {new Date(order.created_at).toLocaleDateString()}
                            </span>
                            <Clock className="h-3 w-3 ml-2 mr-1" />
                            <span className="text-xs">
                              {new Date(order.created_at).toLocaleTimeString()}
                            </span>
                          </div>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Customer:</span>
                            <span>{order.customer_name || "Guest"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Order Type:</span>
                            <span className="capitalize">{order.order_type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Total:</span>
                            <span className="font-medium">৳{order.total.toFixed(2)}</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-2">
                        <div className="flex justify-between w-full">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => viewOrderDetails(order)}
                          >
                            View Details
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleUpdateStatus(order.id, "ready")}
                          >
                            Mark Ready
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="ready">
              {readyOrders.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-500">No orders ready for pickup/delivery</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {readyOrders.map((order) => (
                    <Card key={order.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex justify-between">
                          <span>Order #{order.id.substring(0, 8).toUpperCase()}</span>
                          <Badge variant="outline" className="bg-green-100 text-green-800">
                            Ready
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span className="text-xs">
                              {new Date(order.created_at).toLocaleDateString()}
                            </span>
                            <Clock className="h-3 w-3 ml-2 mr-1" />
                            <span className="text-xs">
                              {new Date(order.created_at).toLocaleTimeString()}
                            </span>
                          </div>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Customer:</span>
                            <span>{order.customer_name || "Guest"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Order Type:</span>
                            <span className="capitalize">{order.order_type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Total:</span>
                            <span className="font-medium">৳{order.total.toFixed(2)}</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-2">
                        <div className="flex justify-between w-full">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => viewOrderDetails(order)}
                          >
                            View Details
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleUpdateStatus(order.id, "delivered")}
                          >
                            Mark Delivered
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="completed">
              {completedOrders.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-500">No completed orders</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {completedOrders.map((order) => (
                    <Card key={order.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex justify-between">
                          <span>Order #{order.id.substring(0, 8).toUpperCase()}</span>
                          <Badge variant="outline" className={
                            order.status === "delivered" 
                              ? "bg-gray-100 text-gray-800" 
                              : "bg-red-100 text-red-800"
                          }>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span className="text-xs">
                              {new Date(order.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Customer:</span>
                            <span>{order.customer_name || "Guest"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Total:</span>
                            <span className="font-medium">৳{order.total.toFixed(2)}</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          onClick={() => viewOrderDetails(order)}
                        >
                          View Details
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        {selectedOrder && (
          <OrderDetails
            order={selectedOrder}
            onClose={() => setDialogOpen(false)}
            onUpdateStatus={handleUpdateStatus}
            isAdmin={true}
          />
        )}
      </Dialog>
    </DashboardLayout>
  );
};

const OrderCard = ({ order, onClick }: { order: Order; onClick: () => void }) => {
  const items = order.items as { id: string; name: string; quantity: number }[];
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "preparing":
        return "bg-blue-100 text-blue-800";
      case "ready":
        return "bg-green-100 text-green-800";
      case "delivered":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-semibold">Order #{order.id.substring(0, 8).toUpperCase()}</h3>
            <p className="text-sm text-muted-foreground">
              {formatDate(order.created_at)}
            </p>
          </div>
          <Badge variant="outline" className={`${getStatusColor(order.status)} capitalize`}>
            {order.status}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="text-sm space-y-1">
            {items.slice(0, 2).map((item, idx) => (
              <div key={idx} className="flex justify-between">
                <span>
                  {item.quantity}× {item.name}
                </span>
              </div>
            ))}
            {items.length > 2 && (
              <div className="text-sm text-muted-foreground">
                +{items.length - 2} more items
              </div>
            )}
          </div>
          
          <div className="pt-2 flex justify-between items-center border-t mt-3">
            <span className="font-medium">Total: ৳{order.total.toFixed(2)}</span>
            <Button variant="ghost" size="sm" className="gap-1">
              Details <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Orders = () => {
  const { userRole } = useAuth();
  
  // Render different views based on user role
  if (userRole === "admin" || userRole === "staff") {
    return <StaffOrders />;
  }
  
  return <CustomerOrders />;
};

export default Orders;
