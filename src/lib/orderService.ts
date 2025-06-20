import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Order, transformOrderItems } from "@/lib/supabase";
import { OrderMessage, DeliveryAssignment } from "@/integrations/supabase/database.types";
import { safeQuery, safeCast } from "./supabaseHelper";

export const orderService = {
  // Create a new order
  createOrder: async (orderData: any): Promise<string | null> => {
    try {
      console.log('Creating new order:', orderData);
      
      // Ensure we have all required fields
      const completeOrderData = {
        id: crypto.randomUUID(),
        customer_name: orderData.customer_name,
        customer_email: orderData.customer_email,
        customer_phone: orderData.customer_phone,
        customer_id: orderData.customer_id || null,
        delivery_address: orderData.delivery_address || null,
        order_type: orderData.order_type || 'delivery',
        items: orderData.items,
        total: orderData.total,
        payment_method: orderData.payment_method,
        payment_status: orderData.payment_status || 'pending',
        status: orderData.status || 'pending',
        special_requests: orderData.special_requests || null,
        created_at: new Date().toISOString()
      };
      
      // Insert data and get result
      const { data, error } = await supabase
        .from('orders')
        .insert(completeOrderData)
        .select('id')
        .single();
      
      if (error) {
        console.error('Error inserting order:', error);
        throw error;
      }
      
      // Return the ID from our generated UUID
      const orderId = completeOrderData.id;
      console.log('Order created successfully:', orderId);
      
      toast({
        title: "Order placed successfully",
        description: `Your order has been received. Order ID: ${orderId.substring(0, 8)}`,
      });
      
      return orderId;
    } catch (error: any) {
      console.error('Error creating order:', error);
      toast({
        title: "Failed to place order",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  },
  
  getCustomerOrders: async (customerId: string): Promise<Order[]> => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data?.map(order => ({
        ...order,
        items: transformOrderItems(order.items),
        status: order.status as Order['status'],
        order_type: order.order_type as Order['order_type'],
        payment_status: order.payment_status as Order['payment_status']
      })) || [];
    } catch (error: any) {
      console.error('Error fetching customer orders:', error);
      toast({
        title: "Failed to load orders",
        description: error.message,
        variant: "destructive",
      });
      return [];
    }
  },
  
  // Get order by ID
  getOrderById: async (orderId: string): Promise<Order | null> => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
      
      if (error) throw error;
      
      // Transform to properly typed order
      return {
        ...data,
        items: transformOrderItems(data.items),
        status: data.status as Order['status'],
        order_type: data.order_type as Order['order_type'],
        payment_status: data.payment_status as Order['payment_status']
      };
    } catch (error: any) {
      console.error('Error fetching order details:', error);
      return null;
    }
  },
  
  // Update order status
  updateOrderStatus: async (orderId: string, status: Order['status']): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);
      
      if (error) throw error;
      
      toast({
        title: "Order status updated",
        description: `Order status has been updated to ${status}`
      });
      
      return true;
    } catch (error: any) {
      console.error('Error updating order status:', error);
      toast({
        title: "Failed to update status",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  },
  
  // Get order messages
  getOrderMessages: async (orderId: string): Promise<OrderMessage[]> => {
    try {
      const { data, error } = await safeQuery('order_messages')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      return safeCast<OrderMessage[]>(data || []);
    } catch (error: any) {
      console.error('Error fetching order messages:', error);
      return [];
    }
  },
  
  // Send order message
  sendOrderMessage: async (message: Omit<OrderMessage, 'id' | 'created_at'>): Promise<boolean> => {
    try {
      console.log('Sending order message:', message);
      const { error } = await safeQuery('order_messages')
        .insert([message as any]);
      
      if (error) throw error;
      
      return true;
    } catch (error: any) {
      console.error('Error sending order message:', error);
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  },
  
  // Assign delivery driver
  assignDeliveryDriver: async (assignment: Omit<DeliveryAssignment, 'id' | 'assigned_at' | 'delivered_at'>): Promise<boolean> => {
    try {
      const { error } = await safeQuery('delivery_assignments')
        .insert([{
          ...assignment,
          assigned_at: new Date().toISOString(),
          delivered_at: null
        } as any]);
      
      if (error) throw error;
      
      // Update order status to "delivering"
      const { error: orderError } = await supabase
        .from('orders')
        .update({ status: 'delivering' })
        .eq('id', assignment.order_id);
      
      if (orderError) throw orderError;
      
      toast({
        title: "Driver assigned",
        description: `${assignment.driver_name} has been assigned to this order.`,
      });
      
      return true;
    } catch (error: any) {
      console.error('Error assigning delivery driver:', error);
      toast({
        title: "Failed to assign driver",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  },
  
  // Update delivery status
  updateDeliveryStatus: async (orderId: string, status: DeliveryAssignment['status']): Promise<boolean> => {
    try {
      const updates: Partial<DeliveryAssignment> = { status };
      
      if (status === 'delivered') {
        updates.delivered_at = new Date().toISOString();
      }
      
      const { error } = await safeQuery('delivery_assignments')
        .update(updates as any)
        .eq('order_id', orderId);
      
      if (error) throw error;
      
      // Update order status if delivered
      if (status === 'delivered') {
        const { error: orderError } = await supabase
          .from('orders')
          .update({ status: 'delivered' })
          .eq('id', orderId);
        
        if (orderError) throw orderError;
      }
      
      return true;
    } catch (error: any) {
      console.error('Error updating delivery status:', error);
      toast({
        title: "Failed to update status",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  },
  
  // Get delivery assignment for an order
  getDeliveryAssignment: async (orderId: string): Promise<DeliveryAssignment | null> => {
    try {
      const { data, error } = await safeQuery('delivery_assignments')
        .select('*')
        .eq('order_id', orderId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No delivery assignment found
          return null;
        }
        throw error;
      }
      
      return safeCast<DeliveryAssignment>(data);
    } catch (error: any) {
      console.error('Error fetching delivery assignment:', error);
      return null;
    }
  },

  // Get all orders for admin/staff
  getAllOrders: async (): Promise<Order[]> => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data?.map(order => ({
        ...order,
        items: transformOrderItems(order.items),
        status: order.status as Order['status'],
        order_type: order.order_type as Order['order_type'],
        payment_status: order.payment_status as Order['payment_status']
      })) || [];
    } catch (error: any) {
      console.error('Error fetching all orders:', error);
      toast({
        title: "Failed to load orders",
        description: error.message,
        variant: "destructive",
      });
      return [];
    }
  }
};
