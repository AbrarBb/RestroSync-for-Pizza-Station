
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

export interface DeliveryMetrics {
  totalDeliveries: number;
  activeDeliveries: number;
  completedToday: number;
  averageDeliveryTime: number;
  onTimeDeliveryRate: number;
}

export const deliveryService = {
  // Get available drivers
  getAvailableDrivers: async (): Promise<DeliveryDriver[]> => {
    try {
      // Enhanced mock data with more realistic information
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
        },
        {
          id: 'driver-4',
          name: 'Saidul Islam',
          phone: '+880123456786',
          status: 'delivering',
          rating: 4.7,
          vehicle_type: 'motorcycle',
          current_location: {
            lat: 23.8090,
            lng: 90.4200
          }
        },
        {
          id: 'driver-5',
          name: 'Jamal Hossain',
          phone: '+880123456785',
          status: 'offline',
          rating: 4.5,
          vehicle_type: 'car',
          current_location: {
            lat: 23.8150,
            lng: 90.4100
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
      console.log('Assigning delivery:', { orderId, driverId });
      
      // Get driver info
      const drivers = await deliveryService.getAvailableDrivers();
      const driver = drivers.find(d => d.id === driverId);
      
      if (!driver) {
        throw new Error('Driver not found');
      }
      
      if (driver.status !== 'available') {
        throw new Error('Driver is not available');
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
        title: "Driver assigned successfully",
        description: `${driver.name} has been assigned to this delivery.`,
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
      const mockUpdates = [
        {
          id: 'update-1',
          assignment_id: assignmentId,
          status: 'picked_up' as const,
          timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
          location: {
            lat: 23.8103,
            lng: 90.4125
          },
          notes: 'Order picked up from restaurant'
        },
        {
          id: 'update-2',
          assignment_id: assignmentId,
          status: 'in_transit' as const,
          timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
          location: {
            lat: 23.7990,
            lng: 90.4200
          },
          notes: 'En route to delivery address'
        }
      ];
      
      return mockUpdates;
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
      console.log(`Updating delivery ${assignmentId} status to ${status}`);
      
      // Update delivery_assignments table
      const updates: any = { status };
      
      if (status === 'delivered') {
        updates.delivered_at = new Date().toISOString();
      }
      
      const { error } = await safeQuery('delivery_assignments')
        .update(updates)
        .eq('id', assignmentId);
      
      if (error) throw error;
      
      // If delivered, also update the order status
      if (status === 'delivered') {
        const { data: assignment } = await safeQuery('delivery_assignments')
          .select('order_id')
          .eq('id', assignmentId)
          .single();
        
        if (assignment) {
          const { error: orderError } = await supabase
            .from('orders')
            .update({ status: 'delivered' })
            .eq('id', assignment.order_id);
          
          if (orderError) console.error('Error updating order status:', orderError);
        }
      }
      
      toast({
        title: "Delivery status updated",
        description: `Status updated to ${status.replace('_', ' ')}`,
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
      // In a real app, this would fetch real-time location data
      const drivers = await deliveryService.getAvailableDrivers();
      const driver = drivers.find(d => d.id === driverId);
      
      return driver?.current_location || null;
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
  },
  
  // Get delivery metrics
  getDeliveryMetrics: async (): Promise<DeliveryMetrics> => {
    try {
      // In a real app, this would calculate from actual data
      return {
        totalDeliveries: 150,
        activeDeliveries: 12,
        completedToday: 25,
        averageDeliveryTime: 28, // minutes
        onTimeDeliveryRate: 92.5 // percentage
      };
    } catch (error: any) {
      console.error('Error fetching delivery metrics:', error);
      return {
        totalDeliveries: 0,
        activeDeliveries: 0,
        completedToday: 0,
        averageDeliveryTime: 0,
        onTimeDeliveryRate: 0
      };
    }
  },
  
  // Get delivery history
  getDeliveryHistory: async (driverId?: string): Promise<DeliveryAssignment[]> => {
    try {
      let query = safeQuery('delivery_assignments')
        .select('*')
        .order('assigned_at', { ascending: false });
      
      if (driverId) {
        query = query.eq('driver_id', driverId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return safeCast<DeliveryAssignment[]>(data || []);
    } catch (error: any) {
      console.error('Error fetching delivery history:', error);
      return [];
    }
  },
  
  // Update driver status
  updateDriverStatus: async (driverId: string, status: DeliveryDriver['status']): Promise<boolean> => {
    try {
      // In a real app, this would update the drivers table
      console.log(`Updating driver ${driverId} status to ${status}`);
      
      toast({
        title: "Driver status updated",
        description: `Driver status changed to ${status}`,
      });
      
      return true;
    } catch (error: any) {
      console.error('Error updating driver status:', error);
      toast({
        title: "Failed to update driver status",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  }
};
