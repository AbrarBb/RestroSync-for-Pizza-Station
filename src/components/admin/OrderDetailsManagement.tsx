
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { orderService } from "@/lib/orderService";
import { useAuth } from "@/contexts/AuthContext";
import { OrderMessage, DeliveryAssignment } from "@/integrations/supabase/database.types";
import { Order, transformOrderItems } from "@/lib/supabase";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2, MessageSquare, Send, Package, User, MapPin, CalendarClock, Truck, RefreshCw } from "lucide-react";

interface OrderDetailsManagementProps {
  orderId: string;
}

interface Driver {
  id: string;
  name: string;
}

const ORDER_STATUSES = [
  "pending",
  "preparing",
  "ready",
  "delivering",
  "delivered",
  "cancelled"
];

const OrderDetailsManagement = ({ orderId }: OrderDetailsManagementProps) => {
  const { user, userRole } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [messages, setMessages] = useState<OrderMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryAssignment | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<string>("");
  
  // Fetch order details, messages and delivery status
  const fetchOrderData = async () => {
    if (!orderId) return;
    
    try {
      setLoading(true);
      
      // Fetch order
      const orderData = await orderService.getOrderById(orderId);
      
      if (!orderData) {
        toast({
          title: "Order not found",
          description: "Unable to retrieve order details",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }
      
      setOrder(orderData);
      
      // Fetch messages
      const orderMessages = await orderService.getOrderMessages(orderId);
      setMessages(orderMessages);
      
      // Fetch delivery status if applicable
      if (orderData.order_type === 'delivery') {
        const assignment = await orderService.getDeliveryAssignment(orderId);
        setDeliveryStatus(assignment);
        
        // Fetch drivers (in real app, would fetch from database)
        // Mock drivers for now
        setDrivers([
          { id: 'd1', name: 'Rahim Ahmed' },
          { id: 'd2', name: 'Kamal Khan' },
          { id: 'd3', name: 'Jamal Hossain' },
          { id: 'd4', name: 'Saidul Islam' }
        ]);
      }
    } catch (error) {
      console.error("Error fetching order data:", error);
      toast({
        title: "Error loading order",
        description: "Failed to load order details. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchOrderData();
    
    // Set up real-time subscription for messages
    const messagesChannel = supabase
      .channel('order_messages_changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'order_messages',
        filter: `order_id=eq.${orderId}`
      }, payload => {
        console.log('New message received:', payload.new);
        setMessages(prev => [...prev, payload.new as OrderMessage]);
      })
      .subscribe();
    
    // Set up real-time subscription for order status changes
    const orderChannel = supabase
      .channel('order_status_changes')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${orderId}`
      }, payload => {
        console.log('Order status updated:', payload.new);
        setOrder(prev => {
          if (!prev) return null;
          return {
            ...prev,
            status: payload.new.status as Order['status']
          };
        });
      })
      .subscribe();
    
    // Set up real-time subscription for delivery status
    const deliveryChannel = supabase
      .channel('delivery_status_changes')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'delivery_assignments',
        filter: `order_id=eq.${orderId}`
      }, payload => {
        console.log('Delivery status updated:', payload.new);
        setDeliveryStatus(payload.new as DeliveryAssignment);
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(orderChannel);
      supabase.removeChannel(deliveryChannel);
    };
  }, [orderId]);
  
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !userRole || !orderId) return;
    
    const message = {
      order_id: orderId,
      sender_id: user.id,
      sender_role: userRole,
      message: newMessage.trim()
    };
    
    const success = await orderService.sendOrderMessage(message);
    if (success) {
      setNewMessage("");
    }
  };
  
  const handleUpdateOrderStatus = async (status: string) => {
    if (!order) return;
    
    try {
      // Use orderService to update status
      const success = await orderService.updateOrderStatus(order.id, status as Order['status']);
      
      if (success) {
        setOrder(prev => prev ? { ...prev, status: status as Order['status'] } : null);
      }
    } catch (error: any) {
      console.error('Error updating order status:', error);
      toast({
        title: "Failed to update status",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const handleAssignDriver = async () => {
    if (!order || !selectedDriver) return;
    
    const driver = drivers.find(d => d.id === selectedDriver);
    if (!driver) return;
    
    const assignment = {
      order_id: order.id,
      driver_id: driver.id,
      driver_name: driver.name,
      status: 'assigned' as DeliveryAssignment['status']
    };
    
    const success = await orderService.assignDeliveryDriver(assignment);
    if (success) {
      // Refresh to get the updated delivery assignment
      fetchOrderData();
    }
  };
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrderData();
    setRefreshing(false);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="text-center py-10">
        <p>Order not found</p>
        <Button 
          variant="outline" 
          className="mt-4" 
          onClick={handleRefresh}
        >
          Try Again
        </Button>
      </div>
    );
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Order #{order.id.substring(0, 8)}</CardTitle>
              <CardDescription>
                {formatDate(order.created_at)}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={`${getStatusColor(order.status)} capitalize`}>
                {order.status}
              </Badge>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm">
                  <span className="font-medium">Customer:</span> {order.customer_name || "Anonymous"}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm">
                  <span className="font-medium">Email:</span> {order.customer_email || "N/A"}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm">
                  <span className="font-medium">Phone:</span> {order.customer_phone || "N/A"}
                </span>
              </div>
              
              {order.order_type === 'delivery' && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                  <p className="text-sm">
                    <span className="font-medium">Delivery to:</span> {order.delivery_address}
                  </p>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Order Type: {order.order_type}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">Total:</span> ৳{order.total.toFixed(2)}
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize">
                  {order.payment_status}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  via {order.payment_method || "Unknown"}
                </span>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="font-medium mb-2">Order Items</h3>
            <ul className="space-y-2">
              {order.items.map((item, index) => (
                <li key={index} className="flex justify-between">
                  <span>{item.quantity}x {item.name}</span>
                  <span>৳{(item.price * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="font-medium mb-3">Update Order Status</h3>
            <div className="flex flex-wrap gap-2">
              {ORDER_STATUSES.map(status => (
                <Button
                  key={status}
                  variant={order.status === status ? "default" : "outline"}
                  size="sm"
                  className="capitalize"
                  onClick={() => handleUpdateOrderStatus(status)}
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
          
          {order.order_type === 'delivery' && (
            <>
              <Separator />
              <div>
                <h3 className="font-medium mb-3">Delivery Management</h3>
                
                {deliveryStatus ? (
                  <div className="space-y-2">
                    <p className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Driver:</span> {deliveryStatus.driver_name}
                    </p>
                    <p>
                      <span className="font-medium">Status:</span>{" "}
                      <Badge className="capitalize">{deliveryStatus.status}</Badge>
                    </p>
                    {deliveryStatus.delivered_at && (
                      <p>
                        <span className="font-medium">Delivered at:</span> {formatDate(deliveryStatus.delivered_at)}
                      </p>
                    )}
                    
                    {/* Update delivery status buttons */}
                    {deliveryStatus.status !== 'delivered' && (
                      <div className="mt-2">
                        <h4 className="font-medium mb-2">Update Delivery Status:</h4>
                        <div className="flex gap-2">
                          {deliveryStatus.status === 'assigned' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => orderService.updateDeliveryStatus(orderId, 'picked_up')}
                            >
                              Mark as Picked Up
                            </Button>
                          )}
                          
                          {(deliveryStatus.status === 'assigned' || deliveryStatus.status === 'picked_up') && (
                            <Button
                              size="sm"
                              onClick={() => orderService.updateDeliveryStatus(orderId, 'delivered')}
                            >
                              Mark as Delivered
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 items-end">
                    <div className="col-span-2">
                      <Label htmlFor="driver" className="mb-2 block">Select Driver</Label>
                      <Select
                        value={selectedDriver}
                        onValueChange={setSelectedDriver}
                      >
                        <SelectTrigger id="driver">
                          <SelectValue placeholder="Select a driver" />
                        </SelectTrigger>
                        <SelectContent>
                          {drivers.map(driver => (
                            <SelectItem key={driver.id} value={driver.id}>
                              {driver.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      onClick={handleAssignDriver}
                      disabled={!selectedDriver}
                      className="h-10"
                    >
                      Assign Driver
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
          
          <Separator />
          
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="h-4 w-4" />
              <h3 className="font-medium">Customer Communication</h3>
            </div>
            
            <div className="bg-muted/50 rounded-lg p-3 max-h-60 overflow-y-auto space-y-3 mb-3">
              {messages.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-3">
                  No messages yet
                </p>
              ) : (
                messages.map((msg, index) => {
                  const isCurrentUser = msg.sender_id === user?.id;
                  return (
                    <div 
                      key={index}
                      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] rounded-lg p-3 ${
                        isCurrentUser 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-background border'
                      }`}>
                        <p className="text-xs font-semibold">
                          {isCurrentUser 
                            ? 'You' 
                            : `${msg.sender_role.charAt(0).toUpperCase() + msg.sender_role.slice(1)}`}
                        </p>
                        <p>{msg.message}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {formatDate(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            
            <div className="flex gap-2">
              <Textarea 
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Type a message to the customer..."
                className="flex-1"
              />
              <Button 
                onClick={handleSendMessage}
                size="icon"
                disabled={!newMessage.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderDetailsManagement;
