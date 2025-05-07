
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
  // Add other mock methods as needed
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
