
import { createClient } from '@supabase/supabase-js';

// These environment variables need to be set in your Supabase project
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a mock client for development when credentials aren't available
const mockSupabaseClient = {
  auth: {
    getSession: () => Promise.resolve({ data: { session: null } }),
    onAuthStateChange: () => {
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
    signInWithPassword: () => Promise.resolve({ data: {}, error: null }),
    signUp: () => Promise.resolve({ data: {}, error: null }),
    signOut: () => Promise.resolve({ error: null }),
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        single: () => Promise.resolve({ data: null, error: null }),
        order: () => ({
          limit: () => Promise.resolve({ data: [], error: null })
        })
      }),
      order: () => ({
        limit: () => Promise.resolve({ data: [], error: null })
      })
    }),
    insert: () => Promise.resolve({ data: null, error: null }),
    update: () => ({
      eq: () => Promise.resolve({ data: null, error: null })
    }),
    delete: () => ({
      eq: () => Promise.resolve({ data: null, error: null })
    }),
  }),
  storage: {
    from: () => ({
      upload: () => Promise.resolve({ data: null, error: null }),
      getPublicUrl: () => ({ data: { publicUrl: '' } }),
    }),
  },
};

// Create a single supabase client for the entire app
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : mockSupabaseClient as any;

// Function to handle when Supabase is not initialized
export const getSupabase = () => {
  console.log("Getting Supabase client (real or mock)");
  return supabase;
};

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

export type Order = {
  id: string;
  customer_id?: string;
  items: object[];
  status: "pending" | "preparing" | "ready" | "delivered" | "cancelled";
  total: number;
  order_type: "delivery" | "pickup" | "dine-in";
  created_at: string;
  delivery_address?: string;
  rider_id?: string;
  table_number?: string;
  payment_method?: string;
  payment_status?: "paid" | "pending";
  customer_name?: string; // Added for guest orders
  customer_email?: string; // Added for guest orders
  customer_phone?: string; // Added for guest orders
}

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  created_at?: string;
}

export type Reservation = {
  id: string;
  customer_id: string;
  date: string;
  time: string;
  guests: number;
  special_requests?: string;
  status: "confirmed" | "cancelled" | "completed";
  created_at?: string;
}

export type Staff = {
  id: string;
  name: string;
  position: string;
  phone: string;
  email: string;
  status: "active" | "on-leave" | "off-duty";
  join_date: string;
  salary: number;
}

export type DeliveryRider = {
  id: string;
  name: string;
  phone: string;
  status: "available" | "delivering" | "off-duty";
  active_deliveries: number;
  completed_today: number;
  rating: number;
  join_date: string;
}

export type InventoryItem = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  threshold: number;
  last_restocked: string;
  supplier?: string;
}

// Database service for menu items
export const menuItemsService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching menu items:', error);
      return [];
    }
    
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
    const { data, error } = await supabase
      .from('menu_items')
      .insert([item]);
    
    if (error) {
      console.error('Error creating menu item:', error);
      throw error;
    }
    
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
    
    return data || [];
  }
};

