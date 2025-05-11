
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { safeQuery, safeCast } from "./supabaseHelper";

export interface InventoryItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minLevel: number;
  supplier: string;
  lastRestocked: string;
  reorderThreshold?: number;
  reorderAmount?: number;
  isAutoRestock?: boolean;
}

export const inventoryService = {
  // Get all inventory items
  getInventoryItems: async (): Promise<InventoryItem[]> => {
    try {
      // Using mock data for now, would be replaced with actual DB query
      const inventoryItems: InventoryItem[] = [
        {
          id: 1,
          name: "Mozzarella Cheese",
          category: "Dairy",
          quantity: 2.5,
          unit: "kg",
          minLevel: 5,
          supplier: "BD Dairy Suppliers",
          lastRestocked: "2025-04-30",
          reorderThreshold: 3,
          reorderAmount: 10,
          isAutoRestock: true
        },
        {
          id: 2,
          name: "Pepperoni",
          category: "Meat",
          quantity: 0.8,
          unit: "kg",
          minLevel: 2,
          supplier: "Meat Masters Ltd.",
          lastRestocked: "2025-04-29",
          reorderThreshold: 1,
          reorderAmount: 5,
          isAutoRestock: true
        },
        // ... remaining mock data items
      ];
      
      return inventoryItems;
    } catch (error: any) {
      console.error('Error fetching inventory items:', error);
      toast({
        title: "Failed to load inventory",
        description: error.message,
        variant: "destructive",
      });
      return [];
    }
  },
  
  // Check stock levels and return low stock items
  checkLowStockItems: async (): Promise<InventoryItem[]> => {
    try {
      const items = await inventoryService.getInventoryItems();
      return items.filter(item => item.quantity < item.minLevel);
    } catch (error: any) {
      console.error('Error checking low stock items:', error);
      return [];
    }
  },
  
  // Process auto-restock for eligible items
  processAutoRestock: async (): Promise<{ success: boolean; restockedItems: InventoryItem[] }> => {
    try {
      const items = await inventoryService.getInventoryItems();
      const itemsToRestock = items.filter(
        item => item.isAutoRestock && item.quantity <= item.reorderThreshold
      );
      
      const restockedItems: InventoryItem[] = [];
      
      // In a real implementation, this would create purchase orders
      // and update the inventory quantities in the database
      for (const item of itemsToRestock) {
        console.log(`Auto-reordering ${item.reorderAmount} ${item.unit} of ${item.name}`);
        
        // Simulate restock success
        const updatedItem = { 
          ...item, 
          quantity: item.quantity + (item.reorderAmount || 0),
          lastRestocked: new Date().toISOString().split('T')[0]
        };
        
        restockedItems.push(updatedItem);
        
        // Show toast notification
        toast({
          title: "Auto-restock initiated",
          description: `Ordered ${item.reorderAmount} ${item.unit} of ${item.name}`,
        });
      }
      
      return {
        success: true,
        restockedItems
      };
    } catch (error: any) {
      console.error('Error in auto-restock process:', error);
      return {
        success: false,
        restockedItems: []
      };
    }
  },
  
  // Manually restock an item
  restockItem: async (itemId: number, amount: number): Promise<boolean> => {
    try {
      // In real implementation, this would update the database
      console.log(`Manually restocking item #${itemId} with ${amount} units`);
      
      // Show success toast
      toast({
        title: "Restock order placed",
        description: `Order placed for item #${itemId}`,
      });
      
      return true;
    } catch (error: any) {
      console.error('Error restocking item:', error);
      toast({
        title: "Restock failed",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  },
  
  // Send email alerts for low stock items
  sendLowStockAlerts: async (): Promise<boolean> => {
    try {
      const lowStockItems = await inventoryService.checkLowStockItems();
      
      if (lowStockItems.length > 0) {
        // In real implementation, this would send emails via an API
        console.log(`Sending email alerts for ${lowStockItems.length} low stock items`);
        
        toast({
          title: "Stock alerts sent",
          description: `Alerts sent for ${lowStockItems.length} items`,
        });
      }
      
      return true;
    } catch (error: any) {
      console.error('Error sending stock alerts:', error);
      return false;
    }
  }
};
