
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { orderService } from "@/lib/orderService";
import { supabase } from "@/integrations/supabase/client"; 
import { useAuth } from "@/contexts/AuthContext";
import { OrderMessage, DeliveryAssignment } from "@/integrations/supabase/database.types";
import { Order, transformOrderItems } from "@/lib/supabase";
import { Loader2, MessageSquare, Send, Package, User, MapPin, CalendarClock } from "lucide-react";

interface OrderTrackerProps {
  orderId: string;
}

const OrderTracker = ({ orderId }: OrderTrackerProps) => {
  const { user, userRole } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<OrderMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryAssignment | null>(null);
  
  // Fetch order details, messages and delivery status
  useEffect(() => {
    const fetchOrderData = async () => {
      if (!orderId) return;
      
      try {
        setLoading(true);
        
        // Fetch order
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();
        
        if (error) throw error;
        
        const orderData = {
          ...data,
          items: transformOrderItems(data.items),
          status: data.status as Order['status'],
          order_type: data.order_type as Order['order_type'],
          payment_status: data.payment_status as Order['payment_status']
        };
        
        setOrder(orderData);
        
        // Fetch messages
        const orderMessages = await orderService.getOrderMessages(orderId);
        setMessages(orderMessages);
        
        // Fetch delivery status if applicable
        if (orderData.order_type === 'delivery') {
          const assignment = await orderService.getDeliveryAssignment(orderId);
          setDeliveryStatus(assignment);
        }
      } catch (error) {
        console.error("Error fetching order data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderData();
    
    // Set up real-time subscription for messages
    const channel = supabase
      .channel('order_messages_changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'order_messages',
        filter: `order_id=eq.${orderId}`
      }, payload => {
        setMessages(prev => [...prev, payload.new as OrderMessage]);
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
        setDeliveryStatus(payload.new as DeliveryAssignment);
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
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
            <CardTitle>Order #{order.id.substring(0, 8)}</CardTitle>
            <Badge className={`${getStatusColor(order.status)} capitalize`}>
              {order.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Placed: {formatDate(order.created_at)}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Customer: {order.customer_name || "Anonymous"}
                </span>
              </div>
              
              {order.order_type === 'delivery' && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Delivery to: {order.delivery_address}
                  </span>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Order Type: {order.order_type}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm font-medium">
                Total: ৳{order.total.toFixed(2)}
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
          
          {deliveryStatus && (
            <>
              <Separator />
              <div>
                <h3 className="font-medium mb-2">Delivery Information</h3>
                <div className="space-y-2">
                  <p>Driver: {deliveryStatus.driver_name}</p>
                  <p>Status: 
                    <Badge className="ml-2 capitalize">
                      {deliveryStatus.status}
                    </Badge>
                  </p>
                  {deliveryStatus.delivered_at && (
                    <p>Delivered at: {formatDate(deliveryStatus.delivered_at)}</p>
                  )}
                </div>
              </div>
            </>
          )}
          
          <Separator />
          
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="h-4 w-4" />
              <h3 className="font-medium">Messages</h3>
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
                placeholder="Type a message..."
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

export default OrderTracker;
