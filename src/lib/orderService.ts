import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Order, transformOrderItems } from "@/lib/supabase";
import { OrderMessage, DeliveryAssignment } from "@/integrations/supabase/database.types";
import { safeQuery, safeCast } from "./supabaseHelper";
import { validateAndSanitizeOrderData } from "./inputSanitizer";

export const orderService = {
  // Create a new order
  createOrder: async (orderData: any): Promise<string | null> => {
    try {
      console.log('Creating new order:', orderData);
      
      // Sanitize order data
      const sanitizedData = validateAndSanitizeOrderData(orderData);
      
      // Ensure we have all required fields and correct order_type values
      const completeOrderData = {
        id: crypto.randomUUID(),
        customer_name: sanitizedData.customer_name,
        customer_email: sanitizedData.customer_email,
        customer_phone: sanitizedData.customer_phone,
        customer_id: sanitizedData.customer_id || null,
        delivery_address: sanitizedData.delivery_address || null,
        order_type: sanitizedData.order_type || 'delivery', // Ensure valid order type
        items: sanitizedData.items,
        total: sanitizedData.total,
        payment_method: sanitizedData.payment_method,
        payment_status: sanitizedData.payment_status || 'pending',
        status: sanitizedData.status || 'pending',
        special_requests: sanitizedData.special_requests || null,
        created_at: new Date().toISOString()
      };

      // Validate order_type to ensure it matches database constraint
      const validOrderTypes = ['delivery', 'pickup', 'dine_in'];
      if (!validOrderTypes.includes(completeOrderData.order_type)) {
        console.error('Invalid order_type:', completeOrderData.order_type);
        completeOrderData.order_type = 'delivery'; // Default to delivery
      }
      
      console.log('Final order data to insert:', completeOrderData);
      
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
  
  // Get order by ID - Simplified with better error handling
  getOrderById: async (orderId: string): Promise<Order | null> => {
    try {
      console.log('Fetching order by ID:', orderId);
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
      
      if (error) {
        console.error('Error fetching order:', error);
        if (error.code === 'PGRST116') {
          console.log('Order not found');
          return null;
        }
        throw error;
      }
      
      if (!data) {
        console.log('No order data returned');
        return null;
      }
      
      console.log('Order fetched successfully:', data);
      
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
      toast({
        title: "Failed to load order",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  },
  
  // Update order status - Simplified
  updateOrderStatus: async (orderId: string, status: Order['status']): Promise<boolean> => {
    try {
      console.log('Updating order status:', { orderId, status });
      
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);
      
      if (error) {
        console.error('Supabase error updating order status:', error);
        throw error;
      }
      
      console.log('Order status updated successfully');
      
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
  
  // Get order messages - Simplified
  getOrderMessages: async (orderId: string): Promise<OrderMessage[]> => {
    try {
      console.log('Fetching order messages for order:', orderId);
      
      const { data, error } = await supabase
        .from('order_messages')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching order messages:', error);
        throw error;
      }
      
      console.log('Order messages fetched:', data?.length || 0);
      
      return safeCast<OrderMessage[]>(data || []);
    } catch (error: any) {
      console.error('Error fetching order messages:', error);
      return [];
    }
  },
  
  // Send order message - Simplified
  sendOrderMessage: async (message: Omit<OrderMessage, 'id' | 'created_at'>): Promise<boolean> => {
    try {
      console.log('Sending order message:', message);
      
      const { error } = await supabase
        .from('order_messages')
        .insert([message as any]);
      
      if (error) {
        console.error('Error sending order message:', error);
        throw error;
      }
      
      console.log('Order message sent successfully');
      
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

  // Get all orders for admin/staff - Simplified
  getAllOrders: async (): Promise<Order[]> => {
    try {
      console.log('Fetching all orders for admin/staff');
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching all orders:', error);
        throw error;
      }
      
      console.log('Orders fetched successfully:', data?.length || 0);
      
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
