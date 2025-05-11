
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { safeQuery, safeCast } from "./supabaseHelper";
import { DeliveryAssignment } from "@/integrations/supabase/database.types";

export interface DeliveryDriver {
  id: string;
  name: string;
  phone: string;
  status: 'available' | 'delivering' | 'offline';
  rating: number;
  vehicle_type: 'motorcycle' | 'bicycle' | 'car';
  current_location?: {
    lat: number;
    lng: number;
  };
}

export interface DeliveryUpdate {
  id: string;
  assignment_id: string;
  status: 'picked_up' | 'in_transit' | 'at_destination' | 'delivered' | 'failed';
  timestamp: string;
  location?: {
    lat: number;
    lng: number;
  };
  notes?: string;
}

export const deliveryService = {
  // Get available drivers
  getAvailableDrivers: async (): Promise<DeliveryDriver[]> => {
    try {
      // Mock data - would be replaced with actual DB call
      return [
        {
          id: 'driver-1',
          name: 'Rafiq Ahmed',
          phone: '+880123456789',
          status: 'available',
          rating: 4.8,
          vehicle_type: 'motorcycle',
          current_location: {
            lat: 23.8103,
            lng: 90.4125
          }
        },
        {
          id: 'driver-2',
          name: 'Karim Khan',
          phone: '+880123456788',
          status: 'available',
          rating: 4.6,
          vehicle_type: 'motorcycle',
          current_location: {
            lat: 23.8139,
            lng: 90.4136
          }
        },
        {
          id: 'driver-3',
          name: 'Ahmed Ali',
          phone: '+880123456787',
          status: 'available',
          rating: 4.9,
          vehicle_type: 'bicycle',
          current_location: {
            lat: 23.8125,
            lng: 90.4148
          }
        }
      ];
    } catch (error: any) {
      console.error('Error fetching available drivers:', error);
      return [];
    }
  },
  
  // Assign delivery
  assignDelivery: async (orderId: string, driverId: string): Promise<boolean> => {
    try {
      // Get driver info (would be from real DB in production)
      const drivers = await deliveryService.getAvailableDrivers();
      const driver = drivers.find(d => d.id === driverId);
      
      if (!driver) {
        throw new Error('Driver not found');
      }
      
      // Create assignment
      const assignment: Omit<DeliveryAssignment, 'id' | 'assigned_at' | 'delivered_at'> = {
        order_id: orderId,
        driver_id: driverId,
        driver_name: driver.name,
        status: 'assigned'
      };
      
      const { error } = await safeQuery('delivery_assignments')
        .insert([{
          ...assignment,
          assigned_at: new Date().toISOString(),
          delivered_at: null
        } as any]);
      
      if (error) throw error;
      
      // Update order status
      const { error: orderError } = await supabase
        .from('orders')
        .update({ status: 'delivering' })
        .eq('id', orderId);
      
      if (orderError) throw orderError;
      
      toast({
        title: "Driver assigned",
        description: `${driver.name} has been assigned to this order.`,
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
  
  // Get delivery status updates
  getDeliveryUpdates: async (assignmentId: string): Promise<DeliveryUpdate[]> => {
    try {
      // Mock data - would be replaced with actual DB call
      return [
        {
          id: 'update-1',
          assignment_id: assignmentId,
          status: 'picked_up',
          timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
          location: {
            lat: 23.8103,
            lng: 90.4125
          }
        },
        {
          id: 'update-2',
          assignment_id: assignmentId,
          status: 'in_transit',
          timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
          location: {
            lat: 23.7990,
            lng: 90.4200
          }
        }
      ];
    } catch (error: any) {
      console.error('Error fetching delivery updates:', error);
      return [];
    }
  },
  
  // Update delivery status
  updateDeliveryStatus: async (
    assignmentId: string, 
    status: DeliveryUpdate['status'],
    location?: { lat: number; lng: number },
    notes?: string
  ): Promise<boolean> => {
    try {
      // In real implementation, this would:
      // 1. Update delivery_assignments table status
      // 2. Insert a new record in delivery_updates table
      // 3. Update the order status if delivered
      
      console.log(`Updating delivery ${assignmentId} status to ${status}`);
      
      // If delivered, update the delivered_at timestamp
      if (status === 'delivered') {
        const { error } = await safeQuery('delivery_assignments')
          .update({
            status: 'delivered',
            delivered_at: new Date().toISOString()
          } as any)
          .eq('id', assignmentId);
        
        if (error) throw error;
        
        // We would also update the orders table in a real implementation
      }
      
      toast({
        title: "Delivery status updated",
        description: `Status updated to ${status}`,
      });
      
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
  
  // Get current driver location
  getDriverLocation: async (driverId: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      // Mock location data - would be replaced with real-time data
      return {
        lat: 23.7940,
        lng: 90.4043
      };
    } catch (error: any) {
      console.error('Error fetching driver location:', error);
      return null;
    }
  },
  
  // Confirm delivery
  confirmDelivery: async (assignmentId: string): Promise<boolean> => {
    try {
      const { error } = await safeQuery('delivery_assignments')
        .update({
          status: 'delivered',
          delivered_at: new Date().toISOString()
        } as any)
        .eq('id', assignmentId);
      
      if (error) throw error;
      
      toast({
        title: "Delivery confirmed",
        description: "The order has been marked as delivered",
      });
      
      return true;
    } catch (error: any) {
      console.error('Error confirming delivery:', error);
      toast({
        title: "Failed to confirm delivery",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  }
};
