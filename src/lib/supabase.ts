
// This file will be deprecated in favor of using the Supabase integration client directly

import { createClient } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';
import { supabase as supabaseClient } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

// Export the proper supabase client from the integration
export const supabase = supabaseClient;

// Database types based on your schema
export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  status: "active" | "out-of-stock" | "seasonal";
  image_url?: string;
  created_at?: string;
}

// Updated Order type with proper items handling
export type Order = {
  id: string;
  customer_id?: string;
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  status: "pending" | "preparing" | "ready" | "delivered" | "cancelled";
  total: number;
  order_type: "delivery" | "pickup" | "dine-in";
  created_at: string;
  delivery_address?: string;
  rider_id?: string;
  table_number?: string;
  payment_method?: string;
  payment_status: "paid" | "pending";
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
}

// Helper function to transform Json to properly typed Order items
export const transformOrderItems = (jsonItems: Json): Order['items'] => {
  if (!jsonItems) return [];
  
  // Function to safely transform a single item
  const transformItem = (item: any): Order['items'][0] => {
    if (typeof item !== 'object' || item === null) {
      return { id: '', name: '', price: 0, quantity: 1 };
    }
    
    return {
      id: String(item.id || ''),
      name: String(item.name || ''),
      price: Number(item.price || 0),
      quantity: Number(item.quantity || 1)
    };
  };
  
  // Handle array case
  if (Array.isArray(jsonItems)) {
    return jsonItems.map(transformItem);
  }
  
  // Handle string case (parse JSON)
  if (typeof jsonItems === 'string') {
    try {
      const parsed = JSON.parse(jsonItems);
      if (Array.isArray(parsed)) {
        return parsed.map(transformItem);
      }
    } catch (e) {
      console.error('Error parsing order items:', e);
    }
  }
  
  // Handle object case with key-value pairs
  if (typeof jsonItems === 'object' && jsonItems !== null) {
    // Check if it's a non-array object that might contain items
    if ('items' in jsonItems && Array.isArray(jsonItems.items)) {
      return jsonItems.items.map(transformItem);
    }
    
    // Last resort: try to convert the object itself to an array if possible
    try {
      const objValues = Object.values(jsonItems);
      if (Array.isArray(objValues) && objValues.length > 0) {
        return objValues.map(transformItem);
      }
    } catch (e) {
      console.error('Error processing order items object:', e);
    }
  }
  
  // Default empty array if nothing else works
  return [];
};

// Database service for menu items
export const menuItemsService = {
  getAll: async () => {
    console.log("Fetching all menu items");
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching menu items:', error);
      return [];
    }
    
    console.log("Retrieved menu items:", data);
    return data || [];
  },
  
  getByCategory: async (category: string) => {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching menu items by category:', error);
      return [];
    }
    
    return data || [];
  },
  
  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching menu item by id:', error);
      return null;
    }
    
    return data;
  },
  
  create: async (item: Omit<MenuItem, 'id' | 'created_at'>) => {
    console.log("Creating menu item:", item);
    const { data, error } = await supabase
      .from('menu_items')
      .insert([item]);
    
    if (error) {
      console.error('Error creating menu item:', error);
      throw error;
    }
    
    console.log("Created menu item:", data);
    return data;
  },
  
  update: async (id: string, item: Partial<MenuItem>) => {
    const { data, error } = await supabase
      .from('menu_items')
      .update(item)
      .eq('id', id);
    
    if (error) {
      console.error('Error updating menu item:', error);
      throw error;
    }
    
    return data;
  },
  
  delete: async (id: string) => {
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting menu item:', error);
      throw error;
    }
    
    return true;
  },
  
  uploadImage: async (file: File, path: string) => {
    console.log("Uploading image:", path);
    const { data, error } = await supabase.storage
      .from('menu_images')
      .upload(path, file);
    
    if (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
    
    const { data: urlData } = supabase.storage
      .from('menu_images')
      .getPublicUrl(path);
    
    console.log("Image URL:", urlData.publicUrl);
    return urlData.publicUrl;
  }
};

// Database service for orders
export const ordersService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
    
    return data || [];
  },
  
  getByCustomerId: async (customerId: string) => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching orders by customer id:', error);
      return [];
    }
    
    return data || [];
  },
  
  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching order by id:', error);
      return null;
    }
    
    return data;
  },
  
  create: async (order: Omit<Order, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('orders')
      .insert([order]);
    
    if (error) {
      console.error('Error creating order:', error);
      throw error;
    }
    
    return data;
  },
  
  updateStatus: async (id: string, status: Order['status']) => {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id);
    
    if (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
    
    return data;
  },
  
  getRecentOrders: async (limit = 5) => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching recent orders:', error);
      return [];
    }
    
    // Transform the orders to have properly typed items
    return data?.map(order => ({
      ...order,
      items: transformOrderItems(order.items),
      status: order.status as Order['status'],
      order_type: order.order_type as Order['order_type'],
      payment_status: order.payment_status as Order['payment_status']
    })) || [];
  }
};
